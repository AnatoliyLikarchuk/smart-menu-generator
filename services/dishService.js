// Центральный сервис для получения и обработки блюд

import { ScoringService } from './scoringService.js';
import { FilterService } from './filterService.js';
import { 
  getAvailableCategoriesForMealType, 
  getCategoriesWithDietaryRestrictions 
} from '../data/categories.js';
import { validateCuisines } from '../data/cuisines.js';
import { getCurrentMealType, getContextualPreferences } from '../utils/timeUtils.js';
import { API_CONFIG, API_STATUS } from '../utils/constants.js';

/**
 * Центральный сервис для работы с блюдами
 */
export class DishService {
  
  /**
   * Получает умно подобранное блюдо на основе всех факторов
   * @param {string} mealType - тип питания (breakfast, lunch, dinner)
   * @param {object} userPreferences - предпочтения пользователя
   * @param {object} context - контекстуальная информация
   * @returns {Promise<object>} результат с блюдом и метаданными
   */
  static async getSmartDish(mealType = null, userPreferences = {}, context = null) {
    try {
      // Определяем тип питания если не указан
      if (!mealType) {
        mealType = getCurrentMealType();
      }
      
      // Получаем контекст если не передан
      if (!context) {
        context = getContextualPreferences();
      }
      
      console.log(`[DishService] Получение умного блюда для ${mealType}`);
      
      // Получаем блюда из API
      const dishes = await this.fetchDishesFromAPI(mealType, userPreferences);
      
      if (!dishes || dishes.length === 0) {
        console.log('[DishService] Нет блюд из API, используем fallback');
        return await this.getFallbackDish(mealType, userPreferences);
      }
      
      // Фильтруем блюда по предпочтениям
      const filteredDishes = FilterService.filterByPreferences(dishes, userPreferences);
      
      if (filteredDishes.length === 0) {
        console.log('[DishService] Нет блюд после фильтрации, используем fallback');
        return await this.getFallbackDish(mealType, userPreferences);
      }
      
      // Оцениваем блюда (теперь асинхронно)
      const scoredDishes = await ScoringService.scoreDishes(
        filteredDishes, 
        mealType, 
        userPreferences, 
        context
      );
      
      if (scoredDishes.length === 0) {
        console.log('[DishService] Нет блюд после оценки, используем fallback');
        return await this.getFallbackDish(mealType, userPreferences);
      }
      
      // Фильтруем по предпочитаемой сложности и времени готовки после анализа
      const complexityFilteredDishes = FilterService.filterByComplexity(scoredDishes, userPreferences);
      const timeFilteredDishes = FilterService.filterByMaxCookingTime(complexityFilteredDishes, userPreferences);
      
      // Выбираем из каких блюд делать финальный выбор
      const dishesToSelect = timeFilteredDishes.length > 0 ? timeFilteredDishes : scoredDishes;
      
      if (timeFilteredDishes.length === 0) {
        console.log('[DishService] Нет блюд после фильтрации по сложности/времени, используем все');
      }
      
      // Выбираем лучшее блюдо
      const selectedDishes = FilterService.weightedRandomSelect(dishesToSelect, 1);
      
      if (selectedDishes.length === 0) {
        console.log('[DishService] Нет выбранных блюд, используем fallback');
        return await this.getFallbackDish(mealType, userPreferences);
      }
      
      const selectedDish = selectedDishes[0];
      
      console.log(`[DishService] Выбрано блюдо: ${selectedDish.dish.strMeal} (оценка: ${selectedDish.score})`);
      
      return {
        status: API_STATUS.SUCCESS,
        dish: selectedDish.dish,
        analysis: selectedDish.analysis,
        score: selectedDish.score,
        scoreCategory: selectedDish.scoreCategory,
        mealType,
        context,
        metadata: {
          totalDishesFound: dishes.length,
          dishesAfterFiltering: filteredDishes.length,
          dishesAfterScoring: scoredDishes.length,
          selectionMethod: 'smart_algorithm',
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[DishService] Ошибка получения умного блюда:', error);
      return await this.getFallbackDish(mealType, userPreferences);
    }
  }
  
  /**
   * Получает блюда из внешнего API (TheMealDB)
   * @param {string} mealType - тип питания
   * @param {object} userPreferences - предпочтения пользователя
   * @returns {Promise<Array>} массив блюд
   */
  static async fetchDishesFromAPI(mealType, userPreferences = {}) {
    try {
      const allDishes = [];
      
      // Проверяем есть ли предпочтения по кухням
      const preferredCuisines = validateCuisines(userPreferences.preferredCuisines || []);
      
      if (preferredCuisines.length > 0) {
        console.log(`[DishService] Запрос блюд из предпочитаемых кухонь: ${preferredCuisines.join(', ')}`);
        
        // Создаем промисы для запросов по каждой кухне
        const cuisinePromises = preferredCuisines.map(cuisine => 
          this.fetchDishesFromCuisine(cuisine)
        );
        
        // Выполняем запросы по кухням параллельно
        const cuisineResults = await Promise.allSettled(cuisinePromises);
        
        cuisineResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            console.log(`[DishService] Кухня ${preferredCuisines[index]}: ${result.value.length} блюд`);
            allDishes.push(...result.value);
          } else {
            console.warn(`[DishService] Ошибка кухни ${preferredCuisines[index]}:`, result.reason);
          }
        });
      }
      
      // Если нет предпочтений по кухням или получено мало блюд, дополняем категориями
      if (preferredCuisines.length === 0 || allDishes.length < 50) {
        // Определяем категории для запроса с учетом диетических ограничений
        const categories = userPreferences.dietaryRestrictions && userPreferences.dietaryRestrictions.length > 0
          ? getCategoriesWithDietaryRestrictions(mealType, userPreferences.dietaryRestrictions)
          : getAvailableCategoriesForMealType(mealType, true);
        
        console.log(`[DishService] Дополняем блюдами из категорий: ${categories.join(', ')}`);
        
        // Создаем промисы для запросов по каждой категории
        const categoryPromises = categories.map(category => 
          this.fetchDishesFromCategory(category)
        );
        
        // Выполняем все запросы параллельно
        const categoryResults = await Promise.allSettled(categoryPromises);
        
        categoryResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            console.log(`[DishService] Категория ${categories[index]}: ${result.value.length} блюд`);
            allDishes.push(...result.value);
          } else {
            console.warn(`[DishService] Ошибка категории ${categories[index]}:`, result.reason);
          }
        });
      }
      
      // Удаляем дубликаты по ID
      const uniqueDishes = this.removeDuplicateDishes(allDishes);
      
      console.log(`[DishService] Всего уникальных блюд: ${uniqueDishes.length}`);
      
      return uniqueDishes;
      
    } catch (error) {
      console.error('[DishService] Ошибка получения блюд из API:', error);
      return [];
    }
  }
  
  /**
   * Получает блюда из конкретной категории
   * @param {string} category - категория блюд
   * @returns {Promise<Array>} массив блюд из категории
   */
  static async fetchDishesFromCategory(category) {
    try {
      const url = `${API_CONFIG.MEAL_DB_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.meals) {
        console.warn(`[DishService] Нет блюд в категории: ${category}`);
        return [];
      }
      
      // Получаем полную информацию для каждого блюда (включая инструкции)
      const detailedDishes = await this.fetchDetailedDishes(data.meals.slice(0, 25)); // Ограничиваем 25 блюдами на категорию для большего разнообразия
      
      return detailedDishes;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`[DishService] Таймаут запроса категории: ${category}`);
      } else {
        console.error(`[DishService] Ошибка запроса категории ${category}:`, error);
      }
      return [];
    }
  }

  /**
   * Получает блюда из конкретной кухни/региона
   * @param {string} cuisine - кухня (например, 'Italian', 'Chinese')
   * @returns {Promise<Array>} массив блюд из данной кухни
   */
  static async fetchDishesFromCuisine(cuisine) {
    try {
      const url = `${API_CONFIG.MEAL_DB_BASE_URL}/filter.php?a=${encodeURIComponent(cuisine)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.meals) {
        console.warn(`[DishService] Нет блюд в кухне: ${cuisine}`);
        return [];
      }
      
      // Получаем полную информацию для каждого блюда (включая инструкции)
      const detailedDishes = await this.fetchDetailedDishes(data.meals.slice(0, 25)); // Ограничиваем 25 блюдами на кухню
      
      return detailedDishes;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`[DishService] Таймаут запроса кухни: ${cuisine}`);
      } else {
        console.error(`[DishService] Ошибка запроса кухни ${cuisine}:`, error);
      }
      return [];
    }
  }
  
  /**
   * Получает детальную информацию о блюдах (включая инструкции)
   * @param {Array} dishes - массив блюд с базовой информацией
   * @returns {Promise<Array>} массив блюд с полной информацией
   */
  static async fetchDetailedDishes(dishes) {
    try {
      const detailPromises = dishes.map(dish => 
        this.fetchDishDetails(dish.idMeal)
      );
      
      const detailResults = await Promise.allSettled(detailPromises);
      
      const detailedDishes = [];
      
      detailResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          detailedDishes.push(result.value);
        } else {
          // Если не удалось получить детали, используем базовую информацию
          console.warn(`[DishService] Не удалось получить детали для блюда ${dishes[index].idMeal}`);
          detailedDishes.push(dishes[index]);
        }
      });
      
      return detailedDishes;
      
    } catch (error) {
      console.error('[DishService] Ошибка получения детальной информации:', error);
      return dishes; // Возвращаем базовую информацию
    }
  }
  
  /**
   * Получает детальную информацию о конкретном блюде
   * @param {string} dishId - ID блюда
   * @returns {Promise<object>} объект блюда с полной информацией
   */
  static async fetchDishDetails(dishId) {
    try {
      const url = `${API_CONFIG.MEAL_DB_BASE_URL}/lookup.php?i=${dishId}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.meals ? data.meals[0] : null;
      
    } catch (error) {
      console.error(`[DishService] Ошибка получения деталей блюда ${dishId}:`, error);
      return null;
    }
  }
  
  /**
   * Удаляет дубликаты блюд по ID
   * @param {Array} dishes - массив блюд
   * @returns {Array} массив уникальных блюд
   */
  static removeDuplicateDishes(dishes) {
    const seen = new Set();
    return dishes.filter(dish => {
      if (seen.has(dish.idMeal)) {
        return false;
      }
      seen.add(dish.idMeal);
      return true;
    });
  }
  
  /**
   * Получает резервное блюдо при сбое основного алгоритма
   * @param {string} mealType - тип питания
   * @param {object} userPreferences - предпочтения пользователя
   * @returns {Promise<object>} результат с резервным блюдом
   */
  static async getFallbackDish(mealType, userPreferences = {}) {
    try {
      console.log(`[DishService] Используем fallback для ${mealType}`);
      
      // Импортируем fallback данные динамически
      const { getFallbackDishes } = await import('../data/fallbackDishes.js');
      const fallbackDishes = getFallbackDishes(mealType);
      
      if (fallbackDishes.length === 0) {
        throw new Error('Нет резервных блюд');
      }
      
      // Применяем базовую фильтрацию
      const filteredDishes = FilterService.filterByPreferences(fallbackDishes, userPreferences);
      const dishesToUse = filteredDishes.length > 0 ? filteredDishes : fallbackDishes;
      
      // Выбираем случайное блюдо
      const randomIndex = Math.floor(Math.random() * dishesToUse.length);
      const selectedDish = dishesToUse[randomIndex];
      
      console.log(`[DishService] Выбрано fallback блюдо: ${selectedDish.strMeal}`);
      
      return {
        status: API_STATUS.FALLBACK,
        dish: selectedDish,
        analysis: null, // Для fallback блюд анализ может отсутствовать
        score: 5, // Средняя оценка для fallback
        scoreCategory: 'average',
        mealType,
        context: getContextualPreferences(),
        metadata: {
          totalDishesFound: fallbackDishes.length,
          dishesAfterFiltering: dishesToUse.length,
          selectionMethod: 'fallback_random',
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[DishService] Ошибка получения fallback блюда:', error);
      
      // Крайний случай - возвращаем жестко закодированное блюдо
      return {
        status: API_STATUS.ERROR,
        dish: {
          idMeal: 'fallback-001',
          strMeal: 'Простое блюдо',
          strCategory: 'Miscellaneous',
          strMealThumb: '',
          strInstructions: 'Приготовьте простое и вкусное блюдо по вашему вкусу.'
        },
        analysis: null,
        score: 1,
        scoreCategory: 'minimal',
        mealType,
        context: getContextualPreferences(),
        metadata: {
          selectionMethod: 'emergency_fallback',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      };
    }
  }
  
  /**
   * Получает несколько умных рекомендаций
   * @param {string} mealType - тип питания
   * @param {object} userPreferences - предпочтения пользователя
   * @param {number} count - количество рекомендаций
   * @returns {Promise<Array>} массив рекомендаций
   */
  static async getSmartRecommendations(mealType = null, userPreferences = {}, count = 3) {
    try {
      if (!mealType) {
        mealType = getCurrentMealType();
      }
      
      const context = getContextualPreferences();
      
      // Получаем блюда из API
      const dishes = await this.fetchDishesFromAPI(mealType, userPreferences);
      
      if (!dishes || dishes.length === 0) {
        return [];
      }
      
      // Фильтруем и оцениваем
      const filteredDishes = FilterService.filterByPreferences(dishes, userPreferences);
      console.log(`[DishService] После базовой фильтрации: ${filteredDishes.length} блюд`);
      
      const scoredDishes = await ScoringService.scoreDishes(filteredDishes, mealType, userPreferences, context);
      console.log(`[DishService] После оценки: ${scoredDishes.length} блюд`);
      
      // Фильтруем по предпочитаемой сложности и времени готовки после анализа
      const complexityFilteredDishes = FilterService.filterByComplexity(scoredDishes, userPreferences);
      console.log(`[DishService] После фильтрации по сложности: ${complexityFilteredDishes.length} блюд`);
      
      const timeFilteredDishes = FilterService.filterByMaxCookingTime(complexityFilteredDishes, userPreferences);
      console.log(`[DishService] После фильтрации по времени: ${timeFilteredDishes.length} блюд`);
      
      const dishesToSelect = timeFilteredDishes.length > 0 ? timeFilteredDishes : scoredDishes;
      console.log(`[DishService] Блюд для выбора: ${dishesToSelect.length}, запрошено: ${count}`);
      
      // Выбираем разнообразные блюда
      const selectedDishes = FilterService.selectDiverseDishes(dishesToSelect, count);
      console.log(`[DishService] Выбрано блюд: ${selectedDishes.length}`);
      
      return selectedDishes.map(item => ({
        dish: item.dish,
        analysis: item.analysis,
        score: item.score,
        scoreCategory: item.scoreCategory
      }));
      
    } catch (error) {
      console.error('[DishService] Ошибка получения рекомендаций:', error);
      return [];
    }
  }
}
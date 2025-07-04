// Сервис фильтрации и взвешенного выбора блюд

import { SCORE_THRESHOLDS } from '../data/scoringRules.js';
import StorageService from './storageService.js';

/**
 * Сервис для фильтрации блюд и взвешенного случайного выбора
 */
export class FilterService {
  
  /**
   * Фильтрует блюда по типу питания на основе категорий
   * @param {Array} dishes - массив блюд
   * @param {Array} allowedCategories - разрешенные категории для типа питания
   * @returns {Array} отфильтрованные блюда
   */
  static filterByMealType(dishes, allowedCategories) {
    if (!allowedCategories || allowedCategories.length === 0) {
      return dishes;
    }
    
    return dishes.filter(dish => 
      allowedCategories.includes(dish.strCategory)
    );
  }
  
  /**
   * Фильтрует блюда по пользовательским предпочтениям
   * @param {Array} dishes - массив блюд
   * @param {object} preferences - предпочтения пользователя
   * @returns {Array} отфильтрованные блюда
   */
  static filterByPreferences(dishes, preferences = {}) {
    let filteredDishes = [...dishes];
    
    // Исключаем блюда из StorageService ТОЛЬКО В БРАУЗЕРЕ
    if (typeof window !== 'undefined') {
      try {
        // Исключаем блюда из черного списка (из StorageService)
        const blacklist = StorageService.getBlacklist();
        if (blacklist.length > 0) {
          const blacklistedIds = blacklist.map(item => item.id);
          filteredDishes = filteredDishes.filter(dish => 
            !blacklistedIds.includes(dish.idMeal)
          );
        }
        
        // Исключаем недавно показанные блюда (из StorageService)
        filteredDishes = filteredDishes.filter(dish => 
          !StorageService.isRecentlyShown(dish.idMeal, 3)
        );
      } catch (error) {
        console.warn('[FilterService] Ошибка при работе с localStorage:', error.message);
      }
    }
    
    // Также проверяем blacklist из preferences (для совместимости)
    if (preferences.blacklist && preferences.blacklist.length > 0) {
      const blacklistedIds = preferences.blacklist.map(item => item.idMeal);
      filteredDishes = filteredDishes.filter(dish => 
        !blacklistedIds.includes(dish.idMeal)
      );
    }
    
    // Исключаем блюда с нелюбимыми ингредиентами
    if (preferences.dislikedIngredients && preferences.dislikedIngredients.length > 0) {
      filteredDishes = filteredDishes.filter(dish => 
        !this.containsDislikedIngredients(dish, preferences.dislikedIngredients)
      );
    }
    
    // Фильтруем по диетическим ограничениям
    if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
      filteredDishes = filteredDishes.filter(dish =>
        this.matchesDietaryRestrictions(dish, preferences.dietaryRestrictions)
      );
    }
    
    // Исключаем недавно показанные блюда из истории preferences (для совместимости)
    if (preferences.history && preferences.history.length > 0) {
      filteredDishes = this.avoidRecent(filteredDishes, preferences.history);
    }
    
    return filteredDishes;
  }
  
  /**
   * Исключает недавно показанные блюда
   * @param {Array} dishes - массив блюд
   * @param {Array} history - история показанных блюд
   * @param {number} avoidanceDays - количество дней для избегания повторов
   * @returns {Array} отфильтрованные блюда
   */
  static avoidRecent(dishes, history, avoidanceDays = 3) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - avoidanceDays);
    
    const recentDishIds = history
      .filter(entry => new Date(entry.timestamp) > cutoffDate)
      .map(entry => entry.dish.idMeal);
    
    return dishes.filter(dish => !recentDishIds.includes(dish.idMeal));
  }
  
  /**
   * Проверяет, содержит ли блюдо нелюбимые ингредиенты
   * @param {object} dish - объект блюда
   * @param {Array} dislikedIngredients - массив нелюбимых ингредиентов
   * @returns {boolean} содержит ли нелюбимые ингредиенты
   */
  static containsDislikedIngredients(dish, dislikedIngredients) {
    const dishIngredients = this.getDishIngredients(dish).join(' ').toLowerCase();
    
    return dislikedIngredients.some(disliked => 
      dishIngredients.includes(disliked.toLowerCase())
    );
  }
  
  /**
   * Проверяет соответствие блюда диетическим ограничениям
   * @param {object} dish - объект блюда
   * @param {Array} restrictions - диетические ограничения
   * @returns {boolean} соответствует ли ограничениям
   */
  static matchesDietaryRestrictions(dish, restrictions) {
    const ingredients = this.getDishIngredients(dish);
    const ingredientsText = ingredients.join(' ').toLowerCase();
    
    for (const restriction of restrictions) {
      switch (restriction.toLowerCase()) {
        case 'vegetarian':
          if (this.containsMeat(ingredientsText)) return false;
          break;
          
        case 'vegan':
          if (this.containsAnimalProducts(ingredientsText)) return false;
          break;
          
        case 'pescatarian':
          if (this.containsMeatExceptFish(ingredientsText)) return false;
          break;
          
        case 'gluten-free':
          if (this.containsGluten(ingredientsText)) return false;
          break;
          
        case 'dairy-free':
          if (this.containsDairy(ingredientsText)) return false;
          break;
          
        case 'nut-free':
          if (this.containsNuts(ingredientsText)) return false;
          break;
      }
    }
    
    return true;
  }
  
  /**
   * Проверяет наличие мяса в ингредиентах
   * @param {string} ingredientsText - текст ингредиентов
   * @returns {boolean} содержит ли мясо
   */
  static containsMeat(ingredientsText) {
    const meatKeywords = [
      'beef', 'pork', 'chicken', 'turkey', 'lamb', 'duck', 'bacon', 
      'ham', 'sausage', 'ground beef', 'ground pork', 'mince'
    ];
    
    return meatKeywords.some(meat => ingredientsText.includes(meat));
  }
  
  /**
   * Проверяет наличие животных продуктов (для веганов)
   * @param {string} ingredientsText - текст ингредиентов
   * @returns {boolean} содержит ли животные продукты
   */
  static containsAnimalProducts(ingredientsText) {
    if (this.containsMeat(ingredientsText)) return true;
    
    const animalProducts = [
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'honey',
      'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster'
    ];
    
    return animalProducts.some(product => ingredientsText.includes(product));
  }
  
  /**
   * Проверяет наличие мяса кроме рыбы (для пескетарианцев)
   * @param {string} ingredientsText - текст ингредиентов
   * @returns {boolean} содержит ли мясо (кроме рыбы)
   */
  static containsMeatExceptFish(ingredientsText) {
    const landMeat = [
      'beef', 'pork', 'chicken', 'turkey', 'lamb', 'duck', 'bacon',
      'ham', 'sausage', 'ground beef', 'ground pork'
    ];
    
    return landMeat.some(meat => ingredientsText.includes(meat));
  }
  
  /**
   * Проверяет наличие глютена
   * @param {string} ingredientsText - текст ингредиентов
   * @returns {boolean} содержит ли глютен
   */
  static containsGluten(ingredientsText) {
    const glutenKeywords = [
      'wheat', 'flour', 'bread', 'pasta', 'noodles', 'barley', 'rye',
      'soy sauce', 'worcestershire'
    ];
    
    return glutenKeywords.some(gluten => ingredientsText.includes(gluten));
  }
  
  /**
   * Проверяет наличие молочных продуктов
   * @param {string} ingredientsText - текст ингредиентов
   * @returns {boolean} содержит ли молочные продукты
   */
  static containsDairy(ingredientsText) {
    const dairyKeywords = [
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream',
      'parmesan', 'mozzarella', 'cheddar'
    ];
    
    return dairyKeywords.some(dairy => ingredientsText.includes(dairy));
  }
  
  /**
   * Проверяет наличие орехов
   * @param {string} ingredientsText - текст ингредиентов
   * @returns {boolean} содержит ли орехи
   */
  static containsNuts(ingredientsText) {
    const nutKeywords = [
      'almond', 'walnut', 'peanut', 'cashew', 'pistachio', 'hazelnut',
      'pecan', 'brazil nut', 'pine nut'
    ];
    
    return nutKeywords.some(nut => ingredientsText.includes(nut));
  }
  
  /**
   * Получает список ингредиентов из объекта блюда
   * @param {object} dish - объект блюда
   * @returns {Array} массив ингредиентов
   */
  static getDishIngredients(dish) {
    const ingredients = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = dish[`strIngredient${i}`];
      if (ingredient && ingredient.trim() && ingredient.trim() !== '') {
        ingredients.push(ingredient.trim());
      }
    }
    
    return ingredients;
  }
  
  /**
   * Выполняет взвешенный случайный выбор из оцененных блюд
   * @param {Array} scoredDishes - массив блюд с оценками
   * @param {number} count - количество блюд для выбора
   * @returns {Array} выбранные блюда
   */
  static weightedRandomSelect(scoredDishes, count = 1) {
    if (!scoredDishes || scoredDishes.length === 0) {
      return [];
    }
    
    // Фильтруем блюда с минимальной оценкой
    const validDishes = scoredDishes.filter(item => item.score > 0);
    
    if (validDishes.length === 0) {
      return [];
    }
    
    // Если нужно только одно блюдо
    if (count === 1) {
      return [this.selectSingleDish(validDishes)];
    }
    
    // Если нужно несколько блюд
    return this.selectMultipleDishes(validDishes, count);
  }
  
  /**
   * Выбирает одно блюдо на основе взвешенной случайности
   * @param {Array} scoredDishes - массив оцененных блюд
   * @returns {object} выбранное блюдо
   */
  static selectSingleDish(scoredDishes) {
    // Вычисляем общий вес всех оценок
    const totalWeight = scoredDishes.reduce((sum, item) => sum + item.score, 0);
    
    // Генерируем случайное число от 0 до общего веса
    let random = Math.random() * totalWeight;
    
    // Находим блюдо, которому соответствует случайное число
    for (const item of scoredDishes) {
      random -= item.score;
      if (random <= 0) {
        return item;
      }
    }
    
    // Fallback - возвращаем последнее блюдо
    return scoredDishes[scoredDishes.length - 1];
  }
  
  /**
   * Выбирает несколько блюд без повторений
   * @param {Array} scoredDishes - массив оцененных блюд
   * @param {number} count - количество блюд
   * @returns {Array} выбранные блюда
   */
  static selectMultipleDishes(scoredDishes, count) {
    const selected = [];
    const remaining = [...scoredDishes];
    
    for (let i = 0; i < count && remaining.length > 0; i++) {
      const selectedItem = this.selectSingleDish(remaining);
      selected.push(selectedItem);
      
      // Удаляем выбранное блюдо из оставшихся
      const index = remaining.findIndex(item => item.dish.idMeal === selectedItem.dish.idMeal);
      if (index > -1) {
        remaining.splice(index, 1);
      }
    }
    
    return selected;
  }
  
  /**
   * Группирует блюда по категориям оценок
   * @param {Array} scoredDishes - массив оцененных блюд
   * @returns {object} группированные блюда
   */
  static groupByScoreCategory(scoredDishes) {
    const groups = {
      excellent: [],
      good: [],
      average: [],
      poor: []
    };
    
    scoredDishes.forEach(item => {
      const category = item.scoreCategory || 'poor';
      if (groups[category]) {
        groups[category].push(item);
      }
    });
    
    return groups;
  }
  
  /**
   * Выбирает лучшие блюда с предпочтением высоких оценок
   * @param {Array} scoredDishes - массив оцененных блюд
   * @param {number} count - количество блюд
   * @returns {Array} лучшие блюда
   */
  static selectBestDishes(scoredDishes, count = 1) {
    const grouped = this.groupByScoreCategory(scoredDishes);
    const selected = [];
    
    // Сначала пытаемся взять из отличных
    if (grouped.excellent.length > 0 && selected.length < count) {
      const needed = Math.min(count - selected.length, grouped.excellent.length);
      selected.push(...this.weightedRandomSelect(grouped.excellent, needed));
    }
    
    // Затем из хороших
    if (grouped.good.length > 0 && selected.length < count) {
      const needed = Math.min(count - selected.length, grouped.good.length);
      selected.push(...this.weightedRandomSelect(grouped.good, needed));
    }
    
    // Затем из средних
    if (grouped.average.length > 0 && selected.length < count) {
      const needed = Math.min(count - selected.length, grouped.average.length);
      selected.push(...this.weightedRandomSelect(grouped.average, needed));
    }
    
    // В крайнем случае из плохих
    if (grouped.poor.length > 0 && selected.length < count) {
      const needed = Math.min(count - selected.length, grouped.poor.length);
      selected.push(...this.weightedRandomSelect(grouped.poor, needed));
    }
    
    return selected;
  }
  
  /**
   * Добавляет разнообразие в выбор, избегая повторяющихся категорий
   * @param {Array} scoredDishes - массив оцененных блюд
   * @param {number} count - количество блюд
   * @returns {Array} разнообразные блюда
   */
  static selectDiverseDishes(scoredDishes, count = 3) {
    if (count === 1) {
      return this.weightedRandomSelect(scoredDishes, 1);
    }
    
    const selected = [];
    const usedCategories = new Set();
    
    // Группируем блюда по категориям
    const dishesByCategory = new Map();
    scoredDishes.forEach(item => {
      const category = item.dish.strCategory;
      if (!dishesByCategory.has(category)) {
        dishesByCategory.set(category, []);
      }
      dishesByCategory.get(category).push(item);
    });
    
    // Сортируем блюда в каждой категории по оценке и добавляем случайность
    dishesByCategory.forEach((dishes, category) => {
      dishes.sort((a, b) => b.score - a.score);
      // Добавляем небольшую случайность к сортировке для блюд с похожими оценками
      for (let i = 0; i < dishes.length - 1; i++) {
        if (Math.abs(dishes[i].score - dishes[i + 1].score) <= 1 && Math.random() < 0.3) {
          [dishes[i], dishes[i + 1]] = [dishes[i + 1], dishes[i]];
        }
      }
    });
    
    // Выбираем случайное блюдо из топ-3 каждой категории
    const categoriesArray = Array.from(dishesByCategory.keys());
    
    // Перемешиваем категории для случайного порядка обработки
    for (let i = categoriesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [categoriesArray[i], categoriesArray[j]] = [categoriesArray[j], categoriesArray[i]];
    }
    
    // Выбираем по одному блюду из каждой категории
    for (const category of categoriesArray) {
      if (selected.length >= count) break;
      
      if (!usedCategories.has(category)) {
        const categoryDishes = dishesByCategory.get(category);
        // Выбираем случайное блюдо из топ-3 (или всех, если меньше 3)
        const topDishes = categoryDishes.slice(0, Math.min(3, categoryDishes.length));
        const randomIndex = Math.floor(Math.random() * topDishes.length);
        const selectedItem = topDishes[randomIndex];
        
        selected.push(selectedItem);
        usedCategories.add(category);
      }
    }
    
    // Если нужно больше блюд, добавляем случайные из оставшихся
    if (selected.length < count) {
      const remaining = scoredDishes.filter(item => 
        !selected.some(s => s.dish.idMeal === item.dish.idMeal)
      );
      
      // Перемешиваем оставшиеся и берем нужное количество
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      
      const additional = remaining.slice(0, count - selected.length);
      selected.push(...additional);
    }
    
    return selected;
  }
}
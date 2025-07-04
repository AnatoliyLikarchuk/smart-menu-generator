// Сервис для расчета калорийности блюд

import { 
  getIngredientCalories, 
  MEASUREMENT_WEIGHTS, 
  COOKING_METHOD_MULTIPLIERS,
  getCalorieCategory
} from '../data/calorieDatabase.js';

/**
 * Сервис для расчета калорийности блюд
 */
export class CalorieService {
  
  /**
   * Рассчитывает общую калорийность блюда
   * @param {object} dish - объект блюда из API
   * @returns {object} объект с калориями и категорией
   */
  static calculateDishCalories(dish) {
    if (!dish) return { calories: 0, category: getCalorieCategory(0) };
    
    try {
      let totalCalories = 0;
      const ingredients = this.extractIngredients(dish);
      
      // Рассчитываем калории для каждого ингредиента
      for (const ingredient of ingredients) {
        const ingredientCalories = this.calculateIngredientCalories(
          ingredient.name, 
          ingredient.measure
        );
        totalCalories += ingredientCalories;
      }
      
      // Применяем коэффициент способа приготовления
      const cookingMultiplier = this.getCookingMethodMultiplier(dish.strInstructions);
      totalCalories *= cookingMultiplier;
      
      // Округляем до целого
      totalCalories = Math.round(totalCalories);
      
      // Определяем категорию
      const category = getCalorieCategory(totalCalories);
      
      console.log(`[CalorieService] Рассчитано ${totalCalories} ккал для "${dish.strMeal}"`);
      
      return {
        calories: totalCalories,
        category: category,
        cookingMethod: this.detectCookingMethod(dish.strInstructions),
        ingredientCount: ingredients.length
      };
      
    } catch (error) {
      console.warn('[CalorieService] Ошибка расчета калорий:', error.message);
      // Fallback: оценка по категории блюда
      return this.estimateCaloriesByCategory(dish);
    }
  }
  
  /**
   * Извлекает ингредиенты из объекта блюда
   * @param {object} dish - объект блюда
   * @returns {Array} массив объектов {name, measure}
   */
  static extractIngredients(dish) {
    const ingredients = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = dish[`strIngredient${i}`];
      const measure = dish[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    
    return ingredients;
  }
  
  /**
   * Рассчитывает калории одного ингредиента с учетом меры
   * @param {string} ingredientName - название ингредиента
   * @param {string} measure - мера измерения
   * @returns {number} калории ингредиента
   */
  static calculateIngredientCalories(ingredientName, measure) {
    if (!ingredientName) return 0;
    
    // Получаем калорийность на 100г
    const caloriesPer100g = getIngredientCalories(ingredientName);
    
    // Конвертируем меру в граммы
    const grams = this.convertMeasureToGrams(measure, ingredientName);
    
    // Рассчитываем калории
    const calories = (caloriesPer100g * grams) / 100;
    
    return calories;
  }
  
  /**
   * Конвертирует меру измерения в граммы
   * @param {string} measure - мера измерения (например "1 cup", "2 tbsp")
   * @param {string} ingredient - название ингредиента для контекста
   * @returns {number} вес в граммах
   */
  static convertMeasureToGrams(measure, ingredient = '') {
    if (!measure || !measure.trim()) return 100; // По умолчанию 100г
    
    const measureLower = measure.toLowerCase().trim();
    const ingredientLower = ingredient.toLowerCase();
    
    // Улучшенный парсинг количества - ищем в начале строки
    let quantity = 1;
    
    // Обработка смешанных чисел (например "1 1/2 cups")
    const mixedNumberMatch = measureLower.match(/^(\d+)\s+(\d+\/\d+)/);
    if (mixedNumberMatch) {
      const whole = parseInt(mixedNumberMatch[1]);
      const fraction = this.parseQuantity(mixedNumberMatch[2]);
      quantity = whole + fraction;
    } else {
      // Обычные числа и дроби - ищем в начале строки
      const numberMatch = measureLower.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)/);
      quantity = numberMatch ? this.parseQuantity(numberMatch[1]) : 1;
    }
    
    console.log(`[CalorieService] Парсинг меры: "${measure}" → количество: ${quantity}`);
    
    // Определяем тип меры
    let unitWeight = 100; // По умолчанию
    
    // Чашки (cups)
    if (measureLower.includes('cup')) {
      const cupWeight = MEASUREMENT_WEIGHTS.cup[ingredientLower] || 
                       MEASUREMENT_WEIGHTS.cup.default;
      unitWeight = cupWeight * quantity;
    }
    // Столовые ложки (tablespoons)
    else if (measureLower.includes('tbsp') || measureLower.includes('tablespoon')) {
      const tbspWeight = MEASUREMENT_WEIGHTS.tablespoon[ingredientLower] || 
                        MEASUREMENT_WEIGHTS.tablespoon.default;
      unitWeight = tbspWeight * quantity;
    }
    // Чайные ложки (teaspoons)
    else if (measureLower.includes('tsp') || measureLower.includes('teaspoon')) {
      const tspWeight = MEASUREMENT_WEIGHTS.teaspoon[ingredientLower] || 
                       MEASUREMENT_WEIGHTS.teaspoon.default;
      unitWeight = tspWeight * quantity;
    }
    // Штуки (pieces)
    else if (measureLower.includes('piece') || measureLower.includes('whole') || 
             /^\d+$/.test(measureLower)) {
      const pieceWeight = MEASUREMENT_WEIGHTS.piece[ingredientLower] || 
                         MEASUREMENT_WEIGHTS.piece.default;
      unitWeight = pieceWeight * quantity;
    }
    // Ломтики (slices)
    else if (measureLower.includes('slice')) {
      const sliceWeight = MEASUREMENT_WEIGHTS.slice[ingredientLower] || 
                         MEASUREMENT_WEIGHTS.slice.default;
      unitWeight = sliceWeight * quantity;
    }
    // Банки (cans)
    else if (measureLower.includes('can')) {
      const canWeight = MEASUREMENT_WEIGHTS.can[ingredientLower] || 
                       MEASUREMENT_WEIGHTS.can.default;
      unitWeight = canWeight * quantity;
    }
    // Головки (heads)
    else if (measureLower.includes('head')) {
      const headWeight = MEASUREMENT_WEIGHTS.head[ingredientLower] || 
                        MEASUREMENT_WEIGHTS.head.default;
      unitWeight = headWeight * quantity;
    }
    // Пучки (bunches)
    else if (measureLower.includes('bunch')) {
      const bunchWeight = MEASUREMENT_WEIGHTS.bunch[ingredientLower] || 
                         MEASUREMENT_WEIGHTS.bunch.default;
      unitWeight = bunchWeight * quantity;
    }
    // Горсти (handfuls)
    else if (measureLower.includes('handful')) {
      const handfulWeight = MEASUREMENT_WEIGHTS.handful[ingredientLower] || 
                           MEASUREMENT_WEIGHTS.handful.default;
      unitWeight = handfulWeight * quantity;
    }
    // Граммы (grams)
    else if (measureLower.includes('g ') || measureLower.includes('gram')) {
      unitWeight = quantity;
    }
    // Килограммы (kilograms)
    else if (measureLower.includes('kg') || measureLower.includes('kilogram')) {
      unitWeight = quantity * 1000;
    }
    // Миллилитры (для жидкостей, приблизительно = граммы)
    else if (measureLower.includes('ml') || measureLower.includes('milliliter')) {
      unitWeight = quantity;
    }
    // Литры
    else if (measureLower.includes('l ') || measureLower.includes('liter')) {
      unitWeight = quantity * 1000;
    }
    // Унции
    else if (measureLower.includes('oz') || measureLower.includes('ounce')) {
      unitWeight = quantity * 28.35; // 1 унция = 28.35г
    }
    // Фунты
    else if (measureLower.includes('lb') || measureLower.includes('pound')) {
      unitWeight = quantity * 453.6; // 1 фунт = 453.6г
    }
    // Щепотки и по вкусу (очень мало)
    else if (measureLower.includes('pinch') || measureLower.includes('taste') || 
             measureLower.includes('season')) {
      unitWeight = 2; // 2 грамма
    }
    // Если ничего не подошло, используем стандартную порцию 100г (не умножаем на количество)
    else {
      unitWeight = 100;
    }
    
    console.log(`[CalorieService] Итоговый вес: ${unitWeight}г для "${measure}" (${ingredient})`);
    
    return Math.max(unitWeight, 0); // Не может быть отрицательным
  }
  
  /**
   * Парсит количество из строки (включая дроби)
   * @param {string} quantityStr - строка с количеством
   * @returns {number} числовое значение
   */
  static parseQuantity(quantityStr) {
    if (!quantityStr) return 1;
    
    // Обработка дробей (например "1/2", "3/4")
    if (quantityStr.includes('/')) {
      const parts = quantityStr.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        return numerator / denominator;
      }
    }
    
    return parseFloat(quantityStr) || 1;
  }
  
  /**
   * Определяет коэффициент способа приготовления
   * @param {string} instructions - инструкции по приготовлению
   * @returns {number} коэффициент (0.9 - 1.5)
   */
  static getCookingMethodMultiplier(instructions) {
    if (!instructions) return 1.0;
    
    const instructionsLower = instructions.toLowerCase();
    
    // Ищем методы приготовления в порядке приоритета (от более калорийных к менее)
    for (const [method, multiplier] of Object.entries(COOKING_METHOD_MULTIPLIERS)) {
      if (instructionsLower.includes(method)) {
        return multiplier;
      }
    }
    
    // Дополнительные ключевые слова
    if (instructionsLower.includes('oil') || instructionsLower.includes('butter')) {
      return 1.2; // Добавление жира +20%
    }
    
    if (instructionsLower.includes('water') || instructionsLower.includes('steam')) {
      return 1.0; // На воде/пару
    }
    
    return 1.0; // По умолчанию без изменений
  }
  
  /**
   * Определяет основной метод приготовления
   * @param {string} instructions - инструкции по приготовлению
   * @returns {string} метод приготовления
   */
  static detectCookingMethod(instructions) {
    if (!instructions) return 'unknown';
    
    const instructionsLower = instructions.toLowerCase();
    
    // Приоритетный поиск методов
    const methods = [
      'deep fried', 'fried', 'pan fried', 'sautéed', 'roasted', 
      'grilled', 'baked', 'boiled', 'steamed', 'poached'
    ];
    
    for (const method of methods) {
      if (instructionsLower.includes(method)) {
        return method;
      }
    }
    
    return 'mixed'; // Смешанный метод
  }
  
  /**
   * Оценивает калории по категории блюда (fallback)
   * @param {object} dish - объект блюда
   * @returns {object} оценка калорий
   */
  static estimateCaloriesByCategory(dish) {
    const category = dish.strCategory ? dish.strCategory.toLowerCase() : '';
    
    let estimatedCalories = 500; // По умолчанию
    
    // Оценка по категории
    if (category.includes('dessert') || category.includes('sweet')) {
      estimatedCalories = 350;
    } else if (category.includes('salad') || category.includes('vegetarian')) {
      estimatedCalories = 250;
    } else if (category.includes('soup')) {
      estimatedCalories = 200;
    } else if (category.includes('meat') || category.includes('beef') || 
               category.includes('pork') || category.includes('lamb')) {
      estimatedCalories = 600;
    } else if (category.includes('chicken') || category.includes('poultry')) {
      estimatedCalories = 450;
    } else if (category.includes('fish') || category.includes('seafood')) {
      estimatedCalories = 300;
    } else if (category.includes('pasta') || category.includes('rice')) {
      estimatedCalories = 400;
    } else if (category.includes('breakfast')) {
      estimatedCalories = 350;
    }
    
    const categoryObj = getCalorieCategory(estimatedCalories);
    
    console.log(`[CalorieService] Оценка по категории: ${estimatedCalories} ккал для "${dish.strMeal}"`);
    
    return {
      calories: estimatedCalories,
      category: categoryObj,
      cookingMethod: 'estimated',
      ingredientCount: 0,
      isEstimated: true
    };
  }
  
  /**
   * Получает краткое описание калорийности
   * @param {number} calories - количество калорий
   * @returns {string} описание
   */
  static getCalorieDescription(calories) {
    const category = getCalorieCategory(calories);
    return `${calories} ккал • ${category.label}`;
  }
  
  /**
   * Проверяет, является ли блюдо низкокалорийным
   * @param {number} calories - количество калорий
   * @returns {boolean} true если низкокалорийное
   */
  static isLowCalorie(calories) {
    return calories < 400;
  }
  
  /**
   * Проверяет, является ли блюдо высококалорийным
   * @param {number} calories - количество калорий
   * @returns {boolean} true если высококалорийное
   */
  static isHighCalorie(calories) {
    return calories > 700;
  }
}

export default CalorieService;
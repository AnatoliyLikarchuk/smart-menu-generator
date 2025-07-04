// Анализатор рецептов без использования ИИ - использует регулярные выражения и алгоритмы

import { 
  ANALYSIS_KEYWORDS, 
  COMPLEXITY_LEVELS, 
  COOKING_TIME_CATEGORIES 
} from './constants.js';
import CalorieService from '../services/calorieService.js';

/**
 * Извлекает время приготовления из текста инструкций
 * @param {string} instructions - текст инструкций по приготовлению
 * @returns {number} время в минутах (0 если не найдено)
 */
export function extractCookingTime(instructions) {
  if (!instructions || typeof instructions !== 'string') return 0;
  
  const text = instructions.toLowerCase();
  
  // Паттерны для поиска времени
  const timePatterns = [
    // Точные минуты: "30 minutes", "15 mins", "5-10 minutes"
    /(\d+)(?:-(\d+))?\s*(?:minutes?|mins?)/gi,
    // Часы: "1 hour", "2 hours", "1.5 hours"
    /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/gi,
    // Комбинированное время: "1 hour 30 minutes"
    /(\d+)\s*(?:hours?|hrs?)\s*(?:and\s*)?(\d+)\s*(?:minutes?|mins?)/gi,
    // Особые случаи: "overnight" = 8 часов, "all day" = 6 часов
    /overnight/gi,
    /all\s*day/gi
  ];
  
  let totalMinutes = 0;
  const foundTimes = [];
  
  // Поиск всех совпадений времени
  timePatterns.forEach((pattern, index) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (index === 0) { // Минуты
        const min1 = parseInt(match[1]);
        const min2 = match[2] ? parseInt(match[2]) : min1;
        foundTimes.push(Math.max(min1, min2)); // Берем максимальное время из диапазона
      } else if (index === 1) { // Часы
        const hours = parseFloat(match[1]);
        foundTimes.push(hours * 60);
      } else if (index === 2) { // Часы + минуты
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        foundTimes.push(hours * 60 + minutes);
      } else if (index === 3) { // Overnight
        foundTimes.push(480); // 8 часов
      } else if (index === 4) { // All day
        foundTimes.push(360); // 6 часов
      }
    }
  });
  
  // Если найдено несколько времен, берем максимальное (общее время приготовления)
  if (foundTimes.length > 0) {
    totalMinutes = Math.max(...foundTimes);
  }
  
  // Ограничиваем разумными пределами (от 1 минуты до 12 часов)
  return Math.min(Math.max(totalMinutes, 0), 720);
}

/**
 * Подсчитывает сложность блюда на основе ингредиентов и инструкций
 * @param {object} dish - объект блюда с ингредиентами и инструкциями
 * @returns {number} уровень сложности (0-20)
 */
export function calculateComplexity(dish) {
  let complexity = 0;
  
  // Подсчет ингредиентов
  const ingredientCount = countIngredients(dish);
  if (ingredientCount <= 5) complexity += 1;
  else if (ingredientCount <= 10) complexity += 3;
  else if (ingredientCount <= 15) complexity += 5;
  else complexity += 8;
  
  // Анализ инструкций
  const instructions = dish.strInstructions || '';
  
  // Количество шагов (считаем по точкам, переносам строк, числам)
  const steps = countCookingSteps(instructions);
  if (steps <= 3) complexity += 1;
  else if (steps <= 6) complexity += 2;
  else if (steps <= 10) complexity += 4;
  else complexity += 6;
  
  // Сложные техники приготовления
  const complexTechniques = [
    'marinate', 'braise', 'confit', 'sous vide', 'flambé', 'julienne',
    'brunoise', 'chiffonade', 'fold', 'whip', 'emulsify', 'reduce',
    'caramelize', 'tempering', 'proof', 'knead'
  ];
  
  complexTechniques.forEach(technique => {
    if (instructions.toLowerCase().includes(technique)) {
      complexity += 1;
    }
  });
  
  // Специальное оборудование
  const specialEquipment = [
    'food processor', 'stand mixer', 'mandoline', 'thermometer',
    'double boiler', 'mortar', 'pestle', 'pressure cooker'
  ];
  
  specialEquipment.forEach(equipment => {
    if (instructions.toLowerCase().includes(equipment)) {
      complexity += 1;
    }
  });
  
  return Math.min(complexity, 20); // Максимум 20
}

/**
 * Подсчитывает количество ингредиентов в блюде
 * @param {object} dish - объект блюда
 * @returns {number} количество ингредиентов
 */
function countIngredients(dish) {
  let count = 0;
  
  // TheMealDB API структура - до 20 ингредиентов
  for (let i = 1; i <= 20; i++) {
    const ingredient = dish[`strIngredient${i}`];
    if (ingredient && ingredient.trim() && ingredient.trim() !== '') {
      count++;
    }
  }
  
  return count;
}

/**
 * Подсчитывает количество шагов в инструкциях
 * @param {string} instructions - инструкции по приготовлению
 * @returns {number} количество шагов
 */
function countCookingSteps(instructions) {
  if (!instructions) return 0;
  
  // Разбиваем по предложениям и числовым маркерам
  const sentences = instructions.split(/[.!?]|\d+\.\s*|\n+/);
  const meaningfulSteps = sentences.filter(sentence => 
    sentence.trim().length > 10 && // Минимальная длина
    /\b(?:add|mix|cook|heat|bake|fry|boil|stir|pour|cut|chop|slice)\b/i.test(sentence)
  );
  
  return Math.max(meaningfulSteps.length, 1);
}

/**
 * Определяет тип белка в блюде
 * @param {object} dish - объект блюда
 * @returns {string[]} массив типов белка
 */
export function detectProteinType(dish) {
  const proteins = [];
  const ingredientsText = getIngredientsText(dish).toLowerCase();
  
  ANALYSIS_KEYWORDS.PROTEINS.forEach(protein => {
    if (ingredientsText.includes(protein)) {
      proteins.push(protein);
    }
  });
  
  return proteins;
}

/**
 * Определяет способ приготовления блюда
 * @param {string} instructions - инструкции по приготовлению
 * @returns {object} информация о способе приготовления
 */
export function detectCookingMethod(instructions) {
  if (!instructions) return { methods: [], category: 'unknown' };
  
  const text = instructions.toLowerCase();
  const detectedMethods = [];
  
  // Проверяем различные методы
  Object.entries(ANALYSIS_KEYWORDS.COOKING_METHODS).forEach(([category, methods]) => {
    methods.forEach(method => {
      if (text.includes(method)) {
        detectedMethods.push({ method, category });
      }
    });
  });
  
  // Определяем основную категорию
  const categories = detectedMethods.map(m => m.category);
  const mainCategory = categories.length > 0 ? 
    categories.sort((a, b) => 
      categories.filter(c => c === b).length - categories.filter(c => c === a).length
    )[0] : 'unknown';
  
  return {
    methods: detectedMethods.map(m => m.method),
    category: mainCategory,
    isHealthy: mainCategory === 'HEALTHY',
    isQuick: mainCategory === 'QUICK'
  };
}

/**
 * Подсчитывает количество овощей в блюде
 * @param {object} dish - объект блюда
 * @returns {number} количество различных овощей
 */
export function countVegetables(dish) {
  const ingredientsText = getIngredientsText(dish).toLowerCase();
  let vegetableCount = 0;
  
  ANALYSIS_KEYWORDS.VEGETABLES.forEach(vegetable => {
    if (ingredientsText.includes(vegetable)) {
      vegetableCount++;
    }
  });
  
  return vegetableCount;
}

/**
 * Получает весь текст ингредиентов из объекта блюда
 * @param {object} dish - объект блюда
 * @returns {string} строка со всеми ингредиентами
 */
function getIngredientsText(dish) {
  let ingredientsText = '';
  
  for (let i = 1; i <= 20; i++) {
    const ingredient = dish[`strIngredient${i}`];
    if (ingredient && ingredient.trim()) {
      ingredientsText += ingredient + ' ';
    }
  }
  
  // Также добавляем название блюда для дополнительного контекста
  if (dish.strMeal) {
    ingredientsText += dish.strMeal + ' ';
  }
  
  return ingredientsText;
}

/**
 * Анализирует пищевую ценность блюда (упрощенный анализ)
 * @param {object} dish - объект блюда
 * @returns {object} информация о питательности
 */
export function analyzeNutrition(dish) {
  const ingredientsText = getIngredientsText(dish).toLowerCase();
  const instructions = (dish.strInstructions || '').toLowerCase();
  
  // Углеводы
  const carbKeywords = ['rice', 'pasta', 'bread', 'potato', 'flour', 'sugar', 'honey'];
  const carbCount = carbKeywords.filter(keyword => ingredientsText.includes(keyword)).length;
  
  // Белки
  const proteinCount = detectProteinType(dish).length;
  
  // Овощи
  const vegetableCount = countVegetables(dish);
  
  // Жиры
  const fatKeywords = ['oil', 'butter', 'cream', 'cheese', 'nuts', 'avocado'];
  const fatCount = fatKeywords.filter(keyword => ingredientsText.includes(keyword)).length;
  
  // Определяем профиль питания
  let profile = 'balanced';
  if (carbCount > proteinCount + vegetableCount) profile = 'highCarb';
  else if (proteinCount > carbCount + vegetableCount) profile = 'highProtein';
  else if (vegetableCount > carbCount + proteinCount) profile = 'lowCalorie';
  else if (fatCount > 2) profile = 'highFat';
  
  return {
    carbCount,
    proteinCount,
    vegetableCount,
    fatCount,
    profile,
    isBalanced: carbCount > 0 && proteinCount > 0 && vegetableCount > 0,
    isLight: vegetableCount > carbCount + proteinCount,
    isHearty: proteinCount + carbCount > vegetableCount * 2
  };
}

/**
 * Главная функция анализа блюда - объединяет все виды анализа
 * @param {object} dish - объект блюда из API
 * @returns {object} полный анализ блюда
 */
export function analyzeDish(dish) {
  const cookingTime = extractCookingTime(dish.strInstructions);
  const complexity = calculateComplexity(dish);
  const proteins = detectProteinType(dish);
  const cookingMethod = detectCookingMethod(dish.strInstructions);
  const vegetableCount = countVegetables(dish);
  const nutrition = analyzeNutrition(dish);
  const calories = CalorieService.calculateDishCalories(dish);
  
  // Определяем категории
  let timeCategory = 'medium';
  if (cookingTime <= COOKING_TIME_CATEGORIES.QUICK.max) timeCategory = 'quick';
  else if (cookingTime >= COOKING_TIME_CATEGORIES.LONG.min) timeCategory = 'long';
  
  let complexityCategory = 'medium';
  if (complexity <= COMPLEXITY_LEVELS.SIMPLE.max) complexityCategory = 'simple';
  else if (complexity >= COMPLEXITY_LEVELS.COMPLEX.min) complexityCategory = 'complex';
  
  return {
    // Основные характеристики
    cookingTime,
    complexity,
    timeCategory,
    complexityCategory,
    
    // Состав
    proteins,
    vegetableCount,
    ingredientCount: countIngredients(dish),
    
    // Способ приготовления
    cookingMethod: cookingMethod.methods,
    cookingCategory: cookingMethod.category,
    isHealthyCooking: cookingMethod.isHealthy,
    isQuickCooking: cookingMethod.isQuick,
    
    // Питательность
    nutrition,
    
    // Калорийность
    calories: calories.calories,
    calorieCategory: calories.category,
    cookingMethodCalories: calories.cookingMethod,
    isLowCalorie: calories.calories < 400,
    isHighCalorie: calories.calories > 700,
    
    // Дополнительные флаги
    isVegetarian: proteins.length === 0 || proteins.every(p => ['tofu', 'beans', 'lentils', 'eggs'].includes(p)),
    isSeafood: proteins.some(p => ['fish', 'salmon', 'tuna', 'shrimp'].includes(p)),
    isQuick: cookingTime <= 30 && complexity <= 5,
    isComplex: complexity > 10 || cookingTime > 60,
    
    // Мета-информация
    analysisVersion: '1.1',
    analyzedAt: new Date().toISOString()
  };
}
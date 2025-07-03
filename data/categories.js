// Категории блюд для разных типов питания из TheMealDB API

import { MEAL_TYPES } from '../utils/constants.js';

/**
 * Сопоставление типов питания с категориями TheMealDB
 */
export const MEAL_CATEGORIES = {
  [MEAL_TYPES.BREAKFAST]: [
    'Breakfast',     // Традиционные завтраки
    'Dessert',       // Легкие сладкие блюда
    'Miscellaneous'  // Разные легкие блюда
  ],
  
  [MEAL_TYPES.LUNCH]: [
    'Beef',          // Сытные мясные блюда
    'Chicken',       // Популярные куриные блюда  
    'Pork',          // Свиные блюда
    'Pasta',         // Паста и макароны
    'Seafood',       // Морепродукты
    'Lamb'           // Баранина
  ],
  
  [MEAL_TYPES.DINNER]: [
    'Chicken',       // Легкие куриные блюда
    'Seafood',       // Рыба и морепродукты
    'Vegetarian',    // Вегетарианские блюда
    'Pasta',         // Легкая паста
    'Side',          // Гарниры и закуски
    'Starter'        // Легкие закуски
  ]
};

/**
 * Дополнительные категории для расширения выбора
 */
export const EXTENDED_CATEGORIES = {
  [MEAL_TYPES.BREAKFAST]: [
    'Side',          // Дополнительные гарниры к завтраку
    'Starter'        // Легкие закуски
  ],
  
  [MEAL_TYPES.LUNCH]: [
    'Goat',          // Экзотические мясные блюда
    'Miscellaneous'  // Разнообразные сытные блюда
  ],
  
  [MEAL_TYPES.DINNER]: [
    'Dessert',       // Легкие десерты на ужин
    'Vegan'          // Веганские варианты
  ]
};

/**
 * Получает категории для конкретного типа питания
 * @param {string} mealType - тип питания
 * @param {boolean} includeExtended - включать ли расширенные категории
 * @returns {string[]} массив категорий
 */
export function getCategoriesForMealType(mealType, includeExtended = false) {
  const mainCategories = MEAL_CATEGORIES[mealType] || [];
  
  if (!includeExtended) {
    return mainCategories;
  }
  
  const extendedCategories = EXTENDED_CATEGORIES[mealType] || [];
  return [...mainCategories, ...extendedCategories];
}

/**
 * Приоритеты категорий для каждого типа питания
 * Более высокий приоритет = более подходящая категория
 */
export const CATEGORY_PRIORITIES = {
  [MEAL_TYPES.BREAKFAST]: {
    'Breakfast': 10,      // Идеально для завтрака
    'Dessert': 7,         // Хорошо для завтрака
    'Miscellaneous': 5,   // Средне
    'Side': 3,            // Дополнительно
    'Starter': 3          // Дополнительно
  },
  
  [MEAL_TYPES.LUNCH]: {
    'Beef': 9,            // Отлично для обеда
    'Chicken': 9,         // Отлично для обеда
    'Pork': 8,            // Хорошо для обеда
    'Pasta': 8,           // Хорошо для обеда
    'Seafood': 7,         // Хорошо
    'Lamb': 7,            // Хорошо
    'Goat': 5,            // Средне
    'Miscellaneous': 6    // Средне
  },
  
  [MEAL_TYPES.DINNER]: {
    'Seafood': 9,         // Отлично для ужина
    'Chicken': 8,         // Хорошо для ужина
    'Vegetarian': 8,      // Хорошо для ужина
    'Pasta': 7,           // Хорошо
    'Side': 6,            // Средне
    'Starter': 6,         // Средне
    'Dessert': 4,         // Дополнительно
    'Vegan': 7            // Хорошо
  }
};

/**
 * Получает приоритет категории для конкретного типа питания
 * @param {string} category - категория блюда
 * @param {string} mealType - тип питания
 * @returns {number} приоритет (0-10)
 */
export function getCategoryPriority(category, mealType) {
  const priorities = CATEGORY_PRIORITIES[mealType];
  return priorities ? (priorities[category] || 1) : 1;
}

/**
 * Фильтрует категории по доступности в API
 * Некоторые категории могут быть недоступны или пустые
 */
export const AVAILABLE_CATEGORIES = [
  'Beef', 'Breakfast', 'Chicken', 'Dessert', 'Goat', 'Lamb', 
  'Miscellaneous', 'Pasta', 'Pork', 'Seafood', 'Side', 
  'Starter', 'Vegan', 'Vegetarian'
];

/**
 * Проверяет, доступна ли категория в API
 * @param {string} category - категория для проверки
 * @returns {boolean} доступна ли категория
 */
export function isCategoryAvailable(category) {
  return AVAILABLE_CATEGORIES.includes(category);
}

/**
 * Получает все доступные категории для типа питания
 * @param {string} mealType - тип питания
 * @param {boolean} includeExtended - включать расширенные категории
 * @returns {string[]} отфильтрованный массив доступных категорий
 */
export function getAvailableCategoriesForMealType(mealType, includeExtended = false) {
  const categories = getCategoriesForMealType(mealType, includeExtended);
  return categories.filter(category => isCategoryAvailable(category));
}

/**
 * Сопоставления для особых диетических требований
 */
export const DIETARY_CATEGORY_MAP = {
  vegetarian: ['Vegetarian', 'Vegan', 'Side', 'Starter', 'Dessert'],
  vegan: ['Vegan', 'Side'],
  pescatarian: ['Seafood', 'Vegetarian', 'Vegan', 'Side', 'Starter'],
  lowCarb: ['Beef', 'Chicken', 'Pork', 'Seafood', 'Lamb'],
  highProtein: ['Beef', 'Chicken', 'Pork', 'Seafood', 'Lamb', 'Goat']
};

/**
 * Получает категории с учетом диетических ограничений
 * @param {string} mealType - тип питания
 * @param {string[]} dietaryRestrictions - диетические ограничения
 * @returns {string[]} категории с учетом ограничений
 */
export function getCategoriesWithDietaryRestrictions(mealType, dietaryRestrictions = []) {
  let categories = getAvailableCategoriesForMealType(mealType, true);
  
  // Применяем диетические ограничения
  for (const restriction of dietaryRestrictions) {
    const allowedCategories = DIETARY_CATEGORY_MAP[restriction];
    if (allowedCategories) {
      categories = categories.filter(cat => allowedCategories.includes(cat));
    }
  }
  
  // Если после фильтрации не осталось категорий, возвращаем базовые вегетарианские
  if (categories.length === 0) {
    categories = ['Vegetarian', 'Side', 'Starter'].filter(cat => 
      isCategoryAvailable(cat)
    );
  }
  
  return categories;
}
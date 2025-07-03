// Резервные блюда на случай сбоя внешнего API

import { MEAL_TYPES } from '../utils/constants.js';

/**
 * Резервные блюда для завтрака
 */
const BREAKFAST_DISHES = [
  {
    idMeal: 'fallback-breakfast-001',
    strMeal: 'Овсяная каша с ягодами',
    strCategory: 'Breakfast',
    strMealThumb: '',
    strInstructions: 'Сварите овсяные хлопья на молоке в течение 5 минут. Добавьте мед и свежие ягоды. Подавайте горячим.',
    strIngredient1: 'Овсяные хлопья',
    strIngredient2: 'Молоко',
    strIngredient3: 'Мед',
    strIngredient4: 'Ягоды',
    strIngredient5: '',
    cookingTime: 10,
    complexity: 2
  },
  {
    idMeal: 'fallback-breakfast-002',
    strMeal: 'Яичница с тостами',
    strCategory: 'Breakfast',
    strMealThumb: '',
    strInstructions: 'Разогрейте сковороду, разбейте яйца. Жарьте 3-4 минуты. Подрумяньте хлеб в тостере. Подавайте вместе.',
    strIngredient1: 'Яйца',
    strIngredient2: 'Хлеб',
    strIngredient3: 'Масло',
    strIngredient4: 'Соль',
    strIngredient5: '',
    cookingTime: 8,
    complexity: 2
  },
  {
    idMeal: 'fallback-breakfast-003',
    strMeal: 'Творог с фруктами',
    strCategory: 'Breakfast',
    strMealThumb: '',
    strInstructions: 'Смешайте творог с нарезанными фруктами. Добавьте мед по вкусу. Подавайте охлажденным.',
    strIngredient1: 'Творог',
    strIngredient2: 'Банан',
    strIngredient3: 'Яблоко',
    strIngredient4: 'Мед',
    strIngredient5: '',
    cookingTime: 5,
    complexity: 1
  },
  {
    idMeal: 'fallback-breakfast-004',
    strMeal: 'Блины простые',
    strCategory: 'Breakfast',
    strMealThumb: '',
    strInstructions: 'Смешайте муку, молоко, яйцо и соль. Жарьте тонкие блины на горячей сковороде по 1-2 минуты с каждой стороны.',
    strIngredient1: 'Мука',
    strIngredient2: 'Молоко',
    strIngredient3: 'Яйцо',
    strIngredient4: 'Соль',
    strIngredient5: 'Сахар',
    cookingTime: 20,
    complexity: 3
  },
  {
    idMeal: 'fallback-breakfast-005',
    strMeal: 'Йогурт с мюсли',
    strCategory: 'Breakfast',
    strMealThumb: '',
    strInstructions: 'Смешайте йогурт с мюсли. Добавьте свежие ягоды и орехи. Подавайте сразу.',
    strIngredient1: 'Йогурт',
    strIngredient2: 'Мюсли',
    strIngredient3: 'Ягоды',
    strIngredient4: 'Орехи',
    strIngredient5: '',
    cookingTime: 3,
    complexity: 1
  }
];

/**
 * Резервные блюда для обеда
 */
const LUNCH_DISHES = [
  {
    idMeal: 'fallback-lunch-001',
    strMeal: 'Куриная грудка с рисом',
    strCategory: 'Chicken',
    strMealThumb: '',
    strInstructions: 'Отварите рис. Обжарьте куриную грудку с специями на сковороде 15 минут. Подавайте с рисом и овощами.',
    strIngredient1: 'Куриная грудка',
    strIngredient2: 'Рис',
    strIngredient3: 'Морковь',
    strIngredient4: 'Лук',
    strIngredient5: 'Специи',
    cookingTime: 30,
    complexity: 4
  },
  {
    idMeal: 'fallback-lunch-002',
    strMeal: 'Спагетти болоньезе',
    strCategory: 'Pasta',
    strMealThumb: '',
    strInstructions: 'Отварите спагетти. Обжарьте фарш с луком, добавьте томаты. Тушите 20 минут. Подавайте с пастой.',
    strIngredient1: 'Спагетти',
    strIngredient2: 'Говяжий фарш',
    strIngredient3: 'Лук',
    strIngredient4: 'Томаты',
    strIngredient5: 'Чеснок',
    cookingTime: 35,
    complexity: 5
  },
  {
    idMeal: 'fallback-lunch-003',
    strMeal: 'Говядина тушеная',
    strCategory: 'Beef',
    strMealThumb: '',
    strInstructions: 'Нарежьте мясо кусочками, обжарьте. Добавьте овощи и воду. Тушите 1 час до готовности.',
    strIngredient1: 'Говядина',
    strIngredient2: 'Картофель',
    strIngredient3: 'Морковь',
    strIngredient4: 'Лук',
    strIngredient5: 'Томатная паста',
    cookingTime: 80,
    complexity: 6
  },
  {
    idMeal: 'fallback-lunch-004',
    strMeal: 'Рыба запеченная',
    strCategory: 'Seafood',
    strMealThumb: '',
    strInstructions: 'Рыбу посолите, поперчите. Запекайте в духовке 25 минут при 180°C. Подавайте с лимоном.',
    strIngredient1: 'Рыба',
    strIngredient2: 'Лимон',
    strIngredient3: 'Специи',
    strIngredient4: 'Масло',
    strIngredient5: '',
    cookingTime: 30,
    complexity: 3
  },
  {
    idMeal: 'fallback-lunch-005',
    strMeal: 'Плов простой',
    strCategory: 'Rice',
    strMealThumb: '',
    strInstructions: 'Обжарьте мясо и лук. Добавьте рис и воду в пропорции 1:2. Тушите 25 минут под крышкой.',
    strIngredient1: 'Рис',
    strIngredient2: 'Мясо',
    strIngredient3: 'Лук',
    strIngredient4: 'Морковь',
    strIngredient5: 'Специи',
    cookingTime: 45,
    complexity: 5
  }
];

/**
 * Резервные блюда для ужина
 */
const DINNER_DISHES = [
  {
    idMeal: 'fallback-dinner-001',
    strMeal: 'Салат Цезарь',
    strCategory: 'Starter',
    strMealThumb: '',
    strInstructions: 'Нарежьте салат, добавьте сухарики и сыр. Заправьте соусом цезарь. Перемешайте и подавайте.',
    strIngredient1: 'Салат айсберг',
    strIngredient2: 'Пармезан',
    strIngredient3: 'Сухарики',
    strIngredient4: 'Соус цезарь',
    strIngredient5: '',
    cookingTime: 10,
    complexity: 2
  },
  {
    idMeal: 'fallback-dinner-002',
    strMeal: 'Овощной суп',
    strCategory: 'Vegetarian',
    strMealThumb: '',
    strInstructions: 'Нарежьте овощи. Варите в воде 20 минут. Добавьте специи. Подавайте горячим с зеленью.',
    strIngredient1: 'Картофель',
    strIngredient2: 'Морковь',
    strIngredient3: 'Капуста',
    strIngredient4: 'Лук',
    strIngredient5: 'Зелень',
    cookingTime: 30,
    complexity: 3
  },
  {
    idMeal: 'fallback-dinner-003',
    strMeal: 'Омлет с овощами',
    strCategory: 'Vegetarian',
    strMealThumb: '',
    strInstructions: 'Взбейте яйца. Обжарьте овощи, добавьте яйца. Готовьте на медленном огне 5-7 минут.',
    strIngredient1: 'Яйца',
    strIngredient2: 'Помидоры',
    strIngredient3: 'Перец',
    strIngredient4: 'Лук',
    strIngredient5: 'Сыр',
    cookingTime: 15,
    complexity: 3
  },
  {
    idMeal: 'fallback-dinner-004',
    strMeal: 'Рыбные котлеты',
    strCategory: 'Seafood',
    strMealThumb: '',
    strInstructions: 'Измельчите рыбу, добавьте яйцо и муку. Сформируйте котлеты, обжарьте с двух сторон.',
    strIngredient1: 'Рыбное филе',
    strIngredient2: 'Яйцо',
    strIngredient3: 'Мука',
    strIngredient4: 'Лук',
    strIngredient5: 'Специи',
    cookingTime: 25,
    complexity: 4
  },
  {
    idMeal: 'fallback-dinner-005',
    strMeal: 'Греческий салат',
    strCategory: 'Side',
    strMealThumb: '',
    strInstructions: 'Нарежьте овощи кубиками. Добавьте сыр фета и оливки. Заправьте оливковым маслом.',
    strIngredient1: 'Помидоры',
    strIngredient2: 'Огурцы',
    strIngredient3: 'Фета',
    strIngredient4: 'Оливки',
    strIngredient5: 'Оливковое масло',
    cookingTime: 10,
    complexity: 2
  }
];

/**
 * Все резервные блюда сгруппированные по типам питания
 */
const FALLBACK_DISHES = {
  [MEAL_TYPES.BREAKFAST]: BREAKFAST_DISHES,
  [MEAL_TYPES.LUNCH]: LUNCH_DISHES,
  [MEAL_TYPES.DINNER]: DINNER_DISHES
};

/**
 * Получает резервные блюда для указанного типа питания
 * @param {string} mealType - тип питания
 * @returns {Array} массив резервных блюд
 */
export function getFallbackDishes(mealType) {
  return FALLBACK_DISHES[mealType] || [];
}

/**
 * Получает случайное резервное блюдо для указанного типа питания
 * @param {string} mealType - тип питания
 * @returns {object|null} случайное блюдо или null
 */
export function getRandomFallbackDish(mealType) {
  const dishes = getFallbackDishes(mealType);
  if (dishes.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * dishes.length);
  return dishes[randomIndex];
}

/**
 * Получает все резервные блюда
 * @returns {Array} массив всех резервных блюд
 */
export function getAllFallbackDishes() {
  return [
    ...BREAKFAST_DISHES,
    ...LUNCH_DISHES,
    ...DINNER_DISHES
  ];
}

/**
 * Добавляет новое резервное блюдо (для будущего расширения)
 * @param {string} mealType - тип питания
 * @param {object} dish - объект блюда
 */
export function addFallbackDish(mealType, dish) {
  if (FALLBACK_DISHES[mealType]) {
    FALLBACK_DISHES[mealType].push(dish);
  }
}

/**
 * Получает резервные блюда с фильтрацией по категории
 * @param {string} mealType - тип питания
 * @param {string} category - категория блюда
 * @returns {Array} отфильтрованные блюда
 */
export function getFallbackDishesByCategory(mealType, category) {
  const dishes = getFallbackDishes(mealType);
  return dishes.filter(dish => dish.strCategory === category);
}

/**
 * Получает простые резервные блюда (низкая сложность)
 * @param {string} mealType - тип питания
 * @returns {Array} простые блюда
 */
export function getSimpleFallbackDishes(mealType) {
  const dishes = getFallbackDishes(mealType);
  return dishes.filter(dish => dish.complexity <= 3);
}

/**
 * Получает быстрые резервные блюда (время приготовления <= 15 минут)
 * @param {string} mealType - тип питания
 * @returns {Array} быстрые блюда
 */
export function getQuickFallbackDishes(mealType) {
  const dishes = getFallbackDishes(mealType);
  return dishes.filter(dish => dish.cookingTime <= 15);
}

/**
 * Статистика резервных блюд
 */
export const FALLBACK_STATS = {
  totalDishes: getAllFallbackDishes().length,
  breakfastCount: BREAKFAST_DISHES.length,
  lunchCount: LUNCH_DISHES.length,
  dinnerCount: DINNER_DISHES.length,
  averageComplexity: {
    breakfast: BREAKFAST_DISHES.reduce((sum, dish) => sum + dish.complexity, 0) / BREAKFAST_DISHES.length,
    lunch: LUNCH_DISHES.reduce((sum, dish) => sum + dish.complexity, 0) / LUNCH_DISHES.length,
    dinner: DINNER_DISHES.reduce((sum, dish) => sum + dish.complexity, 0) / DINNER_DISHES.length
  },
  averageCookingTime: {
    breakfast: BREAKFAST_DISHES.reduce((sum, dish) => sum + dish.cookingTime, 0) / BREAKFAST_DISHES.length,
    lunch: LUNCH_DISHES.reduce((sum, dish) => sum + dish.cookingTime, 0) / LUNCH_DISHES.length,
    dinner: DINNER_DISHES.reduce((sum, dish) => sum + dish.cookingTime, 0) / DINNER_DISHES.length
  }
};

/**
 * Логирует информацию о резервных блюдах
 */
export function logFallbackStats() {
  console.log('[FallbackDishes] Статистика резервных блюд:', FALLBACK_STATS);
}
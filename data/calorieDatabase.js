// База данных калорийности продуктов и коэффициентов приготовления

/**
 * Калорийность продуктов на 100 грамм
 */
export const CALORIE_DATABASE = {
  // Мясо и птица
  'chicken': 165,
  'chicken breast': 165,
  'chicken thigh': 209,
  'chicken drumstick': 172,
  'beef': 250,
  'ground beef': 254,
  'pork': 242,
  'bacon': 541,
  'turkey': 135,
  'lamb': 294,
  'sausage': 301,
  'ham': 145,
  
  // Рыба и морепродукты
  'salmon': 208,
  'tuna': 144,
  'cod': 82,
  'shrimp': 99,
  'crab': 97,
  'lobster': 89,
  'mussels': 172,
  'sardines': 208,
  'mackerel': 305,
  
  // Молочные продукты
  'milk': 42,
  'butter': 717,
  'cheese': 113,
  'cheddar cheese': 403,
  'mozzarella': 300,
  'cream cheese': 342,
  'yogurt': 59,
  'greek yogurt': 59,
  'sour cream': 193,
  'heavy cream': 340,
  'cottage cheese': 98,
  
  // Яйца
  'egg': 155,
  'eggs': 155,
  'egg white': 52,
  'egg yolk': 322,
  
  // Зерновые и крупы
  'rice': 130,
  'white rice': 130,
  'brown rice': 112,
  'pasta': 131,
  'bread': 265,
  'flour': 364,
  'wheat flour': 364,
  'oats': 389,
  'quinoa': 120,
  'barley': 123,
  'couscous': 112,
  
  // Овощи
  'potato': 77,
  'sweet potato': 86,
  'tomato': 18,
  'onion': 40,
  'garlic': 149,
  'carrot': 41,
  'broccoli': 34,
  'spinach': 23,
  'lettuce': 15,
  'cucumber': 16,
  'bell pepper': 31,
  'mushroom': 22,
  'zucchini': 17,
  'eggplant': 25,
  'cabbage': 25,
  'cauliflower': 25,
  'celery': 14,
  'corn': 86,
  'peas': 81,
  'beans': 31,
  'green beans': 31,
  
  // Фрукты
  'apple': 52,
  'banana': 89,
  'orange': 47,
  'lemon': 29,
  'lime': 30,
  'strawberry': 32,
  'blueberry': 57,
  'grape': 62,
  'pineapple': 50,
  'mango': 60,
  'avocado': 160,
  'coconut': 354,
  
  // Орехи и семена
  'almond': 579,
  'walnut': 654,
  'peanut': 567,
  'cashew': 553,
  'pistachio': 560,
  'sunflower seeds': 584,
  'pumpkin seeds': 559,
  
  // Масла и жиры
  'olive oil': 884,
  'vegetable oil': 884,
  'coconut oil': 862,
  'canola oil': 884,
  
  // Специи и приправы (на чайную ложку ~2г)
  'salt': 0,
  'pepper': 251,
  'paprika': 282,
  'cumin': 375,
  'oregano': 265,
  'basil': 233,
  'thyme': 276,
  'rosemary': 131,
  'parsley': 36,
  'cilantro': 23,
  'ginger': 80,
  'cinnamon': 247,
  'vanilla': 288,
  
  // Сахар и подсластители
  'sugar': 387,
  'brown sugar': 380,
  'honey': 304,
  'maple syrup': 260,
  
  // Бобовые
  'lentils': 116,
  'chickpeas': 164,
  'black beans': 132,
  'kidney beans': 127,
  'soybeans': 173,
  'tofu': 76,
  
  // Напитки
  'wine': 85,
  'beer': 43,
  'vinegar': 18,
  'soy sauce': 8,
  'tomato sauce': 29,
  'ketchup': 112,
  'mayonnaise': 680,
  'mustard': 66,
  
  // Морепродукты расширенный список
  'fish': 140, // средняя рыба
  'white fish': 100,
  'oily fish': 200,
  'shellfish': 99,
  
  // Мука и выпечка
  'all-purpose flour': 364,
  'whole wheat flour': 340,
  'bread flour': 361,
  'cake flour': 349,
  'baking powder': 53,
  'baking soda': 0,
  'yeast': 325,
  
  // Дополнительные продукты
  'chocolate': 546,
  'dark chocolate': 546,
  'cocoa powder': 228,
  'peanut butter': 588,
  'jam': 278,
  'cream': 340,
  'ice cream': 207
};

/**
 * Стандартные веса мер измерения в граммах
 */
export const MEASUREMENT_WEIGHTS = {
  // Жидкости (мл конвертируем 1:1 в граммы для большинства продуктов)
  'cup': {
    'flour': 125,
    'sugar': 200,
    'brown sugar': 213,
    'rice': 185,
    'milk': 240,
    'water': 240,
    'oil': 218,
    'butter': 227,
    'default': 240
  },
  
  'tablespoon': {
    'flour': 8,
    'sugar': 12,
    'oil': 14,
    'butter': 14,
    'honey': 21,
    'default': 15
  },
  
  'teaspoon': {
    'salt': 6,
    'sugar': 4,
    'oil': 5,
    'spices': 2,
    'default': 5
  },
  
  // Штучные измерения
  'piece': {
    'egg': 50,
    'banana': 120,
    'apple': 150,
    'orange': 130,
    'potato': 150,
    'tomato': 100,
    'onion': 110,
    'garlic clove': 3,
    'default': 100
  },
  
  'slice': {
    'bread': 25,
    'cheese': 20,
    'bacon': 15,
    'ham': 30,
    'default': 25
  },
  
  'can': {
    'tomatoes': 400,
    'beans': 400,
    'tuna': 150,
    'default': 400
  },
  
  // Специальные измерения
  'head': {
    'lettuce': 500,
    'cabbage': 900,
    'garlic': 40,
    'default': 500
  },
  
  'bunch': {
    'spinach': 100,
    'parsley': 30,
    'cilantro': 25,
    'default': 50
  },
  
  'handful': {
    'nuts': 30,
    'seeds': 25,
    'default': 30
  }
};

/**
 * Коэффициенты изменения калорийности в зависимости от способа приготовления
 */
export const COOKING_METHOD_MULTIPLIERS = {
  // Увеличивают калорийность
  'fried': 1.3,        // Жареное +30%
  'deep fried': 1.5,   // Во фритюре +50%
  'pan fried': 1.2,    // На сковороде +20%
  'sautéed': 1.15,     // Обжаренное +15%
  'roasted': 1.1,      // Запеченное +10%
  'grilled': 1.05,     // На гриле +5%
  'baked': 1.05,       // Выпеченное +5%
  
  // Не изменяют калорийность
  'boiled': 1.0,       // Вареное
  'steamed': 1.0,      // На пару
  'poached': 1.0,      // Припущенное
  'blanched': 1.0,     // Бланшированное
  'raw': 1.0,          // Сырое
  
  // Уменьшают калорийность (удаляют жир)
  'grilled lean': 0.9, // Гриль без жира -10%
  'broiled': 0.95      // На решетке -5%
};

/**
 * Категории калорийности блюд
 */
export const CALORIE_CATEGORIES = {
  LOW: {
    max: 400,
    label: 'Легкое',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600'
  },
  MODERATE: {
    min: 400,
    max: 700,
    label: 'Умеренное',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600'
  },
  HIGH: {
    min: 700,
    label: 'Высококалорийное',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600'
  }
};

/**
 * Получает калорийность продукта на 100г
 * @param {string} ingredient - название ингредиента
 * @returns {number} калории на 100г
 */
export function getIngredientCalories(ingredient) {
  if (!ingredient) return 0;
  
  const normalizedIngredient = ingredient.toLowerCase().trim();
  
  // Прямое совпадение
  if (CALORIE_DATABASE[normalizedIngredient]) {
    return CALORIE_DATABASE[normalizedIngredient];
  }
  
  // Поиск частичного совпадения
  for (const [key, calories] of Object.entries(CALORIE_DATABASE)) {
    if (normalizedIngredient.includes(key) || key.includes(normalizedIngredient)) {
      return calories;
    }
  }
  
  // Категориальная оценка если не найдено точное соответствие
  if (normalizedIngredient.includes('meat') || normalizedIngredient.includes('beef') || normalizedIngredient.includes('pork')) {
    return 250; // Среднее мясо
  }
  if (normalizedIngredient.includes('fish') || normalizedIngredient.includes('seafood')) {
    return 140; // Средняя рыба
  }
  if (normalizedIngredient.includes('vegetable') || normalizedIngredient.includes('veggie')) {
    return 30; // Средние овощи
  }
  if (normalizedIngredient.includes('fruit')) {
    return 50; // Средние фрукты
  }
  if (normalizedIngredient.includes('oil') || normalizedIngredient.includes('fat')) {
    return 884; // Масла
  }
  if (normalizedIngredient.includes('nut') || normalizedIngredient.includes('seed')) {
    return 580; // Орехи и семена
  }
  
  // По умолчанию для неизвестных ингредиентов
  return 100;
}

/**
 * Определяет категорию калорийности
 * @param {number} calories - количество калорий
 * @returns {object} объект категории
 */
export function getCalorieCategory(calories) {
  if (calories < CALORIE_CATEGORIES.LOW.max) {
    return CALORIE_CATEGORIES.LOW;
  }
  if (calories <= CALORIE_CATEGORIES.MODERATE.max) {
    return CALORIE_CATEGORIES.MODERATE;
  }
  return CALORIE_CATEGORIES.HIGH;
}
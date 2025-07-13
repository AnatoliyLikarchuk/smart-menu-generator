// Базовые константы для Smart Menu Generator

// API конфигурация
export const API_CONFIG = {
  MEAL_DB_BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
  REQUEST_TIMEOUT: 10000, // 10 секунд
  MAX_RETRIES: 3
};

// Типы питания
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch', 
  DINNER: 'dinner'
};

// Временные диапазоны для типов питания
export const TIME_RANGES = {
  BREAKFAST: { start: 7, end: 11 },
  LUNCH: { start: 12, end: 16 },
  DINNER: { start: 17, end: 23 }
};

// Уровни сложности блюд
export const COMPLEXITY_LEVELS = {
  SIMPLE: { min: 0, max: 5, label: 'Простое' },
  MEDIUM: { min: 6, max: 10, label: 'Среднее' },
  COMPLEX: { min: 11, max: 20, label: 'Сложное' }
};

// Временные категории для приготовления
export const COOKING_TIME_CATEGORIES = {
  QUICK: { max: 20, label: 'Быстро' },
  MEDIUM: { min: 21, max: 45, label: 'Средне' },
  LONG: { min: 46, label: 'Долго' }
};

// Максимальные значения для нормализации оценок
export const MAX_SCORES = {
  TIME_BASED: 5,
  COMPLEXITY_BASED: 5,
  NUTRITION_BASED: 3,
  PREFERENCE_BASED: 2
};

// Минимальный score для включения блюда в выборку
export const MIN_DISH_SCORE = 1;

// LocalStorage ключи
export const STORAGE_KEYS = {
  PREFERENCES: 'menuPreferences',
  HISTORY: 'dishHistory',
  FAVORITES: 'favorites',
  BLACKLIST: 'blacklist'
};

// Настройки истории
export const HISTORY_CONFIG = {
  MAX_HISTORY_SIZE: 50,
  REPEAT_AVOIDANCE_DAYS: 3
};

// Настройки по умолчанию для пользователя
export const DEFAULT_PREFERENCES = {
  dislikedIngredients: [],
  dietaryRestrictions: [],
  preferredComplexity: 'any',
  
  // Предпочтения по времени дня
  timePreferences: {
    breakfast: { preferLight: true, preferQuick: true },
    lunch: { preferNutritional: true, preferFilling: true },
    dinner: { preferComplex: false, preferHealthy: true }
  },
  
  // Настройки уведомлений
  notifications: {
    reminders: false,
    suggestions: true
  }
};

// Ключевые слова для анализа рецептов
export const ANALYSIS_KEYWORDS = {
  PROTEINS: [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 
    'turkey', 'lamb', 'duck', 'eggs', 'tofu', 'beans', 'lentils'
  ],
  VEGETABLES: [
    'onion', 'garlic', 'tomato', 'carrot', 'potato', 'pepper', 
    'mushroom', 'spinach', 'broccoli', 'cucumber', 'lettuce'
  ],
  COOKING_METHODS: {
    HEALTHY: ['steam', 'grill', 'bake', 'roast', 'poach'],
    QUICK: ['fry', 'sauté', 'stir', 'microwave'],
    SLOW: ['braise', 'stew', 'slow cook', 'marinate']
  },
  TIME_INDICATORS: [
    'minutes', 'mins', 'hours', 'hrs', 'overnight', 'quickly', 'fast'
  ]
};

// Статусы ответов API
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  FALLBACK: 'fallback'
};
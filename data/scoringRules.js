// Правила оценки и весовые коэффициенты для системы умного выбора

import { MEAL_TYPES, COMPLEXITY_LEVELS, COOKING_TIME_CATEGORIES } from '../utils/constants.js';

/**
 * Весовые коэффициенты для разных типов питания
 * Чем выше значение, тем лучше для данного типа питания
 */
export const SCORING_WEIGHTS = {
  [MEAL_TYPES.BREAKFAST]: {
    cookingTime: {
      [COOKING_TIME_CATEGORIES.QUICK.label]: 5,      // Быстро - отлично для завтрака
      [COOKING_TIME_CATEGORIES.MEDIUM.label]: 3,     // Средне - приемлемо
      [COOKING_TIME_CATEGORIES.LONG.label]: 1        // Долго - плохо для завтрака
    },
    complexity: {
      [COMPLEXITY_LEVELS.SIMPLE.label]: 5,           // Простое - идеально утром
      [COMPLEXITY_LEVELS.MEDIUM.label]: 3,           // Среднее - приемлемо
      [COMPLEXITY_LEVELS.COMPLEX.label]: 1           // Сложное - плохо утром
    },
    nutrition: {
      highCarb: 4,        // Углеводы нужны с утра
      balanced: 3,        // Сбалансированное питание хорошо
      highProtein: 2,     // Белки менее важны утром
      lowCalorie: 2,      // Низкокалорийное не очень подходит
      sweet: 4            // Сладкое подходит для завтрака
    },
    categoryBonus: {
      'Breakfast': 3,     // Бонус за категорию завтрак
      'Dessert': 2,       // Бонус за десерты утром
      'Miscellaneous': 1  // Небольшой бонус
    }
  },

  [MEAL_TYPES.LUNCH]: {
    cookingTime: {
      [COOKING_TIME_CATEGORIES.QUICK.label]: 3,      // Быстро - хорошо
      [COOKING_TIME_CATEGORIES.MEDIUM.label]: 5,     // Средне - отлично для обеда
      [COOKING_TIME_CATEGORIES.LONG.label]: 2        // Долго - можно, но не идеально
    },
    complexity: {
      [COMPLEXITY_LEVELS.SIMPLE.label]: 2,           // Простое - можно
      [COMPLEXITY_LEVELS.MEDIUM.label]: 5,           // Среднее - отлично
      [COMPLEXITY_LEVELS.COMPLEX.label]: 3           // Сложное - хорошо если есть время
    },
    nutrition: {
      highCarb: 3,        // Углеводы хороши
      balanced: 5,        // Сбалансированное - идеально
      highProtein: 4,     // Белки важны для обеда
      lowCalorie: 2,      // Низкокалорийное не подходит для обеда
      hearty: 4           // Сытное - хорошо для обеда
    },
    categoryBonus: {
      'Beef': 3,          // Мясные блюда отлично
      'Chicken': 3,       // Курица отлично
      'Pasta': 3,         // Паста хороша для обеда
      'Seafood': 2,       // Морепродукты хороши
      'Pork': 2           // Свинина хороша
    }
  },

  [MEAL_TYPES.DINNER]: {
    cookingTime: {
      [COOKING_TIME_CATEGORIES.QUICK.label]: 5,      // Быстро - отлично вечером
      [COOKING_TIME_CATEGORIES.MEDIUM.label]: 4,     // Средне - хорошо
      [COOKING_TIME_CATEGORIES.LONG.label]: 2        // Долго - плохо вечером
    },
    complexity: {
      [COMPLEXITY_LEVELS.SIMPLE.label]: 5,           // Простое - идеально вечером
      [COMPLEXITY_LEVELS.MEDIUM.label]: 3,           // Среднее - приемлемо
      [COMPLEXITY_LEVELS.COMPLEX.label]: 1           // Сложное - плохо вечером
    },
    nutrition: {
      highCarb: 2,        // Углеводы менее желательны вечером
      balanced: 4,        // Сбалансированное хорошо
      highProtein: 3,     // Белки хороши
      lowCalorie: 5,      // Низкокалорийное - отлично вечером
      light: 5,           // Легкое - идеально вечером
      comforting: 3       // Успокаивающее хорошо
    },
    categoryBonus: {
      'Seafood': 3,       // Морепродукты отлично на ужин
      'Vegetarian': 3,    // Вегетарианское хорошо
      'Chicken': 2,       // Курица хороша
      'Side': 2,          // Гарниры хороши
      'Starter': 2        // Закуски подходят
    }
  }
};

/**
 * Модификаторы оценки на основе времени дня и контекста
 */
export const CONTEXTUAL_MODIFIERS = {
  timeOfDay: {
    earlyMorning: {      // 6-8 утра
      quickCooking: 2,   // Дополнительный бонус за быстроту
      simple: 1,         // Бонус за простоту
      energizing: 1      // Бонус за энергетичность
    },
    lateEvening: {       // 21-23 вечера
      light: 2,          // Бонус за легкость
      quick: 2,          // Бонус за быстроту
      comforting: 1      // Бонус за успокаивающие блюда
    }
  },
  
  dayOfWeek: {
    weekend: {           // Выходные
      complex: 1,        // Можно сложнее
      experimental: 1,   // Можно попробовать что-то новое
      longCooking: 1     // Можно готовить дольше
    },
    weekday: {           // Будни
      quick: 1,          // Бонус за быстроту
      simple: 1,         // Бонус за простоту
      reliable: 1        // Бонус за проверенные блюда
    }
  },
  
  urgency: {
    high: {              // Высокая срочность
      quick: 3,          // Большой бонус за скорость
      simple: 2,         // Бонус за простоту
      familiar: 1        // Бонус за знакомые блюда
    },
    low: {               // Низкая срочность
      complex: 1,        // Можно сложнее
      experimental: 2,   // Можно экспериментировать
      quality: 1         // Бонус за качество
    }
  }
};

/**
 * Штрафы за нежелательные характеристики
 */
export const PENALTY_RULES = {
  cookingTime: {
    tooLong: -3,         // Слишком долго готовить
    unrealistic: -5      // Нереально долго (>2 часов)
  },
  
  complexity: {
    tooComplex: -2,      // Слишком сложно
    overwhelming: -4     // Чрезмерно сложно (>15 ингредиентов)
  },
  
  nutrition: {
    unbalanced: -1,      // Несбалансированное
    unhealthy: -2        // Нездоровое
  },
  
  userPreferences: {
    disliked: -10,       // Нелюбимый ингредиент
    blacklisted: -100,   // В черном списке
    recentlyShown: -5    // Недавно показывалось
  }
};

/**
 * Бонусы за желательные характеристики
 */
export const BONUS_RULES = {
  userPreferences: {
    liked: 5,            // Понравившееся ранее
    favorite: 10,        // В избранном
    preferredCategory: 3, // Предпочитаемая категория
    dietaryMatch: 2      // Соответствует диете
  },
  
  seasonal: {
    inSeason: 1,         // По сезону
    holiday: 2           // Праздничное блюдо
  },
  
  variety: {
    newCategory: 1,      // Новая категория
    different: 1         // Отличается от недавних
  }
};

/**
 * Получает весовые коэффициенты для конкретного типа питания
 * @param {string} mealType - тип питания
 * @returns {object} весовые коэффициенты
 */
export function getScoringWeights(mealType) {
  return SCORING_WEIGHTS[mealType] || SCORING_WEIGHTS[MEAL_TYPES.LUNCH];
}

/**
 * Получает контекстуальные модификаторы для текущих условий
 * @param {object} context - контекст (время, день недели, срочность)
 * @returns {object} модификаторы оценки
 */
export function getContextualModifiers(context) {
  const modifiers = {};
  
  // Модификаторы времени дня
  if (context.isEarlyMorning) {
    Object.assign(modifiers, CONTEXTUAL_MODIFIERS.timeOfDay.earlyMorning);
  }
  if (context.isLateEvening) {
    Object.assign(modifiers, CONTEXTUAL_MODIFIERS.timeOfDay.lateEvening);
  }
  
  // Модификаторы дня недели
  if (context.isWeekend) {
    Object.assign(modifiers, CONTEXTUAL_MODIFIERS.dayOfWeek.weekend);
  } else {
    Object.assign(modifiers, CONTEXTUAL_MODIFIERS.dayOfWeek.weekday);
  }
  
  // Модификаторы срочности
  if (context.urgency === 'высокая') {
    Object.assign(modifiers, CONTEXTUAL_MODIFIERS.urgency.high);
  } else if (context.urgency === 'низкая') {
    Object.assign(modifiers, CONTEXTUAL_MODIFIERS.urgency.low);
  }
  
  return modifiers;
}

/**
 * Вычисляет итоговую оценку с учетом всех факторов
 * @param {number} baseScore - базовая оценка
 * @param {object} modifiers - модификаторы
 * @param {object} penalties - штрафы
 * @param {object} bonuses - бонусы
 * @returns {number} итоговая оценка
 */
export function calculateFinalScore(baseScore, modifiers = {}, penalties = {}, bonuses = {}) {
  let score = baseScore;
  
  // Применяем модификаторы (умножение)
  Object.values(modifiers).forEach(modifier => {
    score += modifier;
  });
  
  // Применяем бонусы
  Object.values(bonuses).forEach(bonus => {
    score += bonus;
  });
  
  // Применяем штрафы
  Object.values(penalties).forEach(penalty => {
    score += penalty; // penalty уже отрицательный
  });
  
  // Убеждаемся, что оценка не отрицательная
  return Math.max(0, score);
}

/**
 * Пороговые значения для категоризации оценок
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 15,        // Отличное блюдо
  GOOD: 10,            // Хорошее блюдо
  AVERAGE: 5,          // Среднее блюдо
  POOR: 2,             // Плохое блюдо
  MINIMAL: 1           // Минимальная оценка для включения
};

/**
 * Определяет категорию оценки
 * @param {number} score - оценка блюда
 * @returns {string} категория оценки
 */
export function getScoreCategory(score) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'excellent';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'good';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return 'average';
  if (score >= SCORE_THRESHOLDS.POOR) return 'poor';
  return 'minimal';
}
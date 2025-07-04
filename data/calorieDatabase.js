// Упрощенная база данных - только категории калорийности по типам питания

/**
 * Категории калорийности блюд по типам приема пищи (международные стандарты)
 */
export const CALORIE_CATEGORIES_BY_MEAL = {
  BREAKFAST: {
    LOW: {
      max: 250,
      label: 'Легкий завтрак',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    NORMAL: {
      min: 250,
      max: 400,
      label: 'Нормальный завтрак',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    HIGH: {
      min: 400,
      label: 'Плотный завтрак',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  },
  LUNCH: {
    LOW: {
      max: 400,
      label: 'Легкий обед',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    NORMAL: {
      min: 400,
      max: 700,
      label: 'Нормальный обед',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    HIGH: {
      min: 700,
      label: 'Плотный обед',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  },
  DINNER: {
    LOW: {
      max: 400,
      label: 'Легкий ужин',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    NORMAL: {
      min: 400,
      max: 700,
      label: 'Нормальный ужин',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    HIGH: {
      min: 700,
      label: 'Плотный ужин',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  },
  // Fallback для общего случая
  GENERAL: {
    LOW: {
      max: 400,
      label: 'Легкое',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    NORMAL: {
      min: 400,
      max: 700,
      label: 'Умеренное',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    HIGH: {
      min: 700,
      label: 'Высококалорийное',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  }
};

/**
 * Старые категории для обратной совместимости
 */
export const CALORIE_CATEGORIES = CALORIE_CATEGORIES_BY_MEAL.GENERAL;

/**
 * Определяет категорию калорийности с учетом типа приема пищи
 * @param {number} calories - количество калорий
 * @param {string} mealType - тип приема пищи ('BREAKFAST', 'LUNCH', 'DINNER', 'GENERAL')
 * @returns {object} объект категории
 */
export function getCalorieCategory(calories, mealType = 'GENERAL') {
  const categories = CALORIE_CATEGORIES_BY_MEAL[mealType] || CALORIE_CATEGORIES_BY_MEAL.GENERAL;
  
  if (calories < categories.LOW.max) {
    return categories.LOW;
  }
  if (categories.NORMAL && calories >= categories.NORMAL.min && calories <= categories.NORMAL.max) {
    return categories.NORMAL;
  }
  return categories.HIGH;
}

/**
 * Получает тип приема пищи по времени
 * @param {Date} currentTime - текущее время
 * @returns {string} тип приема пищи
 */
export function getMealTypeByTime(currentTime = new Date()) {
  const hour = currentTime.getHours();
  
  if (hour >= 6 && hour < 11) {
    return 'BREAKFAST';
  } else if (hour >= 11 && hour < 17) {
    return 'LUNCH';
  } else if (hour >= 17 && hour < 23) {
    return 'DINNER';
  }
  
  return 'GENERAL'; // Ночные перекусы
}
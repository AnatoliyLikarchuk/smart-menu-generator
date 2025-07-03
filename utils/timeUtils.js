// Утилиты для работы с временем и определения типа питания

import { MEAL_TYPES, TIME_RANGES } from './constants.js';

/**
 * Определяет тип питания на основе текущего времени
 * @returns {string} тип питания (breakfast, lunch, dinner)
 */
export function getCurrentMealType() {
  const hour = new Date().getHours();
  
  if (hour >= TIME_RANGES.BREAKFAST.start && hour <= TIME_RANGES.BREAKFAST.end) {
    return MEAL_TYPES.BREAKFAST;
  }
  
  if (hour >= TIME_RANGES.LUNCH.start && hour <= TIME_RANGES.LUNCH.end) {
    return MEAL_TYPES.LUNCH;
  }
  
  return MEAL_TYPES.DINNER;
}

/**
 * Получает контекстуальные предпочтения на основе времени и дня недели
 * @returns {object} объект с контекстуальной информацией
 */
export function getContextualPreferences() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = воскресенье, 6 = суббота
  
  return {
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
    isEarlyMorning: hour >= 6 && hour <= 8,
    isMorning: hour >= 9 && hour <= 11,
    isAfternoon: hour >= 12 && hour <= 17,
    isEvening: hour >= 18 && hour <= 21,
    isLateEvening: hour >= 22 || hour <= 5,
    timeAvailable: getAvailableTime(hour, dayOfWeek),
    urgency: getUrgencyLevel(hour),
    mealType: getCurrentMealType()
  };
}

/**
 * Определяет доступное время для готовки на основе времени дня и дня недели
 * @param {number} hour - текущий час
 * @param {number} dayOfWeek - день недели (0-6)
 * @returns {string} категория доступного времени
 */
function getAvailableTime(hour, dayOfWeek) {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Выходные - больше времени
  if (isWeekend) {
    if (hour >= 10 && hour <= 16) return 'много'; // день выходного
    if (hour >= 8 && hour <= 21) return 'средне';
    return 'мало';
  }
  
  // Будни - меньше времени
  if (hour >= 7 && hour <= 8) return 'мало'; // утренняя спешка
  if (hour >= 12 && hour <= 13) return 'мало'; // обеденный перерыв
  if (hour >= 18 && hour <= 20) return 'средне'; // вечер после работы
  if (hour >= 21) return 'мало'; // поздний вечер
  
  return 'средне';
}

/**
 * Определяет уровень срочности на основе времени
 * @param {number} hour - текущий час
 * @returns {string} уровень срочности
 */
function getUrgencyLevel(hour) {
  // Время приема пищи - высокая срочность
  if ((hour >= 7 && hour <= 9) ||   // завтрак
      (hour >= 12 && hour <= 14) || // обед
      (hour >= 18 && hour <= 20)) { // ужин
    return 'высокая';
  }
  
  // Поздний вечер - низкая срочность
  if (hour >= 22 || hour <= 6) {
    return 'низкая';
  }
  
  return 'средняя';
}

/**
 * Проверяет, подходит ли блюдо по времени приготовления для текущей ситуации
 * @param {number} cookingTime - время приготовления в минутах
 * @param {object} context - контекстуальные предпочтения
 * @returns {boolean} подходит ли блюдо
 */
export function isTimeAppropriate(cookingTime, context = null) {
  if (!context) {
    context = getContextualPreferences();
  }
  
  // Если время не определено, считаем подходящим
  if (!cookingTime || cookingTime === 0) return true;
  
  const { timeAvailable, urgency } = context;
  
  // Высокая срочность - только быстрые блюда
  if (urgency === 'высокая') {
    return cookingTime <= 30;
  }
  
  // Мало времени - только быстрые блюда
  if (timeAvailable === 'мало') {
    return cookingTime <= 25;
  }
  
  // Среднее время - до 45 минут
  if (timeAvailable === 'средне') {
    return cookingTime <= 45;
  }
  
  // Много времени - любые блюда до 90 минут
  if (timeAvailable === 'много') {
    return cookingTime <= 90;
  }
  
  return true;
}

/**
 * Получает предпочтительные типы блюд для текущего времени
 * @param {string} mealType - тип питания
 * @param {object} context - контекстуальные предпочтения
 * @returns {object} предпочтения по типам блюд
 */
export function getMealTypePreferences(mealType = null, context = null) {
  if (!mealType) {
    mealType = getCurrentMealType();
  }
  
  if (!context) {
    context = getContextualPreferences();
  }
  
  const basePreferences = {
    [MEAL_TYPES.BREAKFAST]: {
      preferLight: true,
      preferSweet: true,
      preferQuick: true,
      preferWarm: context.isEarlyMorning
    },
    [MEAL_TYPES.LUNCH]: {
      preferHearty: true,
      preferProtein: true,
      preferFilling: true,
      preferBalanced: true
    },
    [MEAL_TYPES.DINNER]: {
      preferLight: context.isLateEvening,
      preferComforting: true,
      preferWarm: true,
      preferLessSpicy: context.isEvening
    }
  };
  
  const preferences = basePreferences[mealType] || {};
  
  // Модификации на основе дня недели
  if (context.isWeekend) {
    preferences.allowComplex = true;
    preferences.allowLongerCooking = true;
  }
  
  return preferences;
}

/**
 * Форматирует время для отображения
 * @param {number} minutes - время в минутах
 * @returns {string} отформатированное время
 */
export function formatCookingTime(minutes) {
  if (!minutes || minutes === 0) return 'Время не указано';
  
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }
  
  return `${hours} ч ${remainingMinutes} мин`;
}

/**
 * Определяет оптимальное время для планирования следующего приема пищи
 * @param {string} currentMealType - текущий тип питания
 * @returns {object} информация о следующем приеме пищи
 */
export function getNextMealInfo(currentMealType = null) {
  if (!currentMealType) {
    currentMealType = getCurrentMealType();
  }
  
  const now = new Date();
  const nextMealMap = {
    [MEAL_TYPES.BREAKFAST]: {
      type: MEAL_TYPES.LUNCH,
      suggestedHour: 13,
      hoursUntil: 13 - now.getHours()
    },
    [MEAL_TYPES.LUNCH]: {
      type: MEAL_TYPES.DINNER,
      suggestedHour: 19,
      hoursUntil: 19 - now.getHours()
    },
    [MEAL_TYPES.DINNER]: {
      type: MEAL_TYPES.BREAKFAST,
      suggestedHour: 8,
      hoursUntil: (24 - now.getHours()) + 8
    }
  };
  
  return nextMealMap[currentMealType] || null;
}
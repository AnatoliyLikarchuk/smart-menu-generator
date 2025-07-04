// Упрощенный сервис для расчета калорийности блюд с помощью ИИ DeepSeek

import DeepSeekService from './deepSeekService.js';
import { getMealTypeByTime } from '../data/calorieDatabase.js';

/**
 * Упрощенный сервис для расчета калорийности блюд с использованием ИИ
 */
export class CalorieService {
  
  /**
   * Рассчитывает общую калорийность блюда с помощью ИИ DeepSeek
   * @param {object} dish - объект блюда из API
   * @param {string} mealType - тип приема пищи (опционально)
   * @returns {object} объект с калориями и категорией или fallback
   */
  static async calculateDishCalories(dish, mealType = null) {
    // Определяем тип приема пищи по времени если не передан
    const actualMealType = mealType || getMealTypeByTime();
    
    if (!dish) {
      return this.getFallbackResult(actualMealType);
    }
    
    try {
      console.log(`[CalorieService] Запрос ИИ анализа для "${dish.strMeal}"`);
      
      // Используем ИИ DeepSeek для точного анализа
      const result = await DeepSeekService.calculateDishCalories(dish, actualMealType);
      
      console.log(`[CalorieService] ИИ анализ успешен: ${result.calories} ккал (${result.category.label})`);
      
      return result;
      
    } catch (error) {
      console.warn(`[CalorieService] Ошибка ИИ анализа для "${dish.strMeal}":`, error.message);
      
      // Fallback: возвращаем "калорийность не определена"
      return this.getFallbackResult(actualMealType, dish.strMeal);
    }
  }
  
  /**
   * Возвращает fallback результат при ошибке ИИ
   * @param {string} mealType - тип приема пищи
   * @param {string} dishName - название блюда (опционально)
   * @returns {object} fallback объект
   */
  static getFallbackResult(mealType = 'GENERAL', dishName = '') {
    console.log(`[CalorieService] Fallback: калорийность не определена для "${dishName}"`);
    
    return {
      calories: null,
      category: {
        label: 'Калорийность не определена',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
      },
      mealType: mealType,
      source: 'fallback',
      error: true
    };
  }
  
  /**
   * Извлекает ингредиенты из объекта блюда (для совместимости)
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
   * Проверяет, является ли блюдо низкокалорийным (для совместимости)
   * @param {number|null} calories - количество калорий
   * @returns {boolean} true если низкокалорийное
   */
  static isLowCalorie(calories) {
    return calories !== null && calories < 400;
  }
  
  /**
   * Проверяет, является ли блюдо высококалорийным (для совместимости)
   * @param {number|null} calories - количество калорий
   * @returns {boolean} true если высококалорийное
   */
  static isHighCalorie(calories) {
    return calories !== null && calories > 700;
  }
  
  /**
   * Получает краткое описание калорийности (для совместимости)
   * @param {number|null} calories - количество калорий
   * @returns {string} описание
   */
  static getCalorieDescription(calories) {
    if (calories === null) {
      return 'Калорийность не определена';
    }
    return `${calories} ккал`;
  }
}

export default CalorieService;
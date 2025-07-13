// Сервис оценки блюд - вычисляет рейтинг на основе множества факторов

import { analyzeDish } from '../utils/mealAnalyzer.js';
import { 
  getScoringWeights, 
  getContextualModifiers, 
  calculateFinalScore,
  PENALTY_RULES,
  BONUS_RULES,
  SCORE_THRESHOLDS,
  getScoreCategory
} from '../data/scoringRules.js';
import { getCategoryPriority } from '../data/categories.js';
import { validateCuisines, isPopularCuisine } from '../data/cuisines.js';
import { getContextualPreferences, isTimeAppropriate } from '../utils/timeUtils.js';
import { MIN_DISH_SCORE } from '../utils/constants.js';

/**
 * Сервис для оценки блюд по умному алгоритму
 */
export class ScoringService {
  
  /**
   * Оценивает массив блюд и возвращает их с оценками
   * @param {Array} dishes - массив блюд
   * @param {string} mealType - тип питания
   * @param {object} userPreferences - предпочтения пользователя
   * @param {object} context - контекстуальная информация
   * @returns {Promise<Array>} массив блюд с оценками
   */
  static async scoreDishes(dishes, mealType, userPreferences = {}, context = null) {
    if (!context) {
      context = getContextualPreferences();
    }
    
    // Используем Promise.all для параллельного анализа блюд
    const scoredDishes = await Promise.all(
      dishes.map(async dish => {
        try {
          const analysis = await analyzeDish(dish, mealType);
          const score = this.calculateDishScore(dish, analysis, mealType, userPreferences, context);
          
          return {
            dish,
            analysis,
            score,
            scoreCategory: getScoreCategory(score),
            isRecommended: score >= SCORE_THRESHOLDS.GOOD
          };
        } catch (error) {
          console.warn(`[ScoringService] Ошибка анализа блюда "${dish.strMeal}":`, error.message);
          // Возвращаем блюдо с низкой оценкой при ошибке
          return {
            dish,
            analysis: { error: true },
            score: 0,
            scoreCategory: getScoreCategory(0),
            isRecommended: false
          };
        }
      })
    );
    
    return scoredDishes.filter(item => item.score >= MIN_DISH_SCORE); // Отфильтровываем блюда с очень низкой оценкой
  }
  
  /**
   * Вычисляет оценку конкретного блюда
   * @param {object} dish - объект блюда
   * @param {object} analysis - результат анализа блюда
   * @param {string} mealType - тип питания
   * @param {object} userPreferences - предпочтения пользователя
   * @param {object} context - контекстуальная информация
   * @returns {number} оценка блюда
   */
  static calculateDishScore(dish, analysis, mealType, userPreferences = {}, context = null) {
    if (!context) {
      context = getContextualPreferences();
    }
    
    // Получаем базовые весовые коэффициенты для типа питания
    const weights = getScoringWeights(mealType);
    
    // Вычисляем базовую оценку
    let baseScore = this.calculateBaseScore(analysis, weights, dish);
    
    // Получаем модификаторы, штрафы и бонусы
    const modifiers = getContextualModifiers(context);
    const penalties = this.calculatePenalties(dish, analysis, userPreferences, context);
    const bonuses = this.calculateBonuses(dish, analysis, mealType, userPreferences);
    
    // Вычисляем итоговую оценку
    return calculateFinalScore(baseScore, modifiers, penalties, bonuses);
  }
  
  /**
   * Вычисляет базовую оценку на основе анализа и весов
   * @param {object} analysis - анализ блюда
   * @param {object} weights - весовые коэффициенты
   * @param {object} dish - объект блюда
   * @returns {number} базовая оценка
   */
  static calculateBaseScore(analysis, weights, dish) {
    let score = 0;
    
    // Оценка времени приготовления
    const timeScore = this.getTimeScore(analysis.cookingTime, weights.cookingTime);
    score += timeScore;
    
    // Оценка сложности
    const complexityScore = this.getComplexityScore(analysis.complexity, weights.complexity);
    score += complexityScore;
    
    // Оценка питательности
    const nutritionScore = this.getNutritionScore(analysis.nutrition, weights.nutrition);
    score += nutritionScore;
    
    // Бонус за категорию
    const categoryScore = this.getCategoryScore(dish.strCategory, weights.categoryBonus);
    score += categoryScore;
    
    return score;
  }
  
  /**
   * Вычисляет оценку времени приготовления
   * @param {number} cookingTime - время в минутах
   * @param {object} timeWeights - веса для времени
   * @returns {number} оценка времени
   */
  static getTimeScore(cookingTime, timeWeights) {
    if (!cookingTime || cookingTime === 0) return 2; // Средняя оценка если время неизвестно
    
    if (cookingTime <= 20) return timeWeights['Быстро'] || 5;
    if (cookingTime <= 45) return timeWeights['Средне'] || 3;
    return timeWeights['Долго'] || 1;
  }
  
  /**
   * Вычисляет оценку сложности
   * @param {number} complexity - уровень сложности
   * @param {object} complexityWeights - веса для сложности
   * @returns {number} оценка сложности
   */
  static getComplexityScore(complexity, complexityWeights) {
    if (complexity <= 5) return complexityWeights['Простое'] || 5;
    if (complexity <= 10) return complexityWeights['Среднее'] || 3;
    return complexityWeights['Сложное'] || 1;
  }
  
  /**
   * Вычисляет оценку питательности
   * @param {object} nutrition - анализ питательности
   * @param {object} nutritionWeights - веса для питательности
   * @returns {number} оценка питательности
   */
  static getNutritionScore(nutrition, nutritionWeights) {
    let score = 0;
    
    if (nutrition.isBalanced) {
      score += nutritionWeights.balanced || 3;
    }
    
    if (nutrition.profile === 'highCarb') {
      score += nutritionWeights.highCarb || 2;
    }
    
    if (nutrition.profile === 'highProtein') {
      score += nutritionWeights.highProtein || 2;
    }
    
    if (nutrition.isLight) {
      score += nutritionWeights.lowCalorie || 2;
    }
    
    if (nutrition.isHearty) {
      score += nutritionWeights.hearty || 2;
    }
    
    return score;
  }
  
  /**
   * Вычисляет оценку категории блюда
   * @param {string} category - категория блюда
   * @param {object} categoryBonuses - бонусы за категории
   * @returns {number} оценка категории
   */
  static getCategoryScore(category, categoryBonuses) {
    return categoryBonuses ? (categoryBonuses[category] || 0) : 0;
  }
  
  /**
   * Вычисляет штрафы за нежелательные характеристики
   * @param {object} dish - объект блюда
   * @param {object} analysis - анализ блюда
   * @param {object} userPreferences - предпочтения пользователя
   * @param {object} context - контекстуальная информация
   * @returns {object} объект со штрафами
   */
  static calculatePenalties(dish, analysis, userPreferences, context) {
    const penalties = {};
    
    // Штраф за слишком долгое время приготовления
    if (analysis.cookingTime > 90) {
      penalties.tooLong = PENALTY_RULES.cookingTime.tooLong;
    }
    
    if (analysis.cookingTime > 120) {
      penalties.unrealistic = PENALTY_RULES.cookingTime.unrealistic;
    }
    
    // Штраф за слишком высокую сложность
    if (analysis.complexity > 15) {
      penalties.tooComplex = PENALTY_RULES.complexity.tooComplex;
    }
    
    if (analysis.complexity > 18) {
      penalties.overwhelming = PENALTY_RULES.complexity.overwhelming;
    }
    
    // Штрафы на основе пользовательских предпочтений
    if (userPreferences.dislikedIngredients) {
      const hasDislikedIngredient = this.checkForDislikedIngredients(dish, userPreferences.dislikedIngredients);
      if (hasDislikedIngredient) {
        penalties.disliked = PENALTY_RULES.userPreferences.disliked;
      }
    }
    
    if (userPreferences.blacklist) {
      const isBlacklisted = userPreferences.blacklist.some(item => item.idMeal === dish.idMeal);
      if (isBlacklisted) {
        penalties.blacklisted = PENALTY_RULES.userPreferences.blacklisted;
      }
    }
    
    // Штраф за недавно показанное блюдо
    if (userPreferences.history) {
      const isRecent = this.checkIfRecentlyShown(dish, userPreferences.history);
      if (isRecent) {
        penalties.recentlyShown = PENALTY_RULES.userPreferences.recentlyShown;
      }
    }
    
    // Штраф за несоответствие времени
    if (!isTimeAppropriate(analysis.cookingTime, context)) {
      penalties.timeInappropriate = -2;
    }
    
    return penalties;
  }
  
  /**
   * Вычисляет бонусы за желательные характеристики
   * @param {object} dish - объект блюда
   * @param {object} analysis - анализ блюда
   * @param {string} mealType - тип питания
   * @param {object} userPreferences - предпочтения пользователя
   * @returns {object} объект с бонусами
   */
  static calculateBonuses(dish, analysis, mealType, userPreferences) {
    const bonuses = {};
    
    // Бонусы на основе пользовательских предпочтений
    if (userPreferences.favorites) {
      const isFavorite = userPreferences.favorites.some(item => item.idMeal === dish.idMeal);
      if (isFavorite) {
        bonuses.favorite = BONUS_RULES.userPreferences.favorite;
      }
    }
    
    // Бонус за категорию блюда
    const categoryPriority = getCategoryPriority(dish.strCategory, mealType);
    if (categoryPriority > 7) {
      bonuses.preferredCategory = BONUS_RULES.userPreferences.preferredCategory;
    }
    
    // Бонус за диетические соответствия
    if (userPreferences.dietaryRestrictions) {
      const matchesDiet = this.checkDietaryMatch(analysis, userPreferences.dietaryRestrictions);
      if (matchesDiet) {
        bonuses.dietaryMatch = BONUS_RULES.userPreferences.dietaryMatch;
      }
    }
    
    // Бонус за разнообразие
    if (userPreferences.history) {
      const isDifferent = this.checkIfDifferentFromRecent(dish, userPreferences.history);
      if (isDifferent) {
        bonuses.variety = BONUS_RULES.variety.different;
      }
    }
    
    // Бонус за здоровое приготовление
    if (analysis.isHealthyCooking) {
      bonuses.healthyCooking = 1;
    }
    
    // Бонус за сбалансированность
    if (analysis.nutrition.isBalanced) {
      bonuses.balanced = 1;
    }
    
    // Бонус за предпочитаемые кухни
    if (userPreferences.preferredCuisines && userPreferences.preferredCuisines.length > 0) {
      const validCuisines = validateCuisines(userPreferences.preferredCuisines);
      if (dish.strArea && validCuisines.includes(dish.strArea)) {
        bonuses.preferredCuisine = BONUS_RULES.userPreferences.preferredCategory; // Используем тот же бонус что и для категории
        
        // Дополнительный бонус за популярные кухни
        if (isPopularCuisine(dish.strArea)) {
          bonuses.popularCuisine = 0.5;
        }
      }
    }
    
    return bonuses;
  }
  
  /**
   * Проверяет наличие нелюбимых ингредиентов
   * @param {object} dish - объект блюда
   * @param {Array} dislikedIngredients - массив нелюбимых ингредиентов
   * @returns {boolean} есть ли нелюбимые ингредиенты
   */
  static checkForDislikedIngredients(dish, dislikedIngredients) {
    const ingredientsText = this.getDishIngredientsText(dish).toLowerCase();
    return dislikedIngredients.some(ingredient => 
      ingredientsText.includes(ingredient.toLowerCase())
    );
  }
  
  /**
   * Проверяет, показывалось ли блюдо недавно
   * @param {object} dish - объект блюда
   * @param {Array} history - история показанных блюд
   * @returns {boolean} показывалось ли недавно
   */
  static checkIfRecentlyShown(dish, history) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return history.some(entry => 
      entry.dish.idMeal === dish.idMeal && 
      new Date(entry.timestamp) > threeDaysAgo
    );
  }
  
  /**
   * Проверяет соответствие диетическим ограничениям
   * @param {object} analysis - анализ блюда
   * @param {Array} dietaryRestrictions - диетические ограничения
   * @returns {boolean} соответствует ли диете
   */
  static checkDietaryMatch(analysis, dietaryRestrictions) {
    for (const restriction of dietaryRestrictions) {
      switch (restriction) {
        case 'vegetarian':
          if (!analysis.isVegetarian) return false;
          break;
        case 'lowCarb':
          if (analysis.nutrition.profile === 'highCarb') return false;
          break;
        case 'highProtein':
          if (analysis.nutrition.profile !== 'highProtein') return false;
          break;
        case 'pescatarian':
          if (!analysis.isVegetarian && !analysis.isSeafood) return false;
          break;
      }
    }
    return true;
  }
  
  /**
   * Проверяет, отличается ли блюдо от недавно показанных
   * @param {object} dish - объект блюда
   * @param {Array} history - история показанных блюд
   * @returns {boolean} отличается ли от недавних
   */
  static checkIfDifferentFromRecent(dish, history) {
    const recentDishes = history.slice(0, 5); // Последние 5 блюд
    const currentCategory = dish.strCategory;
    
    // Проверяем, была ли эта категория среди последних блюд
    const recentCategories = recentDishes.map(entry => entry.dish.strCategory);
    return !recentCategories.includes(currentCategory);
  }
  
  /**
   * Получает текст всех ингредиентов блюда
   * @param {object} dish - объект блюда
   * @returns {string} строка с ингредиентами
   */
  static getDishIngredientsText(dish) {
    let text = '';
    for (let i = 1; i <= 20; i++) {
      const ingredient = dish[`strIngredient${i}`];
      if (ingredient && ingredient.trim()) {
        text += ingredient + ' ';
      }
    }
    return text;
  }
  
  /**
   * Сортирует блюда по оценке (от высокой к низкой)
   * @param {Array} scoredDishes - массив оцененных блюд
   * @returns {Array} отсортированный массив
   */
  static sortByScore(scoredDishes) {
    return scoredDishes.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Фильтрует блюда по минимальной оценке
   * @param {Array} scoredDishes - массив оцененных блюд
   * @param {number} minScore - минимальная оценка
   * @returns {Array} отфильтрованный массив
   */
  static filterByMinScore(scoredDishes, minScore = SCORE_THRESHOLDS.AVERAGE) {
    return scoredDishes.filter(item => item.score >= minScore);
  }
}
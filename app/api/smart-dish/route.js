// API endpoint для умного выбора блюд

import { NextResponse } from 'next/server';
import { DishService } from '../../../services/dishService.js';
import { getCurrentMealType } from '../../../utils/timeUtils.js';
import { MEAL_TYPES } from '../../../utils/constants.js';

/**
 * GET /api/smart-dish - получает умно подобранное блюдо
 * 
 * Query параметры:
 * - type: тип питания (breakfast, lunch, dinner)
 * - preferences: JSON строка с предпочтениями пользователя
 * - count: количество рекомендаций (по умолчанию 1)
 * 
 * Пример: /api/smart-dish?type=lunch&preferences={"dislikedIngredients":["onion"]}&count=3
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Извлекаем параметры
    const mealType = searchParams.get('type') || getCurrentMealType();
    const preferencesParam = searchParams.get('preferences');
    const countParam = searchParams.get('count');
    
    // Валидируем тип питания
    if (!Object.values(MEAL_TYPES).includes(mealType)) {
      return NextResponse.json({
        error: 'Invalid meal type',
        message: `Meal type must be one of: ${Object.values(MEAL_TYPES).join(', ')}`,
        validTypes: Object.values(MEAL_TYPES)
      }, { status: 400 });
    }
    
    // Парсим предпочтения пользователя
    let userPreferences = {};
    if (preferencesParam) {
      try {
        userPreferences = JSON.parse(preferencesParam);
      } catch (error) {
        return NextResponse.json({
          error: 'Invalid preferences format',
          message: 'Preferences must be valid JSON',
          example: '{"dislikedIngredients":["onion"],"dietaryRestrictions":["vegetarian"]}'
        }, { status: 400 });
      }
    }
    
    // Парсим количество рекомендаций
    const count = countParam ? parseInt(countParam) : 1;
    if (isNaN(count) || count < 1 || count > 10) {
      return NextResponse.json({
        error: 'Invalid count',
        message: 'Count must be a number between 1 and 10'
      }, { status: 400 });
    }
    
    console.log(`[API] Запрос умного блюда: type=${mealType}, count=${count}`);
    
    // Получаем рекомендации
    if (count === 1) {
      // Одно блюдо
      const result = await DishService.getSmartDish(mealType, userPreferences);
      
      return NextResponse.json({
        success: true,
        data: result,
        requestInfo: {
          mealType,
          userPreferences,
          timestamp: new Date().toISOString(),
          count: 1
        }
      });
      
    } else {
      // Несколько рекомендаций
      const recommendations = await DishService.getSmartRecommendations(
        mealType, 
        userPreferences, 
        count
      );
      
      return NextResponse.json({
        success: true,
        data: {
          recommendations,
          mealType,
          totalCount: recommendations.length
        },
        requestInfo: {
          mealType,
          userPreferences,
          timestamp: new Date().toISOString(),
          count
        }
      });
    }
    
  } catch (error) {
    console.error('[API] Ошибка в smart-dish endpoint:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to get smart dish recommendation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * POST /api/smart-dish - получает умно подобранное блюдо (с телом запроса)
 * 
 * Body:
 * {
 *   "mealType": "lunch",
 *   "userPreferences": {
 *     "dislikedIngredients": ["onion"],
 *     "dietaryRestrictions": ["vegetarian"],
 *     "favorites": [],
 *     "blacklist": [],
 *     "history": []
 *   },
 *   "count": 1
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      mealType = getCurrentMealType(),
      userPreferences = {},
      count = 1
    } = body;
    
    // Валидация
    if (!Object.values(MEAL_TYPES).includes(mealType)) {
      return NextResponse.json({
        error: 'Invalid meal type',
        message: `Meal type must be one of: ${Object.values(MEAL_TYPES).join(', ')}`,
        validTypes: Object.values(MEAL_TYPES)
      }, { status: 400 });
    }
    
    if (typeof count !== 'number' || count < 1 || count > 10) {
      return NextResponse.json({
        error: 'Invalid count',
        message: 'Count must be a number between 1 and 10'
      }, { status: 400 });
    }
    
    console.log(`[API] POST запрос умного блюда: type=${mealType}, count=${count}`);
    
    // Получаем рекомендации
    if (count === 1) {
      const result = await DishService.getSmartDish(mealType, userPreferences);
      
      return NextResponse.json({
        success: true,
        data: result,
        requestInfo: {
          mealType,
          userPreferences: {
            hasDislikedIngredients: !!(userPreferences.dislikedIngredients?.length),
            hasDietaryRestrictions: !!(userPreferences.dietaryRestrictions?.length),
            hasHistory: !!(userPreferences.history?.length),
            hasFavorites: !!(userPreferences.favorites?.length),
            hasBlacklist: !!(userPreferences.blacklist?.length)
          },
          timestamp: new Date().toISOString(),
          count: 1
        }
      });
      
    } else {
      const recommendations = await DishService.getSmartRecommendations(
        mealType, 
        userPreferences, 
        count
      );
      
      return NextResponse.json({
        success: true,
        data: {
          recommendations,
          mealType,
          totalCount: recommendations.length
        },
        requestInfo: {
          mealType,
          userPreferences: {
            hasDislikedIngredients: !!(userPreferences.dislikedIngredients?.length),
            hasDietaryRestrictions: !!(userPreferences.dietaryRestrictions?.length),
            hasHistory: !!(userPreferences.history?.length),
            hasFavorites: !!(userPreferences.favorites?.length),
            hasBlacklist: !!(userPreferences.blacklist?.length)
          },
          timestamp: new Date().toISOString(),
          count
        }
      });
    }
    
  } catch (error) {
    console.error('[API] Ошибка в POST smart-dish endpoint:', error);
    
    // Проверяем, является ли это ошибкой парсинга JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to get smart dish recommendation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/smart-dish - поддержка CORS
 */
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
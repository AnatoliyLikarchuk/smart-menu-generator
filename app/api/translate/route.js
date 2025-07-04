// API endpoint для переводов с использованием DeepSeek

import { NextResponse } from 'next/server';
import DeepSeekService from '../../../services/deepSeekService.js';
import TranslationService from '../../../services/translationService.js';

/**
 * POST /api/translate
 * Переводит текст или блюдо с помощью DeepSeek API
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data, options = {} } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Требуются параметры type и data' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'dish':
        result = await translateDish(data, options);
        break;
        
      case 'dishName':
        result = await translateDishName(data, options);
        break;
        
      case 'ingredient':
        result = await translateIngredient(data, options);
        break;
        
      case 'ingredients':
        result = await translateIngredients(data, options);
        break;
        
      case 'instructions':
        result = await translateInstructions(data, options);
        break;
        
      case 'text':
        result = await translateText(data, options);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: `Неизвестный тип перевода: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      type
    });

  } catch (error) {
    console.error('[TranslateAPI] Ошибка перевода:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Внутренняя ошибка сервера' 
      },
      { status: 500 }
    );
  }
}

/**
 * Переводит полное блюдо
 */
async function translateDish(dish, options = {}) {
  if (!dish || typeof dish !== 'object') {
    throw new Error('Неверный формат блюда');
  }

  const { translateIngredients = true, useAPI = true } = options;
  
  return await TranslationService.translateDish(dish, translateIngredients, useAPI);
}

/**
 * Переводит название блюда
 */
async function translateDishName(dishName, options = {}) {
  if (!dishName || typeof dishName !== 'string') {
    throw new Error('Неверное название блюда');
  }

  const { category, area } = options;
  
  try {
    // Сначала проверяем статический словарь и кэш
    const cachedTranslation = await TranslationService.translateDishName(dishName, false);
    if (cachedTranslation !== dishName) {
      return cachedTranslation;
    }
    
    // Если не найдено, используем DeepSeek API
    return await DeepSeekService.translateDishName(dishName, category, area);
  } catch (error) {
    console.warn('[TranslateAPI] Ошибка перевода названия блюда:', error.message);
    return dishName;
  }
}

/**
 * Переводит один ингредиент
 */
async function translateIngredient(ingredient, options = {}) {
  if (!ingredient || typeof ingredient !== 'string') {
    throw new Error('Неверный ингредиент');
  }

  const { measure } = options;
  
  try {
    // Сначала проверяем статический словарь и кэш
    const cachedTranslation = await TranslationService.translateIngredient(ingredient, false);
    if (cachedTranslation !== ingredient) {
      return cachedTranslation;
    }
    
    // Если не найдено, используем DeepSeek API
    return await DeepSeekService.translateIngredient(ingredient, measure);
  } catch (error) {
    console.warn('[TranslateAPI] Ошибка перевода ингредиента:', error.message);
    return ingredient;
  }
}

/**
 * Переводит список ингредиентов
 */
async function translateIngredients(ingredients, options = {}) {
  if (!Array.isArray(ingredients)) {
    throw new Error('Неверный список ингредиентов');
  }

  const { measures = [] } = options;
  
  try {
    // Используем оптимизированный метод TranslationService
    return await TranslationService.translateIngredients(ingredients, true);
  } catch (error) {
    console.warn('[TranslateAPI] Ошибка перевода ингредиентов:', error.message);
    return ingredients;
  }
}

/**
 * Переводит инструкции приготовления
 */
async function translateInstructions(instructions, options = {}) {
  if (!instructions || typeof instructions !== 'string') {
    throw new Error('Неверные инструкции');
  }

  const { dishName } = options;
  
  try {
    return await DeepSeekService.translateInstructions(instructions, dishName);
  } catch (error) {
    console.warn('[TranslateAPI] Ошибка перевода инструкций:', error.message);
    return instructions;
  }
}

/**
 * Переводит произвольный текст
 */
async function translateText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('Неверный текст');
  }

  const { context = 'general' } = options;
  
  try {
    return await DeepSeekService.translateText(text, context, options);
  } catch (error) {
    console.warn('[TranslateAPI] Ошибка перевода текста:', error.message);
    return text;
  }
}

/**
 * GET /api/translate
 * Возвращает информацию о доступности API
 */
export async function GET() {
  try {
    const isAvailable = await DeepSeekService.checkApiAvailability();
    
    return NextResponse.json({
      success: true,
      data: {
        apiAvailable: isAvailable,
        service: 'DeepSeek',
        supportedTypes: [
          'dish',
          'dishName', 
          'ingredient',
          'ingredients',
          'instructions',
          'text'
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Не удалось проверить доступность API'
    });
  }
}
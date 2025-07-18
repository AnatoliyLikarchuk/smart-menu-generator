// Сервис перевода с использованием DeepSeek API и локального кэширования

import { 
  translateDishName, 
  translateIngredient, 
  translateCategory, 
  translateArea 
} from '../data/translations.js';
import DeepSeekService from './deepSeekService.js';

/**
 * Сервис для перевода текста на русский язык
 */
export class TranslationService {
  
  static CACHE_PREFIX = 'translation_cache_';
  static CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 дней
  static LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';
  static LIBRE_TRANSLATE_BACKUP_URL = 'https://translate.argosopentech.com/translate';
  static USE_DEEPSEEK = true; // Использовать DeepSeek API по умолчанию
  static DEEPSEEK_PRIORITY = process.env.DEEPSEEK_PRIORITY !== 'false'; // DeepSeek приоритет
  
  /**
   * Переводит название блюда
   * @param {string} dishName - название блюда на английском
   * @param {boolean} useAPI - использовать ли API для неизвестных переводов
   * @returns {Promise<string>} переведенное название
   */
  static async translateDishName(dishName, useAPI = true) {
    if (!dishName) return '';
    
    // Новая логика: DeepSeek → статический словарь → кэш → LibreTranslate
    if (this.DEEPSEEK_PRIORITY && this.USE_DEEPSEEK && useAPI && typeof window === 'undefined') {
      try {
        // 1. Сначала пробуем DeepSeek API для максимального качества
        const deepSeekTranslation = await DeepSeekService.translateDishName(dishName);
        if (deepSeekTranslation && deepSeekTranslation !== dishName) {
          this.setCachedTranslation(dishName, deepSeekTranslation);
          console.log(`[TranslationService] DeepSeek перевод: "${dishName}" -> "${deepSeekTranslation}"`);
          return deepSeekTranslation;
        }
      } catch (error) {
        console.warn('[TranslationService] DeepSeek недоступен, используем fallback:', error.message);
      }
    }
    
    // 2. Fallback: проверяем статический словарь
    const staticTranslation = translateDishName(dishName);
    if (staticTranslation !== dishName) {
      console.log(`[TranslationService] Статический словарь: "${dishName}" -> "${staticTranslation}"`);
      return staticTranslation;
    }
    
    // 3. Fallback: проверяем кэш
    const cached = this.getCachedTranslation(dishName);
    if (cached) {
      console.log(`[TranslationService] Кэш: "${dishName}" -> "${cached}"`);
      return cached;
    }
    
    // 4. Fallback: LibreTranslate для клиентской среды или если DeepSeek отключен
    if (useAPI && typeof window !== 'undefined') {
      try {
        const translated = await this.translateWithAPI(dishName);
        if (translated && translated !== dishName) {
          this.setCachedTranslation(dishName, translated);
          console.log(`[TranslationService] LibreTranslate: "${dishName}" -> "${translated}"`);
          return translated;
        }
      } catch (error) {
        console.warn('[TranslationService] Ошибка LibreTranslate:', error.message);
      }
    }
    
    // 5. Если DeepSeek приоритет отключен, используем старую логику
    if (!this.DEEPSEEK_PRIORITY && this.USE_DEEPSEEK && useAPI && typeof window === 'undefined') {
      try {
        const deepSeekTranslation = await DeepSeekService.translateDishName(dishName);
        if (deepSeekTranslation && deepSeekTranslation !== dishName) {
          this.setCachedTranslation(dishName, deepSeekTranslation);
          console.log(`[TranslationService] DeepSeek (низкий приоритет): "${dishName}" -> "${deepSeekTranslation}"`);
          return deepSeekTranslation;
        }
      } catch (error) {
        console.warn('[TranslationService] DeepSeek ошибка (низкий приоритет):', error.message);
      }
    }
    
    return dishName; // Возвращаем оригинальное название
  }
  
  /**
   * Переводит ингредиент
   * @param {string} ingredient - ингредиент на английском
   * @param {boolean} useAPI - использовать ли API для неизвестных переводов
   * @returns {Promise<string>} переведенный ингредиент
   */
  static async translateIngredient(ingredient, useAPI = true) {
    if (!ingredient || !ingredient.trim()) return '';
    
    // Новая логика: DeepSeek → статический словарь → кэш → LibreTranslate
    if (this.DEEPSEEK_PRIORITY && this.USE_DEEPSEEK && useAPI && typeof window === 'undefined') {
      try {
        // 1. Сначала пробуем DeepSeek API для максимального качества
        const deepSeekTranslation = await DeepSeekService.translateIngredient(ingredient);
        if (deepSeekTranslation && deepSeekTranslation !== ingredient) {
          this.setCachedTranslation(ingredient.toLowerCase(), deepSeekTranslation);
          console.log(`[TranslationService] DeepSeek ингредиент: "${ingredient}" -> "${deepSeekTranslation}"`);
          return deepSeekTranslation;
        }
      } catch (error) {
        console.warn('[TranslationService] DeepSeek недоступен для ингредиента, используем fallback:', error.message);
      }
    }
    
    // 2. Fallback: проверяем статический словарь
    const staticTranslation = translateIngredient(ingredient);
    if (staticTranslation !== ingredient) {
      console.log(`[TranslationService] Статический словарь ингредиент: "${ingredient}" -> "${staticTranslation}"`);
      return staticTranslation;
    }
    
    // 3. Fallback: проверяем кэш
    const cached = this.getCachedTranslation(ingredient.toLowerCase());
    if (cached) {
      console.log(`[TranslationService] Кэш ингредиент: "${ingredient}" -> "${cached}"`);
      return cached;
    }
    
    // 4. Fallback: LibreTranslate для клиентской среды
    if (useAPI && typeof window !== 'undefined') {
      try {
        const translated = await this.translateWithAPI(ingredient);
        if (translated && translated !== ingredient) {
          this.setCachedTranslation(ingredient.toLowerCase(), translated);
          console.log(`[TranslationService] LibreTranslate ингредиент: "${ingredient}" -> "${translated}"`);
          return translated;
        }
      } catch (error) {
        console.warn('[TranslationService] Ошибка LibreTranslate ингредиент:', error.message);
      }
    }
    
    // 5. Если DeepSeek приоритет отключен, используем старую логику
    if (!this.DEEPSEEK_PRIORITY && this.USE_DEEPSEEK && useAPI && typeof window === 'undefined') {
      try {
        const deepSeekTranslation = await DeepSeekService.translateIngredient(ingredient);
        if (deepSeekTranslation && deepSeekTranslation !== ingredient) {
          this.setCachedTranslation(ingredient.toLowerCase(), deepSeekTranslation);
          console.log(`[TranslationService] DeepSeek ингредиент (низкий приоритет): "${ingredient}" -> "${deepSeekTranslation}"`);
          return deepSeekTranslation;
        }
      } catch (error) {
        console.warn('[TranslationService] DeepSeek ошибка ингредиент (низкий приоритет):', error.message);
      }
    }
    
    return ingredient; // Возвращаем оригинальный ингредиент
  }
  
  /**
   * Переводит список ингредиентов
   * @param {Array} ingredients - массив ингредиентов
   * @param {boolean} useAPI - использовать ли API
   * @returns {Promise<Array>} массив переведенных ингредиентов
   */
  static async translateIngredients(ingredients, useAPI = true) {
    if (!Array.isArray(ingredients)) return [];
    
    // Новая логика с приоритетом DeepSeek
    if (this.DEEPSEEK_PRIORITY && this.USE_DEEPSEEK && typeof window === 'undefined' && useAPI) {
      try {
        console.log(`[TranslationService] Пакетный перевод ${ingredients.length} ингредиентов через DeepSeek (приоритет)`);
        
        // Сначала пробуем DeepSeek для всех ингредиентов
        const batchTranslations = await DeepSeekService.translateIngredientsBatch(ingredients);
        
        // Кэшируем успешные переводы
        for (let i = 0; i < ingredients.length; i++) {
          const ingredient = ingredients[i];
          const translation = batchTranslations[i];
          if (translation && translation !== ingredient) {
            this.setCachedTranslation(ingredient.toLowerCase(), translation);
          }
        }
        
        return batchTranslations;
      } catch (error) {
        console.warn('[TranslationService] DeepSeek пакетный перевод неудачен, используем fallback:', error.message);
      }
    }
    
    // Fallback: старая логика (статический словарь → кэш → DeepSeek по одному)
    if (this.USE_DEEPSEEK && typeof window === 'undefined' && useAPI && !this.DEEPSEEK_PRIORITY) {
      try {
        // Фильтруем только те ингредиенты, которых нет в статическом словаре
        const toTranslate = [];
        const translations = [];
        
        for (const ingredient of ingredients) {
          const staticTranslation = translateIngredient(ingredient);
          if (staticTranslation !== ingredient) {
            translations.push(staticTranslation);
          } else {
            const cached = this.getCachedTranslation(ingredient.toLowerCase());
            if (cached) {
              translations.push(cached);
            } else {
              toTranslate.push({ ingredient, index: translations.length });
              translations.push(null); // Заполним позже
            }
          }
        }
        
        // Переводим неизвестные ингредиенты пакетом
        if (toTranslate.length > 0) {
          console.log(`[TranslationService] Пакетный перевод ${toTranslate.length} неизвестных ингредиентов через DeepSeek (низкий приоритет)`);
          const batchIngredients = toTranslate.map(item => item.ingredient);
          const batchTranslations = await DeepSeekService.translateIngredientsBatch(batchIngredients);
          
          // Заполняем переводы и кэшируем
          for (let i = 0; i < toTranslate.length; i++) {
            const { ingredient, index } = toTranslate[i];
            const translation = batchTranslations[i] || ingredient;
            translations[index] = translation;
            this.setCachedTranslation(ingredient.toLowerCase(), translation);
          }
        }
        
        return translations;
      } catch (error) {
        console.warn('[TranslationService] Ошибка пакетного перевода (низкий приоритет):', error.message);
      }
    }
    
    // Fallback: переводим по одному (используется при ошибках или клиентской среде)
    console.log(`[TranslationService] Перевод ${ingredients.length} ингредиентов по одному`);
    const translations = await Promise.all(
      ingredients.map(ingredient => this.translateIngredient(ingredient, useAPI))
    );
    
    return translations;
  }
  
  /**
   * Переводит категорию блюда
   * @param {string} category - категория на английском
   * @returns {string} переведенная категория
   */
  static translateCategory(category) {
    return translateCategory(category);
  }
  
  /**
   * Переводит область/кухню
   * @param {string} area - область на английском  
   * @returns {string} переведенная область
   */
  static translateArea(area) {
    return translateArea(area);
  }
  
  /**
   * Переводит единицы измерения
   * @param {string} measure - мера измерения на английском
   * @returns {string} переведенная мера
   */
  static translateMeasure(measure) {
    if (!measure || !measure.trim()) return '';
    
    const measureLower = measure.toLowerCase().trim();
    
    // Словарь переводов мер измерения
    const measureTranslations = {
      // Ложки
      'tsp': 'ч.л.',
      'teaspoon': 'ч.л.',
      'teaspoons': 'ч.л.',
      'tbsp': 'ст.л.',
      'tbs': 'ст.л.',
      'tablespoon': 'ст.л.',
      'tablespoons': 'ст.л.',
      
      // Чашки и стаканы
      'cup': 'стакан',
      'cups': 'стаканов',
      'c': 'стакан',
      
      // Размеры
      'large': 'большой',
      'medium': 'средний',
      'small': 'маленький',
      'big': 'большой',
      
      // Вес и объем
      'oz': 'унций',
      'lb': 'фунт',
      'lbs': 'фунтов',
      'pound': 'фунт',
      'pounds': 'фунтов',
      'kg': 'кг',
      'g': 'г',
      'ml': 'мл',
      'l': 'л',
      'pint': 'пинта',
      'pints': 'пинт',
      'quart': 'кварта',
      'quarts': 'кварт',
      'gallon': 'галлон',
      'gallons': 'галлонов',
      
      // Количество
      'piece': 'штука',
      'pieces': 'штук',
      'slice': 'ломтик',
      'slices': 'ломтиков',
      'bunch': 'пучок',
      'head': 'головка',
      'heads': 'головок',
      'clove': 'зубчик',
      'cloves': 'зубчиков',
      'can': 'банка',
      'cans': 'банок',
      'jar': 'банка',
      'jars': 'банок',
      'bottle': 'бутылка',
      'bottles': 'бутылок',
      'packet': 'пакет',
      'packets': 'пакетов',
      'bag': 'пакет',
      'bags': 'пакетов',
      'box': 'коробка',
      'boxes': 'коробок',
      'package': 'упаковка',
      'packages': 'упаковок',
      
      // Состояния
      'fresh': 'свежий',
      'dried': 'сушеный',
      'frozen': 'замороженный',
      'canned': 'консервированный',
      'chopped': 'нарезанный',
      'diced': 'кубиками',
      'sliced': 'нарезанный',
      'minced': 'измельченный',
      'grated': 'тертый',
      'peeled': 'очищенный',
      'skinless': 'без кожи',
      'boneless': 'без костей',
      'separated': 'отделенный',
      'beaten': 'взбитый',
      'melted': 'растопленный',
      'softened': 'размягченный',
      'warmed': 'подогретый',
      'cooled': 'охлажденный',
      'room temperature': 'комнатной температуры',
      
      // Дроби и числительные
      '1/2': '1/2',
      '1/3': '1/3',
      '1/4': '1/4',
      '2/3': '2/3',
      '3/4': '3/4',
      'half': 'половина',
      'quarter': 'четверть',
      
      // Прочее
      'to taste': 'по вкусу',
      'pinch': 'щепотка',
      'pinches': 'щепоток',
      'dash': 'щепотка',
      'sprinkle': 'посыпать',
      'handful': 'горсть',
      'enough': 'достаточно',
      'some': 'немного',
      'little': 'немного',
      'bit': 'немного'
    };
    
    // Попробуем найти точное совпадение
    if (measureTranslations[measureLower]) {
      return measureTranslations[measureLower];
    }
    
    // Попробуем найти частичное совпадение для составных мер
    for (const [eng, ru] of Object.entries(measureTranslations)) {
      if (measureLower.includes(eng)) {
        return measure.toLowerCase().replace(eng, ru);
      }
    }
    
    return measure; // Возвращаем оригинал если не нашли перевод
  }
  
  /**
   * Переводит блюдо целиком (название, категория, область, ингредиенты)
   * @param {object} dish - объект блюда
   * @param {boolean} translateIngredients - переводить ли ингредиенты
   * @param {boolean} useAPI - использовать ли API для переводов
   * @returns {Promise<object>} блюдо с переводами
   */
  static async translateDish(dish, translateIngredients = true, useAPI = true) {
    if (!dish) return dish;
    
    try {
      const translatedDish = { ...dish };
      
      // Переводим название
      if (dish.strMeal) {
        translatedDish.strMealRu = await this.translateDishName(dish.strMeal, useAPI);
      }
      
      // Переводим категорию
      if (dish.strCategory) {
        translatedDish.strCategoryRu = this.translateCategory(dish.strCategory);
      }
      
      // Переводим область
      if (dish.strArea) {
        translatedDish.strAreaRu = this.translateArea(dish.strArea);
      }
      
      // Переводим ингредиенты
      if (translateIngredients) {
        const ingredients = this.extractIngredients(dish);
        const translatedIngredients = await this.translateIngredients(ingredients, useAPI);
        translatedDish.ingredientsRu = translatedIngredients;
      }
      
      // Переводим инструкции приготовления (новая функция)
      if (dish.strInstructions && this.USE_DEEPSEEK && typeof window === 'undefined') {
        try {
          translatedDish.strInstructionsRu = await DeepSeekService.translateInstructions(
            dish.strInstructions,
            dish.strMeal
          );
        } catch (error) {
          console.warn('[TranslationService] Ошибка перевода инструкций:', error.message);
        }
      }
      
      return translatedDish;
      
    } catch (error) {
      console.warn('[TranslationService] Ошибка перевода блюда:', error.message);
      return dish; // Возвращаем оригинальное блюдо при ошибке
    }
  }
  
  /**
   * Извлекает ингредиенты из объекта блюда
   * @param {object} dish - объект блюда
   * @returns {Array} массив ингредиентов
   */
  static extractIngredients(dish) {
    const ingredients = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = dish[`strIngredient${i}`];
      if (ingredient && ingredient.trim() && ingredient.trim() !== '') {
        ingredients.push(ingredient.trim());
      }
    }
    
    return ingredients;
  }
  
  /**
   * Переводит текст через LibreTranslate API
   * @param {string} text - текст для перевода
   * @param {string} source - исходный язык (по умолчанию 'en')
   * @param {string} target - целевой язык (по умолчанию 'ru') 
   * @returns {Promise<string>} переведенный текст
   */
  static async translateWithAPI(text, source = 'en', target = 'ru') {
    if (!text || typeof window === 'undefined') return text;
    
    const urls = [this.LIBRE_TRANSLATE_URL, this.LIBRE_TRANSLATE_BACKUP_URL];
    
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: source,
            target: target
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.translatedText) {
          console.log(`[TranslationService] Переведено "${text}" -> "${data.translatedText}"`);
          return data.translatedText;
        }
        
        throw new Error('No translatedText in response');
        
      } catch (error) {
        console.warn(`[TranslationService] Ошибка с ${url}:`, error.message);
        continue; // Пробуем следующий URL
      }
    }
    
    throw new Error('Все сервисы перевода недоступны');
  }
  
  /**
   * Получает перевод из кэша
   * @param {string} key - ключ для поиска
   * @returns {string|null} кэшированный перевод или null
   */
  static getCachedTranslation(key) {
    if (typeof window === 'undefined') return null;
    
    try {
      const cacheKey = this.CACHE_PREFIX + key.toLowerCase();
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { translation, timestamp } = JSON.parse(cached);
        
        // Проверяем срок действия кэша
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          return translation;
        } else {
          // Удаляем устаревший кэш
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('[TranslationService] Ошибка чтения кэша:', error.message);
    }
    
    return null;
  }
  
  /**
   * Сохраняет перевод в кэш
   * @param {string} key - ключ для сохранения
   * @param {string} translation - перевод для сохранения
   */
  static setCachedTranslation(key, translation) {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheKey = this.CACHE_PREFIX + key.toLowerCase();
      const cacheData = {
        translation,
        timestamp: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[TranslationService] Ошибка записи в кэш:', error.message);
    }
  }
  
  /**
   * Очищает кэш переводов
   */
  static clearCache() {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('[TranslationService] Кэш переводов очищен');
    } catch (error) {
      console.warn('[TranslationService] Ошибка очистки кэша:', error.message);
    }
  }
  
  /**
   * Получает статистику кэша
   * @returns {object} статистика кэша
   */
  static getCacheStats() {
    if (typeof window === 'undefined') return { count: 0, size: 0 };
    
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      cacheKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      });
      
      return {
        count: cacheKeys.length,
        size: totalSize,
        sizeKB: Math.round(totalSize / 1024 * 100) / 100
      };
    } catch (error) {
      console.warn('[TranslationService] Ошибка получения статистики кэша:', error.message);
      return { count: 0, size: 0 };
    }
  }
  
  /**
   * Предзагружает переводы популярных блюд через API
   * @param {Array} dishNames - массив названий блюд для предзагрузки
   */
  static async preloadTranslations(dishNames = []) {
    if (!Array.isArray(dishNames) || dishNames.length === 0) return;
    
    console.log(`[TranslationService] Предзагрузка переводов для ${dishNames.length} блюд`);
    
    for (const dishName of dishNames) {
      try {
        await this.translateDishName(dishName, true);
        // Небольшая задержка чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`[TranslationService] Ошибка предзагрузки "${dishName}":`, error.message);
      }
    }
    
    console.log('[TranslationService] Предзагрузка завершена');
  }
}

export default TranslationService;
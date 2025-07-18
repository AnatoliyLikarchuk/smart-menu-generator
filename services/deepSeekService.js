// Сервис для работы с DeepSeek API для высококачественных переводов

/**
 * Сервис для перевода с помощью DeepSeek API
 * Предоставляет специализированные методы для перевода кулинарных текстов
 */
export class DeepSeekService {
  
  static BASE_URL = 'https://api.deepseek.com/v1';
  static TIMEOUT = 30000; // 30 секунд
  
  /**
   * Переводит текст с использованием DeepSeek API
   * @param {string} text - текст для перевода
   * @param {string} context - контекст перевода (dish, ingredient, instruction)
   * @param {object} options - дополнительные параметры
   * @returns {Promise<string>} переведенный текст
   */
  static async translateText(text, context = 'general', options = {}) {
    if (!text || !text.trim()) return text;
    
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API ключ не найден');
    }
    
    const prompt = this.buildPrompt(text, context, options);
    
    try {
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Ты профессиональный переводчик кулинарных текстов. Переводи точно и естественно, сохраняя кулинарный смысл.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          top_p: 0.95
        }),
        signal: AbortSignal.timeout(this.TIMEOUT)
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const translatedText = data.choices[0].message.content.trim();
        console.log(`[DeepSeekService] Переведено "${text}" -> "${translatedText}"`);
        return translatedText;
      }
      
      throw new Error('Неожиданный формат ответа от DeepSeek API');
      
    } catch (error) {
      console.error('[DeepSeekService] Ошибка перевода:', error.message);
      throw error;
    }
  }
  
  /**
   * Переводит название блюда с кулинарным контекстом
   * @param {string} dishName - название блюда
   * @param {string} category - категория блюда (опционально)
   * @param {string} area - кухня (опционально)
   * @returns {Promise<string>} переведенное название
   */
  static async translateDishName(dishName, category = '', area = '') {
    if (!dishName) return '';
    
    const context = 'dish';
    const options = { category, area };
    
    return await this.translateText(dishName, context, options);
  }
  
  /**
   * Переводит ингредиент с учетом кулинарного контекста
   * @param {string} ingredient - ингредиент
   * @param {string} measure - мера измерения (опционально)
   * @returns {Promise<string>} переведенный ингредиент
   */
  static async translateIngredient(ingredient, measure = '') {
    if (!ingredient) return '';
    
    const context = 'ingredient';
    const options = { measure };
    
    return await this.translateText(ingredient, context, options);
  }
  
  /**
   * Переводит инструкции приготовления
   * @param {string} instructions - инструкции
   * @param {string} dishName - название блюда для контекста
   * @returns {Promise<string>} переведенные инструкции
   */
  static async translateInstructions(instructions, dishName = '') {
    if (!instructions) return '';
    
    const context = 'instructions';
    const options = { dishName };
    
    return await this.translateText(instructions, context, options);
  }
  
  /**
   * Переводит несколько ингредиентов пакетом
   * @param {Array} ingredients - массив ингредиентов
   * @param {Array} measures - массив мер измерения (опционально)
   * @returns {Promise<Array>} массив переведенных ингредиентов
   */
  static async translateIngredientsBatch(ingredients, measures = []) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) return [];
    
    try {
      // Создаем промпт для пакетного перевода
      const ingredientList = ingredients.map((ing, index) => {
        const measure = measures[index] || '';
        return `${index + 1}. ${ing}${measure ? ` (${measure})` : ''}`;
      }).join('\n');
      
      const prompt = `Переведи следующие кулинарные ингредиенты на русский язык. Сохрани нумерацию и формат:

${ingredientList}

Переведи каждый ингредиент точно и естественно, сохраняя кулинарный смысл. Если есть меры измерения в скобках, переведи и их.`;
      
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DeepSeek API ключ не найден');
      }
      
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Ты профессиональный переводчик кулинарных текстов. Переводи точно и естественно.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          top_p: 0.95
        }),
        signal: AbortSignal.timeout(this.TIMEOUT)
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const translatedText = data.choices[0].message.content.trim();
        
        // Парсим ответ и извлекаем переведенные ингредиенты
        const translatedIngredients = this.parseTranslatedIngredients(translatedText, ingredients.length);
        
        console.log(`[DeepSeekService] Переведено ${ingredients.length} ингредиентов пакетом`);
        return translatedIngredients;
      }
      
      throw new Error('Неожиданный формат ответа от DeepSeek API');
      
    } catch (error) {
      console.error('[DeepSeekService] Ошибка пакетного перевода ингредиентов:', error.message);
      // Fallback: переводим по одному
      return await Promise.all(
        ingredients.map((ing, index) => this.translateIngredient(ing, measures[index] || ''))
      );
    }
  }
  
  /**
   * Создает промпт для перевода в зависимости от контекста
   * @param {string} text - текст для перевода
   * @param {string} context - контекст перевода
   * @param {object} options - дополнительные параметры
   * @returns {string} промпт для API
   */
  static buildPrompt(text, context, options = {}) {
    const basePrompt = `Переведи на русский язык: "${text}"`;
    
    switch (context) {
      case 'dish':
        let dishPrompt = `Переведи название блюда на русский язык: "${text}"`;
        if (options.category) dishPrompt += `\nКатегория: ${options.category}`;
        if (options.area) dishPrompt += `\nКухня: ${options.area}`;
        dishPrompt += '\n\nПереведи точно и естественно, сохраняя кулинарный смысл. Ответь только переводом.';
        return dishPrompt;
        
      case 'ingredient':
        let ingredientPrompt = `Переведи кулинарный ингредиент на русский язык: "${text}"`;
        if (options.measure) ingredientPrompt += `\nМера измерения: ${options.measure}`;
        ingredientPrompt += '\n\nПереведи точно и естественно, сохраняя кулинарный смысл. Ответь только переводом.';
        return ingredientPrompt;
        
      case 'instructions':
        let instructionsPrompt = `Переведи инструкции по приготовлению на русский язык: "${text}"`;
        if (options.dishName) instructionsPrompt += `\nБлюдо: ${options.dishName}`;
        instructionsPrompt += '\n\nПереведи точно и естественно, сохраняя последовательность действий и кулинарные термины. Ответь только переводом.';
        return instructionsPrompt;
        
      default:
        return basePrompt + '\n\nПереведи точно и естественно. Ответь только переводом.';
    }
  }
  
  /**
   * Парсит переведенные ингредиенты из ответа API
   * @param {string} translatedText - ответ от API
   * @param {number} expectedCount - ожидаемое количество ингредиентов
   * @returns {Array} массив переведенных ингредиентов
   */
  static parseTranslatedIngredients(translatedText, expectedCount) {
    const lines = translatedText.split('\n').filter(line => line.trim());
    const ingredients = [];
    
    for (const line of lines) {
      // Ищем строки вида "1. перевод" или "1) перевод"
      const match = line.match(/^\d+[.)]\s*(.+)$/);
      if (match) {
        let ingredient = match[1].trim();
        // Убираем меры измерения в скобках, если нужно только ингредиент
        ingredient = ingredient.replace(/\s*\([^)]*\)\s*$/, '').trim();
        ingredients.push(ingredient);
      }
    }
    
    // Если не удалось распарсить, возвращаем исходный текст разделенный по строкам
    if (ingredients.length === 0) {
      return translatedText.split('\n')
        .filter(line => line.trim())
        .slice(0, expectedCount);
    }
    
    return ingredients.slice(0, expectedCount);
  }
  
  /**
   * Рассчитывает калорийность блюда с помощью ИИ анализа
   * @param {object} dish - объект блюда из API
   * @param {string} mealType - тип приема пищи ('BREAKFAST', 'LUNCH', 'DINNER')
   * @returns {Promise<object>} объект с калориями и категорией
   */
  static async calculateDishCalories(dish, mealType = 'GENERAL') {
    if (!dish) {
      throw new Error('Блюдо не предоставлено');
    }

    // Извлекаем ингредиенты из блюда
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

    // Создаем детальный промпт для анализа калорий
    const ingredientsList = ingredients.map(ing => 
      `${ing.name}${ing.measure ? ` (${ing.measure})` : ''}`
    ).join('\n');

    const mealTypeRu = {
      'BREAKFAST': 'завтрак',
      'LUNCH': 'обед', 
      'DINNER': 'ужин',
      'GENERAL': 'общий прием пищи'
    }[mealType] || 'общий прием пищи';

    const prompt = `Проанализируй калорийность блюда и определи категорию согласно международным диетологическим стандартам.

БЛЮДО: ${dish.strMeal}
КАТЕГОРИЯ: ${dish.strCategory || 'не указана'}
КУХНЯ: ${dish.strArea || 'не указана'}
ТИП ПРИЕМА ПИЩИ: ${mealTypeRu}

ИНГРЕДИЕНТЫ:
${ingredientsList}

ИНСТРУКЦИИ ПРИГОТОВЛЕНИЯ:
${dish.strInstructions || 'не указаны'}

МЕЖДУНАРОДНЫЕ СТАНДАРТЫ КАЛОРИЙ ПО ТИПАМ ПИТАНИЯ:
- Завтрак: 250-400 ккал (Легкий до 250, Нормальный 250-400, Плотный свыше 400)
- Обед: 400-700 ккал (Легкий до 400, Нормальный 400-700, Плотный свыше 700)  
- Ужин: 400-700 ккал (Легкий до 400, Нормальный 400-700, Плотный свыше 700)

Рассчитай ТОЧНУЮ калорийность блюда на одну порцию, учитывая:
1. Калорийность каждого ингредиента
2. Количество каждого ингредиента
3. Способ приготовления (влияет на калории)
4. Размер типичной порции для данного блюда

Ответь СТРОГО в JSON формате:
{
  "calories": число_калорий,
  "category": "LOW|NORMAL|HIGH",
  "label": "соответствующая_русская_метка",
  "reasoning": "краткое_объяснение_расчета"
}`;

    try {
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DeepSeek API ключ не найден');
      }

      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Ты профессиональный диетолог и специалист по питательности продуктов. Анализируй калорийность блюд точно и детально, учитывая все нюансы приготовления.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          top_p: 0.95
        }),
        signal: AbortSignal.timeout(this.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const responseText = data.choices[0].message.content.trim();
        
        try {
          // Пытаемся извлечь JSON из ответа
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('JSON не найден в ответе');
          }
          
          const result = JSON.parse(jsonMatch[0]);
          
          // Валидируем структуру ответа
          if (typeof result.calories !== 'number' || !result.category || !result.label) {
            throw new Error('Неверная структура ответа от ИИ');
          }

          console.log(`[DeepSeekService] ИИ анализ: "${dish.strMeal}" = ${result.calories} ккал (${result.label})`);
          console.log(`[DeepSeekService] Обоснование: ${result.reasoning}`);

          return {
            calories: Math.round(result.calories),
            category: {
              label: result.label,
              color: result.category === 'LOW' ? 'green' : result.category === 'HIGH' ? 'orange' : 'blue',
              bgColor: result.category === 'LOW' ? 'bg-green-100' : result.category === 'HIGH' ? 'bg-orange-100' : 'bg-blue-100',
              textColor: result.category === 'LOW' ? 'text-green-600' : result.category === 'HIGH' ? 'text-orange-600' : 'text-blue-600'
            },
            mealType: mealType,
            reasoning: result.reasoning,
            source: 'ai'
          };

        } catch (parseError) {
          console.error('[DeepSeekService] Ошибка парсинга ответа ИИ:', parseError.message);
          console.log('[DeepSeekService] Сырой ответ:', responseText);
          throw new Error('Не удалось обработать ответ ИИ');
        }
      }

      throw new Error('Неожиданный формат ответа от DeepSeek API');

    } catch (error) {
      console.error('[DeepSeekService] Ошибка расчета калорий:', error.message);
      throw error;
    }
  }

  /**
   * Проверяет доступность DeepSeek API
   * @returns {Promise<boolean>} true если API доступен
   */
  static async checkApiAvailability() {
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      if (!apiKey) {
        return false;
      }
      
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Test'
            }
          ],
          max_tokens: 10
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
      
    } catch (error) {
      console.warn('[DeepSeekService] API недоступен:', error.message);
      return false;
    }
  }
}

export default DeepSeekService;
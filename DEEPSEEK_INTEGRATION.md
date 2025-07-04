# DeepSeek API Integration Guide

## Обзор интеграции

Проект интегрирован с DeepSeek API для высококачественных переводов кулинарных текстов. Система поддерживает перевод названий блюд, ингредиентов и полных инструкций приготовления.

## Архитектура переводов

### 1. Сервисы

**`/services/deepSeekService.js`**
- Основной сервис для работы с DeepSeek API
- Специализированные методы для кулинарных переводов
- Пакетный перевод ингредиентов для оптимизации

**`/services/translationService.js`** 
- Обновленный для использования DeepSeek в серверной среде
- Сохранена совместимость с LibreTranslate для клиентской части
- Система кэширования переводов в localStorage

### 2. API Endpoints

**`/app/api/translate/route.js`**
- Серверный endpoint для переводов
- Поддерживает типы: dish, dishName, ingredient, ingredients, instructions, text
- Защищенный API ключ (не передается клиенту)

### 3. Компоненты

**`/components/DishCard.js`**
- Обновлен для использования серверного API переводов
- Добавлена секция с переведенными инструкциями
- Fallback на клиентский TranslationService

## Конфигурация

### Переменные окружения (.env.local)

```bash
# DeepSeek API ключ
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Настройки переводов
TRANSLATION_CACHE_EXPIRY_DAYS=7
TRANSLATION_TIMEOUT_MS=30000
TRANSLATION_BATCH_SIZE=10

# NEW: Приоритет DeepSeek переводов
# true - DeepSeek первым (максимальное качество)
# false - статический словарь первым (экономия API)
DEEPSEEK_PRIORITY=true
```

## Использование API

### Примеры запросов

**Перевод блюда целиком:**
```javascript
POST /api/translate
{
  "type": "dish",
  "data": {
    "strMeal": "Chicken Teriyaki",
    "strIngredient1": "chicken",
    "strIngredient2": "soy sauce",
    "strInstructions": "Cook chicken..."
  },
  "options": {
    "translateIngredients": true,
    "useAPI": true
  }
}
```

**Перевод списка ингредиентов:**
```javascript
POST /api/translate
{
  "type": "ingredients",
  "data": ["chicken breast", "soy sauce", "garlic"],
  "options": {
    "measures": ["2 pieces", "3 tbsp", "2 cloves"]
  }
}
```

**Перевод инструкций:**
```javascript
POST /api/translate
{
  "type": "instructions",
  "data": "Heat oil in a pan. Cook chicken for 5 minutes...",
  "options": {
    "dishName": "Chicken Teriyaki"
  }
}
```

## Особенности и оптимизации

### Умная логика переводов (NEW: DeepSeek Priority)

**С приоритетом DeepSeek (DEEPSEEK_PRIORITY=true, по умолчанию):**
1. **DeepSeek API** - максимальное качество переводов (только серверная среда)
2. **Статический словарь** - fallback при ошибках DeepSeek (700+ ингредиентов, 388+ блюд)
3. **Кэш браузера** - fallback хранит переводы 7 дней  
4. **LibreTranslate** - fallback для клиентской среды

**Без приоритета DeepSeek (DEEPSEEK_PRIORITY=false):**
1. **Статический словарь** - проверяется первым (700+ ингредиентов, 388+ блюд)
2. **Кэш браузера** - хранит переводы 7 дней
3. **DeepSeek API** - для неизвестных текстов (только серверная среда)
4. **LibreTranslate fallback** - для клиентской среды

### Пакетная оптимизация (ОБНОВЛЕНО)

**С приоритетом DeepSeek:**
- ВСЕ ингредиенты переводятся одним пакетом через DeepSeek
- Максимальное качество и единообразие переводов
- Fallback на индивидуальные переводы при ошибках

**Без приоритета DeepSeek:**
- Только неизвестные ингредиенты переводятся пакетами
- Статический словарь и кэш используются первыми
- Экономия API запросов

**Общие особенности:**
- Контекстные промпты для кулинарных терминов
- Автоматическое кэширование результатов
- Graceful fallback при ошибках API

### Специализированные промпты

```javascript
// Для названий блюд
`Переведи название блюда на русский язык: "${dishName}"
Категория: ${category}
Кухня: ${area}
Переведи точно и естественно, сохраняя кулинарный смысл.`

// Для ингредиентов  
`Переведи кулинарный ингредиент на русский язык: "${ingredient}"
Мера измерения: ${measure}
Переведи точно и естественно, сохраняя кулинарный смысл.`

// Для инструкций
`Переведи инструкции по приготовлению на русский язык: "${instructions}"
Блюдо: ${dishName}
Переведи точно и естественно, сохраняя последовательность действий.`
```

## Мониторинг и отладка

### Логирование

Все переводы логируются в консоль:
```
[DeepSeekService] Переведено "Chicken Teriyaki" -> "Курица Терияки"
[TranslationService] Переведено 5 ингредиентов пакетом
```

### Проверка доступности API

```javascript
GET /api/translate
// Возвращает статус доступности DeepSeek API
```

### Обработка ошибок

- Graceful fallback на оригинальный текст
- Автоматическое переключение на LibreTranslate в клиенте
- Кэширование результатов для избежания повторных ошибок

## Развертывание

### На Vercel

1. Добавьте `DEEPSEEK_API_KEY` в Environment Variables
2. Убедитесь, что `.env.local` в `.gitignore`
3. API ключ будет доступен только серверным функциям

### Локальная разработка

```bash
# Установите зависимости
npm install

# Скопируйте конфигурацию
cp .env.local.example .env.local

# Добавьте ваш API ключ в .env.local
DEEPSEEK_API_KEY=your_api_key_here

# Запустите разработку
npm run dev
```

## Стоимость использования

- DeepSeek API: ~$0.14 за 1M входных токенов
- Средний перевод блюда: ~200 токенов
- Стоимость перевода одного блюда: ~$0.000028
- Кэширование снижает повторные расходы

## Безопасность

- API ключ доступен только серверным функциям
- Клиент не имеет прямого доступа к DeepSeek API  
- Все переводы проходят через защищенный endpoint
- Валидация входных данных на сервере
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Menu Generator - это умный генератор меню для выбора блюд на основе времени дня, сложности приготовления и пищевых предпочтений без использования ИИ. Проект создается для Тани с использованием алгоритмической логики вместо машинного обучения.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Core System Design
Проект использует модульную архитектуру с четким разделением ответственности:

**Smart Selection Algorithm**: Система оценки блюд основана на:
- Анализ времени приготовления (парсинг из текста рецептов)
- Расчет сложности (количество ингредиентов и шагов)
- Определение типа белка и способа приготовления
- Взвешенный случайный выбор с учетом времени дня

**Data Flow**:
1. `timeUtils.js` определяет тип питания по времени дня
2. `dishService.js` получает блюда из TheMealDB API
3. `mealAnalyzer.js` анализирует каждое блюдо
4. `scoringService.js` оценивает блюда по критериям
5. `filterService.js` применяет взвешенный выбор
6. `storageService.js` сохраняет предпочтения пользователя

### Key Directories

**`/services`**: Бизнес-логика приложения
- `dishService.js` - получение блюд из внешнего API
- `scoringService.js` - система оценки блюд по алгоритму
- `filterService.js` - фильтрация и взвешенный выбор
- `storageService.js` - работа с localStorage для предпочтений

**`/utils`**: Вспомогательные функции
- `mealAnalyzer.js` - анализ рецептов без ИИ (парсинг времени, сложности)
- `timeUtils.js` - определение типа питания по времени
- `constants.js` - конфигурация и константы

**`/data`**: Статические данные и правила
- `categories.js` - категории блюд для разных типов питания
- `scoringRules.js` - весовые коэффициенты для системы оценки
- `fallbackDishes.js` - резервные блюда при сбое API

**`/components`**: UI компоненты React
- `MenuGenerator.js` - главный компонент приложения
- `DishCard.js` - карточка блюда
- `MealTypeSelector.js` - выбор типа питания
- `PreferencesPanel.js` - панель настроек

### External Dependencies

**TheMealDB API**: Основной источник рецептов
- URL: `https://www.themealdb.com/api/json/v1/1/filter.php?c={category}`
- Fallback: локальные данные в `data/fallbackDishes.js`

**Персонализация**: LocalStorage для:
- История просмотренных блюд (избегание повторов 3 дня)
- Лайки/дизлайки пользователя
- Исключенные ингредиенты
- Диетические предпочтения

### Technology Stack

- **Framework**: Next.js 14 с App Router
- **Styling**: Tailwind CSS 3.4.17 с кастомными цветами
- **Icons**: Lucide React
- **Language**: JavaScript (ES6+)
- **Storage**: Browser LocalStorage
- **Deployment**: Vercel (планируется)

### Development Notes

**App Router Structure**: Проект использует новую структуру Next.js App Router:
- `app/layout.js` - корневой layout с мета-данными
- `app/page.js` - главная страница
- `app/api/smart-dish/` - API routes для умного выбора

**Конфигурация Tailwind**: Настроена для сканирования `app/` и `components/` директорий с кастомными primary цветами.

**Система именования**: Все файлы используют camelCase, компоненты React начинаются с заглавной буквы.

### Project Status

**Текущий статус**: Этап 1 завершен (базовая инфраструктура)
**Следующий этап**: Создание умного ядра системы (сервисы и API)

Детальный план разработки находится в `../doc/IMPLEMENTATION_PLAN.md` и `../doc/PROJECT_PLAN.md`.
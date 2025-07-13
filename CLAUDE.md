# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Menu Generator - это умный генератор меню для выбора блюд на основе времени дня, сложности приготовления и пищевых предпочтений без использования ИИ. Проект создан для Тани с использованием алгоритмической логики вместо машинного обучения.

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

## Environment Setup

Copy `.env.local.example` to `.env.local` and configure:
- `DEEPSEEK_API_KEY` - API key from platform.deepseek.com for high-quality translations
- `DEEPSEEK_PRIORITY` - true/false to prioritize AI vs static translations

## Core Architecture

### Smart Selection Algorithm
Проект использует детерминистический алгоритм без ИИ:
- **Recipe parsing**: Extracts cooking time from instruction text using regex patterns
- **Complexity scoring**: Analyzes ingredient count and cooking steps
- **Weighted selection**: Random selection weighted by meal type and time context
- **Personalization**: User preferences stored in localStorage

### Critical Data Flow
1. `timeUtils.js` - Auto-detects meal type by current time
2. `dishService.js` - Fetches 25 dishes per category from TheMealDB API
3. `mealAnalyzer.js` - Asynchronously analyzes each dish (cooking time, complexity, nutrition)
4. `scoringService.js` - Scores dishes based on meal type weights and user context
5. `filterService.js` - Applies weighted random selection with diversity algorithms
6. `storageService.js` - Manages user preferences and avoids recently shown dishes

### Key Service Architecture

**`services/dishService.js`**: Central dish management
- `getSmartDish()` - Single dish recommendation
- `getSmartRecommendations()` - Multiple diverse recommendations (CRITICAL: must use `await` with `ScoringService.scoreDishes()`)
- `fetchDishesFromAPI()` - Parallel category fetching with 25 dish limit per category

**`services/filterService.js`**: Selection algorithms  
- `selectDiverseDishes()` - Randomized category selection from top-3 dishes per category
- `weightedRandomSelect()` - Weighted random selection for single dishes
- Diet and preference filtering

**`services/scoringService.js`**: Scoring system
- `scoreDishes()` - Async dish analysis and scoring (MUST be awaited)
- Context-aware scoring based on meal type, time, and user preferences

### Algorithm Randomization
The app uses sophisticated randomization to prevent repetitive results:
- Groups dishes by category and randomly selects from top-3 in each
- Shuffles categories and applies score-based perturbation
- Increased pool from 10 to 25 dishes per API category for diversity

### API Integration

**TheMealDB API**: Primary recipe source
- Endpoint: `https://www.themealdb.com/api/json/v1/1/filter.php?c={category}`
- Fetches detailed dish info including instructions for analysis
- Fallback to `data/fallbackDishes.js` on API failure

**DeepSeek API**: Optional high-quality translations
- Configured via environment variables
- Falls back to static translation dictionary

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom gradient themes
- **Icons**: Lucide React
- **Storage**: Browser localStorage for user preferences
- **Deployment**: Vercel (auto-deploy from GitHub)

### Common Issues & Solutions

**Multiple Recommendations**: If "3 варианта" button returns same dishes, check that `getSmartRecommendations()` properly awaits `ScoringService.scoreDishes()`.

**localStorage**: Filter services check `typeof window !== 'undefined'` before accessing localStorage to prevent SSR issues.

**API Rate Limiting**: Services use Promise.allSettled() for parallel requests and include timeout handling.

### Project Status

**Current Status**: ✅ Production Ready - deployed at smart-menu-generator.vercel.app
**Architecture**: Complete modular system with smart algorithms and personalization
**Recent Improvements**: Fixed async/await issues and added randomization for diverse recommendations
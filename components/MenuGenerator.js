// Главный компонент генератора меню

'use client';

import { useState, useEffect } from 'react';
import { Shuffle, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

import MealTypeSelector from './MealTypeSelector.js';
import DishCard from './DishCard.js';
import PreferencesPanel, { QuickPreferences } from './PreferencesPanel.js';
import LoadingSpinner, { LoadingOverlay } from './LoadingSpinner.js';
import { getCurrentMealType } from '../utils/timeUtils.js';
import StorageService from '../services/storageService.js';

/**
 * Главный компонент генератора меню
 * @returns {JSX.Element} JSX элемент генератора меню
 */
export default function MenuGenerator() {
  // Состояние компонента
  const [selectedMealType, setSelectedMealType] = useState('');
  const [currentDish, setCurrentDish] = useState(null);
  const [dishAnalysis, setDishAnalysis] = useState(null);
  const [dishScore, setDishScore] = useState(null);
  const [scoreCategory, setScoreCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Настройки пользователя
  const [userPreferences, setUserPreferences] = useState({
    dislikedIngredients: [],
    dietaryRestrictions: [],
    favorites: [],
    blacklist: [],
    history: [],
    preferredComplexity: 'any'
  });
  
  // UI состояние
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [showMultipleRecommendations, setShowMultipleRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Инициализация при загрузке компонента
  useEffect(() => {
    const detected = getCurrentMealType();
    setSelectedMealType(detected);
    
    // Загружаем сохраненные настройки из StorageService
    loadSavedPreferences();
  }, []);

  // Сохранение и загрузка настроек через StorageService
  const loadSavedPreferences = () => {
    try {
      const preferences = StorageService.getPreferences();
      setUserPreferences(prev => ({ ...prev, ...preferences }));
    } catch (error) {
      console.warn('Не удалось загрузить сохраненные настройки:', error);
    }
  };

  const savePreferences = (newPreferences) => {
    setUserPreferences(newPreferences);
    StorageService.savePreferences(newPreferences);
  };

  // Генерация блюда
  const generateDish = async (mealType = selectedMealType, count = 1) => {
    if (!mealType) {
      setError('Пожалуйста, выберите тип питания');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = '/api/smart-dish';
      const requestData = {
        mealType,
        userPreferences,
        count
      };

      console.log('Отправляем запрос:', requestData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Получен ответ:', result);

      if (!result.success) {
        throw new Error(result.message || 'Не удалось получить рекомендацию');
      }

      if (count === 1) {
        // Одно блюдо
        setCurrentDish(result.data.dish);
        setDishAnalysis(result.data.analysis);
        setDishScore(result.data.score);
        setScoreCategory(result.data.scoreCategory);
        
        // Добавляем в историю
        addToHistory(result.data.dish);
      } else {
        // Несколько рекомендаций
        setRecommendations(result.data.recommendations || []);
        setShowMultipleRecommendations(true);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

    } catch (error) {
      console.error('Ошибка генерации блюда:', error);
      setError(error.message || 'Произошла ошибка при подборе блюда');
    } finally {
      setLoading(false);
    }
  };

  // Добавление в историю через StorageService
  const addToHistory = (dish) => {
    try {
      // Добавляем тип питания к блюду для более точной истории
      const dishWithMealType = {
        ...dish,
        mealType: selectedMealType
      };
      
      StorageService.addToHistory(dishWithMealType);
      
      // Обновляем локальное состояние для совместимости
      const historyEntry = {
        dish: dishWithMealType,
        timestamp: new Date().toISOString(),
        mealType: selectedMealType
      };

      const newPreferences = {
        ...userPreferences,
        history: [historyEntry, ...(userPreferences.history || [])].slice(0, 50)
      };

      setUserPreferences(newPreferences);
    } catch (error) {
      console.error('Ошибка добавления в историю:', error);
    }
  };

  // Обработка лайка блюда
  const handleLike = (dish) => {
    const isAlreadyLiked = userPreferences.favorites?.some(fav => fav.idMeal === dish.idMeal);
    
    let newFavorites;
    if (isAlreadyLiked) {
      newFavorites = userPreferences.favorites.filter(fav => fav.idMeal !== dish.idMeal);
    } else {
      newFavorites = [...(userPreferences.favorites || []), dish];
    }

    const newPreferences = {
      ...userPreferences,
      favorites: newFavorites
    };

    savePreferences(newPreferences);
  };

  // Обработка дизлайка блюда
  const handleDislike = (dish) => {
    const newBlacklist = [...(userPreferences.blacklist || [])];
    if (!newBlacklist.some(item => item.idMeal === dish.idMeal)) {
      newBlacklist.push(dish);
    }

    const newPreferences = {
      ...userPreferences,
      blacklist: newBlacklist
    };

    savePreferences(newPreferences);
    
    // Автоматически генерируем новое блюдо
    generateDish();
  };

  // Применение быстрых фильтров
  const applyQuickFilter = (filter) => {
    const newPreferences = { ...userPreferences, ...filter };
    savePreferences(newPreferences);
  };

  // Проверка, лайкнуто ли блюдо
  const isDishLiked = (dish) => {
    return userPreferences.favorites?.some(fav => fav.idMeal === dish.idMeal) || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Overlay загрузки */}
      <LoadingOverlay show={loading} text="Подбираем идеальное блюдо..." />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок приложения */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Умный генератор меню
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Персональные рекомендации блюд на основе времени дня, ваших предпочтений и умного алгоритма
          </p>
        </div>

        {/* Быстрые фильтры */}
        {/*
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Быстрые фильтры:</h3>
          <QuickPreferences onQuickFilter={applyQuickFilter} />
        </div>
        */}

        {/* Селектор типа питания */}
        <div className="mb-8">
          <MealTypeSelector
            selectedType={selectedMealType}
            onTypeChange={setSelectedMealType}
            autoDetect={true}
          />
        </div>

        {/* Панель настроек */}
        <div className="mb-8">
          <PreferencesPanel
            preferences={userPreferences}
            onPreferencesChange={savePreferences}
            isOpen={preferencesOpen}
            onToggle={() => setPreferencesOpen(!preferencesOpen)}
          />
        </div>

        {/* Кнопки генерации */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => generateDish(selectedMealType, 1)}
            disabled={loading || !selectedMealType}
            className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Shuffle className="w-5 h-5 mr-3" />
            Сгенерировать блюдо
          </button>

          <button
            onClick={() => generateDish(selectedMealType, 3)}
            disabled={loading || !selectedMealType}
            className="flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5 mr-3" />
            3 варианта
          </button>
        </div>

        {/* Сообщения об ошибках и успехе */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-700">Блюдо успешно подобрано!</span>
          </div>
        )}

        {/* Отображение результата */}
        {showMultipleRecommendations && recommendations.length > 0 ? (
          // Несколько рекомендаций
          <div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Рекомендации для вас:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation, index) => (
                <DishCard
                  key={recommendation.dish.idMeal}
                  dish={recommendation.dish}
                  analysis={recommendation.analysis}
                  score={recommendation.score}
                  scoreCategory={recommendation.scoreCategory}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  isLiked={isDishLiked(recommendation.dish)}
                  showDetails={true}
                />
              ))}
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => setShowMultipleRecommendations(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Показать одно блюдо
              </button>
            </div>
          </div>
        ) : currentDish ? (
          // Одно блюдо
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Рекомендуем для вас:
            </h2>
            <DishCard
              dish={currentDish}
              analysis={dishAnalysis}
              score={dishScore}
              scoreCategory={scoreCategory}
              onLike={handleLike}
              onDislike={handleDislike}
              isLiked={isDishLiked(currentDish)}
              showDetails={true}
            />
            <div className="text-center mt-6">
              <button
                onClick={() => generateDish()}
                disabled={loading}
                className="flex items-center justify-center mx-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать другое блюдо
              </button>
            </div>
          </div>
        ) : (
          // Заглушка при отсутствии данных
          !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Готовы начать?
              </h3>
              <p className="text-gray-600">
                Выберите тип питания и нажмите "Сгенерировать блюдо"
              </p>
            </div>
          )
        )}

        {/* История (краткая) */}
        {userPreferences.history && userPreferences.history.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Недавно просмотренные:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userPreferences.history.slice(0, 4).map((entry, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setCurrentDish(entry.dish);
                    setShowMultipleRecommendations(false);
                  }}
                >
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {entry.dish.strMeal}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.dish.strCategory}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
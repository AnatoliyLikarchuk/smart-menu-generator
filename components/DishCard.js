// Компонент красивой карточки блюда

import { useState, useEffect } from 'react';
import { 
  Heart, 
  HeartOff, 
  Clock, 
  ChefHat, 
  Flame, 
  ExternalLink,
  Share2,
  BookmarkPlus,
  Info,
  Languages,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import StorageService from '../services/storageService.js';
import TranslationService from '../services/translationService.js';

/**
 * Компонент карточки блюда
 * @param {Object} props - свойства компонента
 * @param {Object} props.dish - объект блюда
 * @param {Object} props.analysis - анализ блюда
 * @param {number} props.score - оценка блюда
 * @param {string} props.scoreCategory - категория оценки
 * @param {Function} props.onLike - callback для лайка
 * @param {Function} props.onDislike - callback для дизлайка
 * @param {boolean} props.isLiked - состояние лайка
 * @param {boolean} props.showDetails - показывать детали
 * @returns {JSX.Element} JSX элемент карточки блюда
 */
export default function DishCard({ 
  dish, 
  analysis, 
  score, 
  scoreCategory,
  onLike,
  onDislike,
  isLiked = false,
  showDetails = true,
  onFavoriteToggle,
  useRussian = true,
  showLanguageToggle = true
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFavorite, setIsFavorite] = useState(StorageService.isFavorite(dish.idMeal));
  const [translatedDish, setTranslatedDish] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showRussian, setShowRussian] = useState(useRussian);

  // Эффект для перевода блюда
  useEffect(() => {
    const translateDishData = async () => {
      if (!dish || !showRussian) return;
      
      setTranslating(true);
      try {
        // Попробуем использовать серверный API для лучшего качества переводов
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'dish',
            data: dish,
            options: {
              translateIngredients: true,
              useAPI: true
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setTranslatedDish(result.data);
          } else {
            throw new Error(result.error);
          }
        } else {
          throw new Error('Ошибка сервера переводов');
        }
      } catch (error) {
        console.warn('[DishCard] Ошибка серверного перевода, используем клиентский:', error.message);
        // Fallback на клиентский TranslationService
        try {
          const translated = await TranslationService.translateDish(dish, true, true);
          setTranslatedDish(translated);
        } catch (fallbackError) {
          console.warn('[DishCard] Ошибка клиентского перевода:', fallbackError.message);
        }
      } finally {
        setTranslating(false);
      }
    };

    translateDishData();
  }, [dish, showRussian]);

  // Получение ингредиентов из объекта блюда
  const getIngredients = () => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = dish[`strIngredient${i}`];
      const measure = dish[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure && measure.trim() ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  };

  // Получение цвета калорийности
  const getCalorieColor = (calorieCategory) => {
    if (!calorieCategory) return 'text-gray-600 bg-gray-100';
    
    return `${calorieCategory.textColor} ${calorieCategory.bgColor}`;
  };

  // Форматирование времени приготовления
  const formatCookingTime = (minutes) => {
    if (!minutes) return 'Время неизвестно';
    
    if (minutes < 60) {
      return `${minutes} мин`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}ч ${remainingMinutes}м`
        : `${hours}ч`;
    }
  };

  // Форматирование сложности
  const getComplexityText = (complexity) => {
    if (complexity <= 5) return 'Простое';
    if (complexity <= 10) return 'Среднее';
    return 'Сложное';
  };

  const getComplexityColor = (complexity) => {
    if (complexity <= 5) return 'text-green-600';
    if (complexity <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ingredients = getIngredients();

  // Обработчики для лайков/дизлайков
  const handleLike = () => {
    StorageService.addToFavorites(dish);
    setIsFavorite(true);
    if (onLike) {
      onLike(dish);
    }
    console.log('[DishCard] Блюдо добавлено в избранное:', dish.strMeal);
  };

  const handleDislike = () => {
    StorageService.addToBlacklist(dish);
    if (onDislike) {
      onDislike(dish);
    }
    console.log('[DishCard] Блюдо добавлено в черный список:', dish.strMeal);
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      StorageService.removeFromFavorites(dish.idMeal);
      setIsFavorite(false);
    } else {
      StorageService.addToFavorites(dish);
      setIsFavorite(true);
    }
    
    if (onFavoriteToggle) {
      onFavoriteToggle(dish, !isFavorite);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Заголовок карточки */}
      <div className="relative">
        {/* Изображение блюда */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          {!imageError && dish.strMealThumb ? (
            <img
              src={dish.strMealThumb}
              alt={dish.strMeal}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ChefHat className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Оверлей с градиентом */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Категория блюда */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
              {showRussian && translatedDish?.strCategoryRu 
                ? translatedDish.strCategoryRu 
                : dish.strCategory}
            </span>
          </div>

          {/* Калорийность блюда */}
          {showDetails && analysis && analysis.calories && (
            <div className="absolute top-4 right-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${getCalorieColor(analysis.calorieCategory)}`}>
                <Flame className="w-4 h-4 mr-1" />
                {analysis.calories} ккал
              </div>
            </div>
          )}
        </div>

        {/* Название блюда */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                {showRussian && translatedDish?.strMealRu 
                  ? translatedDish.strMealRu 
                  : dish.strMeal}
              </h3>
              {dish.strArea && (
                <p className="text-white/80 text-sm drop-shadow">
                  {showRussian && translatedDish?.strAreaRu 
                    ? `${translatedDish.strAreaRu} кухня`
                    : `${dish.strArea} кухня`}
                </p>
              )}
            </div>
            
            {/* Переключатель языка */}
            {showLanguageToggle && (
              <button
                onClick={() => setShowRussian(!showRussian)}
                className="ml-2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title={showRussian ? 'Switch to English' : 'Переключить на русский'}
              >
                <Languages className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Содержимое карточки */}
      <div className="p-6">
        {/* Метрики блюда */}
        {showDetails && analysis && (
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Время приготовления */}
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">{formatCookingTime(analysis.cookingTime)}</span>
            </div>

            {/* Сложность */}
            <div className="flex items-center text-gray-600">
              <ChefHat className="w-4 h-4 mr-2" />
              <span className={`text-sm font-medium ${getComplexityColor(analysis.complexity)}`}>
                {getComplexityText(analysis.complexity)}
              </span>
            </div>

            {/* Контекстная категория калорийности */}
            {analysis && analysis.calories && analysis.calorieCategory && (
              <div className="flex items-center">
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${analysis.calorieCategory.textColor} ${analysis.calorieCategory.bgColor}`}>
                  {analysis.calorieCategory.label}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ингредиенты */}
        {ingredients.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors mb-2"
            >
              <Info className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Ингредиенты ({ingredients.length})
              </span>
            </button>
            
            {showIngredients && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {translating && showRussian && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Languages className="w-4 h-4 mr-2 animate-pulse" />
                    Переводим ингредиенты...
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  {ingredients.map((ingredient, index) => {
                    const translatedName = showRussian && translatedDish?.ingredientsRu?.[index]
                      ? translatedDish.ingredientsRu[index]
                      : ingredient.name;
                    
                    return (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-gray-800 font-medium text-base">
                          {translatedName}
                          {showRussian && translatedName !== ingredient.name && (
                            <span className="text-gray-400 text-sm ml-2 font-normal">
                              ({ingredient.name})
                            </span>
                          )}
                        </span>
                        {ingredient.measure && (
                          <span className="text-gray-600 text-sm font-medium ml-3 flex-shrink-0">
                            {showRussian 
                              ? TranslationService.translateMeasure(ingredient.measure)
                              : ingredient.measure}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Инструкции приготовления */}
        {dish.strInstructions && (
          <div className="mb-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors mb-2"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Инструкции приготовления
              </span>
            </button>
            
            {showInstructions && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                {translating && showRussian && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Languages className="w-4 h-4 mr-2 animate-pulse" />
                    Переводим инструкции...
                  </div>
                )}
                <div className="text-gray-800 leading-relaxed text-sm">
                  {showRussian && translatedDish?.strInstructionsRu 
                    ? (
                      <div>
                        <p className="whitespace-pre-line">
                          {translatedDish.strInstructionsRu}
                        </p>
                        <details className="mt-3 text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">
                            Показать оригинал
                          </summary>
                          <p className="mt-2 whitespace-pre-line font-mono">
                            {dish.strInstructions}
                          </p>
                        </details>
                      </div>
                    )
                    : (
                      <p className="whitespace-pre-line">
                        {dish.strInstructions}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Действия */}
        <div className="flex items-center justify-between">
          {/* Кнопки лайк/дизлайк */}
          <div className="flex space-x-2">
            <button
              onClick={handleLike}
              className={`flex items-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                isLiked
                  ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <ThumbsUp 
                className={`w-4 h-4 ${isLiked ? 'fill-current' : ''} sm:mr-2`} 
              />
              <span className="text-sm hidden sm:inline">Нравится</span>
            </button>

            <button
              onClick={handleDislike}
              className="flex items-center px-2 sm:px-3 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <ThumbsDown className="w-4 h-4 sm:mr-2" />
              <span className="text-sm hidden sm:inline">Не нравится</span>
            </button>
          </div>

          {/* Дополнительные действия */}
          <div className="flex space-x-2">
            {dish.strSource && (
              <a
                href={dish.strSource}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Открыть рецепт"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 transition-colors ${
                isFavorite 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
              title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <BookmarkPlus className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              title="Поделиться"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент компактной карточки блюда
 * @param {Object} props - свойства компонента  
 * @param {Object} props.dish - объект блюда
 * @param {Function} props.onClick - callback при клике
 * @returns {JSX.Element} JSX элемент компактной карточки
 */
export function CompactDishCard({ dish, onClick }) {
  return (
    <div 
      onClick={() => onClick && onClick(dish)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 p-4"
    >
      <div className="flex items-center space-x-4">
        {/* Мини изображение */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {dish.strMealThumb ? (
            <img
              src={dish.strMealThumb}
              alt={dish.strMeal}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {dish.strMeal}
          </h4>
          <p className="text-sm text-gray-500 truncate">
            {dish.strCategory}
          </p>
        </div>

        {/* Стрелка */}
        <div className="flex-shrink-0">
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
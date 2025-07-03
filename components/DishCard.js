// Компонент красивой карточки блюда

import { useState } from 'react';
import { 
  Heart, 
  HeartOff, 
  Clock, 
  ChefHat, 
  Star, 
  ExternalLink,
  Share2,
  BookmarkPlus,
  Info
} from 'lucide-react';
import StorageService from '../services/storageService.js';

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
  onFavoriteToggle
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isFavorite, setIsFavorite] = useState(StorageService.isFavorite(dish.idMeal));

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

  // Получение цвета оценки
  const getScoreColor = (category) => {
    switch (category) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Получение текста категории оценки
  const getScoreCategoryText = (category) => {
    switch (category) {
      case 'excellent': return 'Отлично';
      case 'good': return 'Хорошо';
      case 'average': return 'Неплохо';
      case 'poor': return 'Так себе';
      default: return 'Оценка';
    }
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
              {dish.strCategory}
            </span>
          </div>

          {/* Оценка блюда */}
          {showDetails && score && (
            <div className="absolute top-4 right-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(scoreCategory)}`}>
                <Star className="w-4 h-4 mr-1" />
                {score.toFixed(1)}
              </div>
            </div>
          )}
        </div>

        {/* Название блюда */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
            {dish.strMeal}
          </h3>
          {dish.strArea && (
            <p className="text-white/80 text-sm drop-shadow">
              {dish.strArea} кухня
            </p>
          )}
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

            {/* Категория оценки */}
            <div className="flex items-center">
              <div className={`px-2 py-1 rounded-md text-xs font-medium ${getScoreColor(scoreCategory)}`}>
                {getScoreCategoryText(scoreCategory)}
              </div>
            </div>
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
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1">
                  {ingredients.slice(0, 10).map((ingredient, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{ingredient.name}</span>
                      {ingredient.measure && (
                        <span className="text-gray-500 text-xs">{ingredient.measure}</span>
                      )}
                    </div>
                  ))}
                  {ingredients.length > 10 && (
                    <div className="text-xs text-gray-500 mt-1">
                      +{ingredients.length - 10} ингредиентов
                    </div>
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
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isLiked
                  ? 'bg-red-500 text-white shadow-md hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart 
                className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} 
              />
              <span className="text-sm">Нравится</span>
            </button>

            <button
              onClick={handleDislike}
              className="flex items-center px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <HeartOff className="w-4 h-4 mr-2" />
              <span className="text-sm">Не нравится</span>
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
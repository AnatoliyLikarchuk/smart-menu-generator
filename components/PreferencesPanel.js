// Компонент панели настроек пользователя

import { useState, useEffect } from 'react';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Plus,
  Trash2,
  Save,
  RotateCcw,
  BarChart3,
  Heart,
  Clock,
  Globe
} from 'lucide-react';
import StorageService from '../services/storageService.js';
import { 
  getCuisinesGroupedByRegion, 
  getCuisineInfo, 
  POPULAR_CUISINES,
  DEFAULT_CUISINE_PREFERENCES
} from '../data/cuisines.js';

/**
 * Компонент панели настроек пользователя
 * @param {Object} props - свойства компонента
 * @param {Object} props.preferences - текущие предпочтения
 * @param {Function} props.onPreferencesChange - callback изменения предпочтений
 * @param {boolean} props.isOpen - открыта ли панель
 * @param {Function} props.onToggle - callback переключения панели
 * @returns {JSX.Element} JSX элемент панели настроек
 */
export default function PreferencesPanel({ 
  preferences = {}, 
  onPreferencesChange, 
  isOpen = false, 
  onToggle 
}) {
  const [newIngredient, setNewIngredient] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [blacklist, setBlacklist] = useState([]);

  // Значения по умолчанию
  const defaultPreferences = {
    dislikedIngredients: [],
    dietaryRestrictions: [],
    favorites: [],
    blacklist: [],
    history: [],
    preferredComplexity: 'any', // 'simple', 'medium', 'complex', 'any'
    ...DEFAULT_CUISINE_PREFERENCES
  };

  // Объединяем с дефолтными значениями
  const currentPrefs = { ...defaultPreferences, ...preferences };

  // Загрузка данных из StorageService при открытии панели
  useEffect(() => {
    if (isOpen) {
      const userStats = StorageService.getStats();
      const userFavorites = StorageService.getFavorites();
      const userBlacklist = StorageService.getBlacklist();
      
      setStats(userStats);
      setFavorites(userFavorites);
      setBlacklist(userBlacklist);
    }
  }, [isOpen]);

  // Доступные диетические ограничения
  const availableDietaryRestrictions = [
    { id: 'vegetarian', label: 'Вегетарианство', description: 'Без мяса' },
    { id: 'vegan', label: 'Веганство', description: 'Без животных продуктов' },
    { id: 'pescatarian', label: 'Пескетарианство', description: 'Только рыба из животных продуктов' },
    { id: 'gluten-free', label: 'Без глютена', description: 'Исключить пшеницу, рожь, ячмень' },
    { id: 'dairy-free', label: 'Без молочных продуктов', description: 'Исключить молоко и производные' },
    { id: 'nut-free', label: 'Без орехов', description: 'Исключить все виды орехов' }
  ];

  // Обновление предпочтений
  const updatePreferences = (newPrefs) => {
    const updated = { ...currentPrefs, ...newPrefs };
    onPreferencesChange(updated);
    setUnsavedChanges(true);
  };

  // Добавление нелюбимого ингредиента
  const addDislikedIngredient = () => {
    if (newIngredient.trim() && !currentPrefs.dislikedIngredients.includes(newIngredient.trim())) {
      updatePreferences({
        dislikedIngredients: [...currentPrefs.dislikedIngredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };

  // Удаление нелюбимого ингредиента
  const removeDislikedIngredient = (ingredient) => {
    updatePreferences({
      dislikedIngredients: currentPrefs.dislikedIngredients.filter(item => item !== ingredient)
    });
  };

  // Переключение диетического ограничения
  const toggleDietaryRestriction = (restriction) => {
    const current = currentPrefs.dietaryRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(item => item !== restriction)
      : [...current, restriction];
    
    updatePreferences({ dietaryRestrictions: updated });
  };

  // Переключение предпочитаемой кухни
  const togglePreferredCuisine = (cuisine) => {
    const current = currentPrefs.preferredCuisines || [];
    const updated = current.includes(cuisine)
      ? current.filter(item => item !== cuisine)
      : [...current, cuisine];
    
    updatePreferences({ preferredCuisines: updated });
  };

  // Переключение предпочитаемого региона (выбрать/убрать все кухни региона)
  const togglePreferredRegion = (regionId) => {
    const cuisinesGrouped = getCuisinesGroupedByRegion();
    const region = Object.values(cuisinesGrouped).find(r => r.id === regionId);
    
    if (!region) return;
    
    const regionCuisineKeys = region.cuisines.map(c => c.key);
    const currentCuisines = currentPrefs.preferredCuisines || [];
    
    // Проверяем, все ли кухни региона уже выбраны
    const allRegionCuisinesSelected = regionCuisineKeys.every(key => currentCuisines.includes(key));
    
    let updatedCuisines;
    if (allRegionCuisinesSelected) {
      // Если все выбраны, убираем все кухни региона
      updatedCuisines = currentCuisines.filter(cuisine => !regionCuisineKeys.includes(cuisine));
    } else {
      // Если не все выбраны, добавляем все кухни региона
      const newCuisines = regionCuisineKeys.filter(cuisine => !currentCuisines.includes(cuisine));
      updatedCuisines = [...currentCuisines, ...newCuisines];
    }
    
    updatePreferences({ preferredCuisines: updatedCuisines });
  };

  // Удаление из избранного
  const removeFromFavorites = (dishId) => {
    const updatedFavorites = StorageService.removeFromFavorites(dishId);
    setFavorites(updatedFavorites);
  };

  // Удаление из черного списка
  const removeFromBlacklist = (dishId) => {
    const updatedBlacklist = StorageService.removeFromBlacklist(dishId);
    setBlacklist(updatedBlacklist);
  };

  // Очистка всех данных
  const clearAllData = () => {
    if (window.confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
      StorageService.clearAllData();
      setStats(null);
      setFavorites([]);
      setBlacklist([]);
      resetPreferences();
    }
  };

  // Сброс настроек
  const resetPreferences = () => {
    onPreferencesChange(defaultPreferences);
    setUnsavedChanges(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Заголовок панели */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center">
          <Settings className="w-5 h-5 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">
            Настройки предпочтений
          </h3>
          {unsavedChanges && (
            <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </div>
        
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Содержимое панели */}
      {isOpen && (
        <div className="p-6 space-y-6">
          
          {/* Диетические ограничения - скрыты */}
          {false && (
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Диетические ограничения
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableDietaryRestrictions.map((restriction) => {
                const isSelected = currentPrefs.dietaryRestrictions?.includes(restriction.id);
                
                return (
                  <label
                    key={restriction.id}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDietaryRestriction(restriction.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        {restriction.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {restriction.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
          )}

          {/* Нелюбимые ингредиенты */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Нелюбимые ингредиенты
            </h4>
            
            {/* Добавление нового ингредиента */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDislikedIngredient()}
                placeholder="Введите ингредиент..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addDislikedIngredient}
                disabled={!newIngredient.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Список нелюбимых ингредиентов */}
            {currentPrefs.dislikedIngredients?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentPrefs.dislikedIngredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeDislikedIngredient(ingredient)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Нет исключенных ингредиентов
              </p>
            )}
          </div>


          {/* Предпочтения по сложности */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Предпочитаемая сложность
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'any', label: 'Любая' },
                { id: 'simple', label: 'Простая' },
                { id: 'medium', label: 'Средняя' },
                { id: 'complex', label: 'Сложная' }
              ].map((complexity) => (
                <button
                  key={complexity.id}
                  onClick={() => updatePreferences({ preferredComplexity: complexity.id })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPrefs.preferredComplexity === complexity.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {complexity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Предпочтения по кухням */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Предпочитаемые кухни
            </h4>
            
            {/* Популярные кухни */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Популярные:</h5>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CUISINES.map((cuisine) => {
                  const cuisineInfo = getCuisineInfo(cuisine);
                  const isSelected = currentPrefs.preferredCuisines?.includes(cuisine);
                  
                  return (
                    <button
                      key={cuisine}
                      onClick={() => togglePreferredCuisine(cuisine)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cuisineInfo.flag} {cuisineInfo.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Кухни по регионам */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">По регионам:</h5>
              <div className="space-y-3">
                {Object.values(getCuisinesGroupedByRegion()).map((region) => {
                  // Проверяем, выбраны ли все кухни региона
                  const regionCuisineKeys = region.cuisines.map(c => c.key);
                  const currentCuisines = currentPrefs.preferredCuisines || [];
                  const isRegionSelected = regionCuisineKeys.length > 0 && regionCuisineKeys.every(key => currentCuisines.includes(key));
                  
                  return (
                    <div key={region.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isRegionSelected}
                            onChange={() => togglePreferredRegion(region.id)}
                            className="mr-2"
                          />
                          <span className="font-medium text-gray-800">
                            {region.icon} {region.name}
                          </span>
                        </label>
                        <span className="text-xs text-gray-500">
                          {region.cuisines.filter(c => currentPrefs.preferredCuisines?.includes(c.key)).length}/{region.cuisines.length}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {region.cuisines.map((cuisine) => {
                          const isSelected = currentPrefs.preferredCuisines?.includes(cuisine.key);
                          
                          return (
                            <button
                              key={cuisine.key}
                              onClick={() => togglePreferredCuisine(cuisine.key)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                isSelected
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {cuisine.flag} {cuisine.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Выбранные кухни */}
            {currentPrefs.preferredCuisines?.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="text-sm font-medium text-green-800 mb-2">
                  Выбрано кухонь: {currentPrefs.preferredCuisines.length}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {currentPrefs.preferredCuisines.map((cuisine) => {
                    const cuisineInfo = getCuisineInfo(cuisine);
                    return (
                      <span
                        key={cuisine}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                      >
                        {cuisineInfo.flag} {cuisineInfo.name}
                        <button
                          onClick={() => togglePreferredCuisine(cuisine)}
                          className="ml-1 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Статистика */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-800 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Статистика
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.totalViewed || 0}
                </div>
                <div className="text-sm text-gray-600">Просмотрено</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.favoritesCount || 0}
                </div>
                <div className="text-sm text-gray-600">Избранное</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.blacklistCount || 0}
                </div>
                <div className="text-sm text-gray-600">Заблокировано</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentPrefs.dietaryRestrictions?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Ограничения</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {currentPrefs.preferredCuisines?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Кухни</div>
              </div>
            </div>
          </div>

          {/* Избранные блюда */}
          {favorites.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                Избранные блюда ({favorites.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {favorites.slice(0, 5).map((favorite, index) => (
                  <div
                    key={favorite.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={favorite.image}
                        alt={favorite.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {favorite.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {favorite.category}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromFavorites(favorite.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Удалить из избранного"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {favorites.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{favorites.length - 5} блюд
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Заблокированные блюда */}
          {blacklist.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <X className="w-4 h-4 mr-2 text-red-500" />
                Заблокированные блюда ({blacklist.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {blacklist.slice(0, 5).map((blocked, index) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {blocked.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {blocked.category}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromBlacklist(blocked.id)}
                      className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      title="Разблокировать"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {blacklist.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{blacklist.length - 5} блюд
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Действия */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={resetPreferences}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить настройки
            </button>
            
            <button
              onClick={clearAllData}
              className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить данные
            </button>
            
            {unsavedChanges && (
              <button
                onClick={() => setUnsavedChanges(false)}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors sm:ml-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранено
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Компонент быстрых настроек
 * @param {Object} props - свойства компонента
 * @param {Function} props.onQuickFilter - callback быстрого фильтра
 * @returns {JSX.Element} JSX элемент быстрых настроек
 */
export function QuickPreferences({ onQuickFilter }) {
  const quickFilters = [
    { id: 'vegetarian', label: '🥬 Вегетарианское', filter: { dietaryRestrictions: ['vegetarian'] } },
    { id: 'quick', label: '⚡ Быстрое (до 30 мин)', filter: { maxCookingTime: 30 } },
    { id: 'simple', label: '👶 Простое', filter: { preferredComplexity: 'simple' } },
    { id: 'no-onion', label: '🚫 Без лука', filter: { dislikedIngredients: ['onion', 'лук'] } }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onQuickFilter(filter.filter)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
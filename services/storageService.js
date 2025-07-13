/**
 * Сервис для работы с localStorage
 * Управляет предпочтениями пользователя, историей и избранными блюдами
 */

import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../utils/constants.js';
import { DEFAULT_CUISINE_PREFERENCES, validateCuisines } from '../data/cuisines.js';

class StorageService {
  /**
   * Проверка доступности localStorage
   */
  static isLocalStorageAvailable() {
    try {
      // ПРОВЕРЯЕМ ЧТО МЫ В БРАУЗЕРЕ!
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('[StorageService] LocalStorage недоступен:', error);
      return false;
    }
  }

  /**
   * Безопасное получение данных из localStorage
   */
  static safeGetItem(key) {
    try {
      if (!this.isLocalStorageAvailable()) return null;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`[StorageService] Ошибка получения ${key}:`, error);
      return null;
    }
  }

  /**
   * Безопасное сохранение данных в localStorage
   */
  static safeSetItem(key, value) {
    try {
      if (!this.isLocalStorageAvailable()) return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Ошибка сохранения ${key}:`, error);
      return false;
    }
  }

  /**
   * Получение предпочтений пользователя
   */
  static getPreferences() {
    const preferences = this.safeGetItem(STORAGE_KEYS.PREFERENCES);
    
    const defaultWithCuisines = {
      ...DEFAULT_PREFERENCES,
      ...DEFAULT_CUISINE_PREFERENCES
    };
    
    if (!preferences) {
      // Если предпочтений нет, создаем дефолтные
      this.savePreferences(defaultWithCuisines);
      return defaultWithCuisines;
    }
    
    // Объединяем с дефолтными значениями на случай новых полей
    const mergedPreferences = {
      ...defaultWithCuisines,
      ...preferences
    };
    
    // Валидируем кухни чтобы убрать невалидные
    if (mergedPreferences.preferredCuisines) {
      mergedPreferences.preferredCuisines = validateCuisines(mergedPreferences.preferredCuisines);
    }
    
    return mergedPreferences;
  }

  /**
   * Сохранение предпочтений пользователя
   */
  static savePreferences(preferences) {
    // Валидируем кухни перед сохранением
    const validatedPreferences = { ...preferences };
    if (validatedPreferences.preferredCuisines) {
      validatedPreferences.preferredCuisines = validateCuisines(validatedPreferences.preferredCuisines);
    }
    
    const success = this.safeSetItem(STORAGE_KEYS.PREFERENCES, validatedPreferences);
    if (success) {
      console.log('[StorageService] Предпочтения сохранены');
    }
    return success;
  }

  /**
   * Получение истории просмотренных блюд
   */
  static getHistory() {
    return this.safeGetItem(STORAGE_KEYS.HISTORY) || [];
  }

  /**
   * Добавление блюда в историю
   */
  static addToHistory(dish) {
    try {
      const history = this.getHistory();
      const historyEntry = {
        id: dish.idMeal,
        name: dish.strMeal,
        category: dish.strCategory,
        image: dish.strMealThumb,
        viewedAt: new Date().toISOString(),
        mealType: dish.mealType || 'unknown'
      };

      // Удаляем предыдущие записи этого блюда
      const filteredHistory = history.filter(entry => entry.id !== dish.idMeal);
      
      // Добавляем новую запись в начало
      filteredHistory.unshift(historyEntry);

      // Ограничиваем историю последними 50 блюдами
      const limitedHistory = filteredHistory.slice(0, 50);

      this.safeSetItem(STORAGE_KEYS.HISTORY, limitedHistory);
      console.log('[StorageService] Блюдо добавлено в историю:', dish.strMeal);
      
      return limitedHistory;
    } catch (error) {
      console.error('[StorageService] Ошибка добавления в историю:', error);
      return this.getHistory();
    }
  }

  /**
   * Получение избранных блюд
   */
  static getFavorites() {
    return this.safeGetItem(STORAGE_KEYS.FAVORITES) || [];
  }

  /**
   * Добавление блюда в избранное
   */
  static addToFavorites(dish) {
    try {
      const favorites = this.getFavorites();
      const favoriteEntry = {
        id: dish.idMeal,
        name: dish.strMeal,
        category: dish.strCategory,
        image: dish.strMealThumb,
        addedAt: new Date().toISOString(),
        score: dish.score || 0
      };

      // Проверяем, что блюдо еще не в избранном
      const exists = favorites.some(fav => fav.id === dish.idMeal);
      if (exists) {
        console.log('[StorageService] Блюдо уже в избранном:', dish.strMeal);
        return favorites;
      }

      favorites.unshift(favoriteEntry);
      this.safeSetItem(STORAGE_KEYS.FAVORITES, favorites);
      console.log('[StorageService] Блюдо добавлено в избранное:', dish.strMeal);
      
      return favorites;
    } catch (error) {
      console.error('[StorageService] Ошибка добавления в избранное:', error);
      return this.getFavorites();
    }
  }

  /**
   * Удаление блюда из избранного
   */
  static removeFromFavorites(dishId) {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.id !== dishId);
      
      this.safeSetItem(STORAGE_KEYS.FAVORITES, filteredFavorites);
      console.log('[StorageService] Блюдо удалено из избранного:', dishId);
      
      return filteredFavorites;
    } catch (error) {
      console.error('[StorageService] Ошибка удаления из избранного:', error);
      return this.getFavorites();
    }
  }

  /**
   * Получение черного списка блюд
   */
  static getBlacklist() {
    return this.safeGetItem(STORAGE_KEYS.BLACKLIST) || [];
  }

  /**
   * Добавление блюда в черный список
   */
  static addToBlacklist(dish) {
    try {
      const blacklist = this.getBlacklist();
      const blacklistEntry = {
        id: dish.idMeal,
        name: dish.strMeal,
        category: dish.strCategory,
        addedAt: new Date().toISOString(),
        reason: 'user_dislike'
      };

      // Проверяем, что блюдо еще не в черном списке
      const exists = blacklist.some(item => item.id === dish.idMeal);
      if (exists) {
        console.log('[StorageService] Блюдо уже в черном списке:', dish.strMeal);
        return blacklist;
      }

      blacklist.unshift(blacklistEntry);
      this.safeSetItem(STORAGE_KEYS.BLACKLIST, blacklist);
      console.log('[StorageService] Блюдо добавлено в черный список:', dish.strMeal);
      
      return blacklist;
    } catch (error) {
      console.error('[StorageService] Ошибка добавления в черный список:', error);
      return this.getBlacklist();
    }
  }

  /**
   * Удаление блюда из черного списка
   */
  static removeFromBlacklist(dishId) {
    try {
      const blacklist = this.getBlacklist();
      const filteredBlacklist = blacklist.filter(item => item.id !== dishId);
      
      this.safeSetItem(STORAGE_KEYS.BLACKLIST, filteredBlacklist);
      console.log('[StorageService] Блюдо удалено из черного списка:', dishId);
      
      return filteredBlacklist;
    } catch (error) {
      console.error('[StorageService] Ошибка удаления из черного списка:', error);
      return this.getBlacklist();
    }
  }

  /**
   * Проверка, было ли блюдо показано недавно
   */
  static isRecentlyShown(dishId, daysToAvoid = 3) {
    try {
      const history = this.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToAvoid);

      const recentEntry = history.find(entry => {
        if (entry.id !== dishId) return false;
        
        const viewedDate = new Date(entry.viewedAt);
        return viewedDate > cutoffDate;
      });

      return !!recentEntry;
    } catch (error) {
      console.error('[StorageService] Ошибка проверки недавних блюд:', error);
      return false;
    }
  }

  /**
   * Проверка, есть ли блюдо в черном списке
   */
  static isBlacklisted(dishId) {
    try {
      const blacklist = this.getBlacklist();
      return blacklist.some(item => item.id === dishId);
    } catch (error) {
      console.error('[StorageService] Ошибка проверки черного списка:', error);
      return false;
    }
  }

  /**
   * Проверка, есть ли блюдо в избранном
   */
  static isFavorite(dishId) {
    try {
      const favorites = this.getFavorites();
      return favorites.some(fav => fav.id === dishId);
    } catch (error) {
      console.error('[StorageService] Ошибка проверки избранного:', error);
      return false;
    }
  }

  /**
   * Получение статистики пользователя
   */
  static getStats() {
    try {
      const history = this.getHistory();
      const favorites = this.getFavorites();
      const blacklist = this.getBlacklist();
      
      const stats = {
        totalViewed: history.length,
        favoritesCount: favorites.length,
        blacklistCount: blacklist.length,
        lastViewed: history[0]?.viewedAt || null,
        
        // Статистика по типам питания
        mealTypeStats: {},
        
        // Статистика по категориям
        categoryStats: {}
      };

      // Подсчет по типам питания
      history.forEach(entry => {
        const mealType = entry.mealType || 'unknown';
        stats.mealTypeStats[mealType] = (stats.mealTypeStats[mealType] || 0) + 1;
      });

      // Подсчет по категориям
      history.forEach(entry => {
        const category = entry.category || 'unknown';
        stats.categoryStats[category] = (stats.categoryStats[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('[StorageService] Ошибка получения статистики:', error);
      return {
        totalViewed: 0,
        favoritesCount: 0,
        blacklistCount: 0,
        lastViewed: null,
        mealTypeStats: {},
        categoryStats: {}
      };
    }
  }

  /**
   * Очистка всех данных
   */
  static clearAllData() {
    try {
      if (!this.isLocalStorageAvailable()) return false;
      
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('[StorageService] Все данные очищены');
      return true;
    } catch (error) {
      console.error('[StorageService] Ошибка очистки данных:', error);
      return false;
    }
  }

  /**
   * Экспорт данных пользователя
   */
  static exportUserData() {
    try {
      const data = {
        preferences: this.getPreferences(),
        history: this.getHistory(),
        favorites: this.getFavorites(),
        blacklist: this.getBlacklist(),
        stats: this.getStats(),
        exportedAt: new Date().toISOString()
      };

      return data;
    } catch (error) {
      console.error('[StorageService] Ошибка экспорта данных:', error);
      return null;
    }
  }

  /**
   * Импорт данных пользователя
   */
  static importUserData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Неверный формат данных');
      }

      if (data.preferences) {
        this.savePreferences(data.preferences);
      }

      if (data.history && Array.isArray(data.history)) {
        this.safeSetItem(STORAGE_KEYS.HISTORY, data.history);
      }

      if (data.favorites && Array.isArray(data.favorites)) {
        this.safeSetItem(STORAGE_KEYS.FAVORITES, data.favorites);
      }

      if (data.blacklist && Array.isArray(data.blacklist)) {
        this.safeSetItem(STORAGE_KEYS.BLACKLIST, data.blacklist);
      }

      console.log('[StorageService] Данные импортированы успешно');
      return true;
    } catch (error) {
      console.error('[StorageService] Ошибка импорта данных:', error);
      return false;
    }
  }
}

export default StorageService;
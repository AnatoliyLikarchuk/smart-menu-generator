// Система кухонь и регионов для Smart Menu Generator

/**
 * Региональные группы кухонь
 */
export const CUISINE_REGIONS = {
  EUROPEAN: {
    id: 'european',
    name: 'Европейская',
    icon: '🇪🇺',
    cuisines: ['British', 'French', 'Italian', 'Spanish', 'Greek', 'Portuguese', 'Dutch', 'Polish', 'Irish', 'Croatian']
  },
  
  ASIAN: {
    id: 'asian', 
    name: 'Азиатская',
    icon: '🥢',
    cuisines: ['Chinese', 'Japanese', 'Thai', 'Indian', 'Malaysian', 'Vietnamese', 'Filipino']
  },
  
  AMERICAN: {
    id: 'american',
    name: 'Американская',
    icon: '🇺🇸',
    cuisines: ['American', 'Canadian', 'Mexican', 'Jamaican', 'Uruguayan']
  },
  
  MIDDLE_EASTERN_AFRICAN: {
    id: 'middle_eastern_african',
    name: 'Ближневосточная и Африканская',
    icon: '🏺',
    cuisines: ['Turkish', 'Egyptian', 'Moroccan', 'Tunisian', 'Kenyan']
  },
  
  SLAVIC: {
    id: 'slavic',
    name: 'Славянская',
    icon: '🥟',
    cuisines: ['Russian', 'Ukrainian', 'Polish']
  }
};

/**
 * Полный список кухонь с их русскими названиями
 */
export const CUISINES = {
  'American': { name: 'Американская', flag: '🇺🇸', region: 'american' },
  'British': { name: 'Британская', flag: '🇬🇧', region: 'european' },
  'Canadian': { name: 'Канадская', flag: '🇨🇦', region: 'american' },
  'Chinese': { name: 'Китайская', flag: '🇨🇳', region: 'asian' },
  'Croatian': { name: 'Хорватская', flag: '🇭🇷', region: 'european' },
  'Dutch': { name: 'Голландская', flag: '🇳🇱', region: 'european' },
  'Egyptian': { name: 'Египетская', flag: '🇪🇬', region: 'middle_eastern_african' },
  'Filipino': { name: 'Филиппинская', flag: '🇵🇭', region: 'asian' },
  'French': { name: 'Французская', flag: '🇫🇷', region: 'european' },
  'Greek': { name: 'Греческая', flag: '🇬🇷', region: 'european' },
  'Indian': { name: 'Индийская', flag: '🇮🇳', region: 'asian' },
  'Irish': { name: 'Ирландская', flag: '🇮🇪', region: 'european' },
  'Italian': { name: 'Итальянская', flag: '🇮🇹', region: 'european' },
  'Jamaican': { name: 'Ямайская', flag: '🇯🇲', region: 'american' },
  'Japanese': { name: 'Японская', flag: '🇯🇵', region: 'asian' },
  'Kenyan': { name: 'Кенийская', flag: '🇰🇪', region: 'middle_eastern_african' },
  'Malaysian': { name: 'Малайзийская', flag: '🇲🇾', region: 'asian' },
  'Mexican': { name: 'Мексиканская', flag: '🇲🇽', region: 'american' },
  'Moroccan': { name: 'Марокканская', flag: '🇲🇦', region: 'middle_eastern_african' },
  'Polish': { name: 'Польская', flag: '🇵🇱', region: 'european' },
  'Portuguese': { name: 'Португальская', flag: '🇵🇹', region: 'european' },
  'Russian': { name: 'Русская', flag: '🇷🇺', region: 'slavic' },
  'Spanish': { name: 'Испанская', flag: '🇪🇸', region: 'european' },
  'Thai': { name: 'Тайская', flag: '🇹🇭', region: 'asian' },
  'Tunisian': { name: 'Тунисская', flag: '🇹🇳', region: 'middle_eastern_african' },
  'Turkish': { name: 'Турецкая', flag: '🇹🇷', region: 'middle_eastern_african' },
  'Ukrainian': { name: 'Украинская', flag: '🇺🇦', region: 'slavic' },
  'Uruguayan': { name: 'Уругвайская', flag: '🇺🇾', region: 'american' },
  'Vietnamese': { name: 'Вьетнамская', flag: '🇻🇳', region: 'asian' }
};

/**
 * Популярные кухни для быстрого выбора
 */
export const POPULAR_CUISINES = [
  'Italian',
  'Chinese', 
  'French',
  'Mexican',
  'Indian',
  'Japanese',
  'Thai',
  'American'
];

/**
 * Получает список кухонь для конкретного региона
 * @param {string} regionId - ID региона
 * @returns {string[]} массив названий кухонь
 */
export function getCuisinesByRegion(regionId) {
  const region = Object.values(CUISINE_REGIONS).find(r => r.id === regionId);
  return region ? region.cuisines : [];
}

/**
 * Получает информацию о кухне
 * @param {string} cuisineKey - ключ кухни в API (например, 'Italian')
 * @returns {object} объект с информацией о кухне
 */
export function getCuisineInfo(cuisineKey) {
  return CUISINES[cuisineKey] || { 
    name: cuisineKey, 
    flag: '🌍', 
    region: 'unknown' 
  };
}

/**
 * Получает все доступные кухни
 * @returns {string[]} массив ключей кухонь
 */
export function getAllCuisines() {
  return Object.keys(CUISINES);
}

/**
 * Группирует кухни по регионам для отображения
 * @returns {object} объект с группировкой кухонь по регионам
 */
export function getCuisinesGroupedByRegion() {
  const grouped = {};
  
  Object.values(CUISINE_REGIONS).forEach(region => {
    grouped[region.id] = {
      ...region,
      cuisines: region.cuisines.map(cuisineKey => ({
        key: cuisineKey,
        ...getCuisineInfo(cuisineKey)
      }))
    };
  });
  
  return grouped;
}

/**
 * Фильтрует кухни по поисковому запросу
 * @param {string} query - поисковый запрос
 * @returns {object[]} массив подходящих кухонь
 */
export function searchCuisines(query) {
  const lowerQuery = query.toLowerCase();
  
  return Object.entries(CUISINES)
    .filter(([key, info]) => 
      key.toLowerCase().includes(lowerQuery) ||
      info.name.toLowerCase().includes(lowerQuery)
    )
    .map(([key, info]) => ({
      key,
      ...info
    }));
}

/**
 * Проверяет, является ли кухня популярной
 * @param {string} cuisineKey - ключ кухни
 * @returns {boolean}
 */
export function isPopularCuisine(cuisineKey) {
  return POPULAR_CUISINES.includes(cuisineKey);
}

/**
 * Получает название региона по его ID
 * @param {string} regionId - ID региона
 * @returns {string} название региона
 */
export function getRegionName(regionId) {
  const region = Object.values(CUISINE_REGIONS).find(r => r.id === regionId);
  return region ? region.name : 'Неизвестный регион';
}

/**
 * Настройки по умолчанию для предпочтений кухни
 */
export const DEFAULT_CUISINE_PREFERENCES = {
  preferredCuisines: [], // массив ключей предпочитаемых кухонь
  excludedCuisines: [],  // массив ключей исключенных кухонь
  preferredRegions: [],  // массив ID предпочитаемых регионов
  cuisineImportance: 'medium' // 'low', 'medium', 'high' - важность кухни при выборе
};

/**
 * Валидирует массив кухонь
 * @param {string[]} cuisines - массив ключей кухонь
 * @returns {string[]} валидные кухни
 */
export function validateCuisines(cuisines) {
  if (!Array.isArray(cuisines)) return [];
  
  return cuisines.filter(cuisine => 
    typeof cuisine === 'string' && CUISINES.hasOwnProperty(cuisine)
  );
}
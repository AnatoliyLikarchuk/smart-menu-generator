// Тест живого API с переводом
const testResponse = {
  "success": true,
  "data": {
    "dish": {
      "idMeal": "52918",
      "strMeal": "Fish Stew with Rouille",
      "strCategory": "Seafood",
      "strArea": "French",
      "strIngredient1": "Prawns",
      "strIngredient2": "Olive Oil",
      "strIngredient3": "Dry White Wine",
      "strIngredient4": "Fish Stock",
      "strIngredient5": "Fennel",
      "strIngredient6": "Onion",
      "strIngredient7": "Garlic",
      "strIngredient8": "Potatoes",
      "strIngredient9": "Orange",
      "strIngredient10": "Star Anise",
      "strIngredient11": "Bay Leaf",
      "strIngredient12": "Harissa Spice",
      "strIngredient13": "Tomato Puree",
      "strIngredient14": "Chopped Tomatoes",
      "strIngredient15": "Mussels",
      "strIngredient16": "White Fish",
      "strIngredient17": "Thyme",
      "strIngredient18": "Bread"
    }
  }
};

import TranslationService from './services/translationService.js';

async function testLiveTranslation() {
  console.log('🧪 Тестируем перевод живого блюда из API...\n');
  
  const dish = testResponse.data.dish;
  
  try {
    console.log('🔍 Исходное блюдо:');
    console.log(`Название: ${dish.strMeal}`);
    console.log(`Категория: ${dish.strCategory}`);
    console.log(`Кухня: ${dish.strArea}`);
    
    console.log('\n🔄 Переводим...');
    const translatedDish = await TranslationService.translateDish(dish, true, true);
    
    console.log('\n✅ Результат перевода:');
    console.log(`Название: ${dish.strMeal} → ${translatedDish.strMealRu || 'НЕ ПЕРЕВЕДЕНО'}`);
    console.log(`Категория: ${dish.strCategory} → ${translatedDish.strCategoryRu || 'НЕ ПЕРЕВЕДЕНО'}`);
    console.log(`Кухня: ${dish.strArea} → ${translatedDish.strAreaRu || 'НЕ ПЕРЕВЕДЕНО'}`);
    
    console.log('\n🥘 Ингредиенты:');
    if (translatedDish.ingredientsRu) {
      const ingredients = TranslationService.extractIngredients(dish);
      ingredients.forEach((ingredient, index) => {
        const translation = translatedDish.ingredientsRu[index];
        const status = translation === ingredient ? '❌' : '✅';
        console.log(`  ${status} ${ingredient} → ${translation}`);
      });
    }
    
    // Проверяем какие переводы из словаря, а какие будут через API
    console.log('\n📊 Анализ источников переводов:');
    const ingredients = TranslationService.extractIngredients(dish);
    
    // Импортируем функции для проверки словаря
    const { translateDishName, translateIngredient, translateCategory, translateArea } = await import('./data/translations.js');
    
    // Проверяем название блюда
    const dishFromDict = translateDishName(dish.strMeal);
    console.log(`Название в словаре: ${dishFromDict !== dish.strMeal ? '✅ ДА' : '❌ НЕТ'}`);
    
    // Проверяем ингредиенты
    let fromDict = 0, needsAPI = 0;
    ingredients.forEach(ingredient => {
      const translation = translateIngredient(ingredient);
      if (translation !== ingredient) {
        fromDict++;
      } else {
        needsAPI++;
      }
    });
    
    console.log(`Ингредиенты в словаре: ${fromDict}/${ingredients.length}`);
    console.log(`Требуют API перевод: ${needsAPI}/${ingredients.length}`);
    
    console.log('\n🎯 Заключение:');
    if (needsAPI === 0) {
      console.log('🟢 Все переводы из статического словаря - мгновенно!');
    } else if (needsAPI <= 3) {
      console.log('🟡 Большинство из словаря, несколько через API - быстро');
    } else {
      console.log('🟠 Много переводов через API - может быть медленно');
    }
    
  } catch (error) {
    console.error('❌ Ошибка теста:', error.message);
  }
}

testLiveTranslation();
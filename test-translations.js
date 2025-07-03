// Тест системы переводов
import TranslationService from './services/translationService.js';

// Тестовое блюдо
const testDish = {
  idMeal: "52874",
  strMeal: "Beef and Mustard Pie",
  strCategory: "Beef",
  strArea: "British",
  strIngredient1: "Beef",
  strIngredient2: "Plain Flour", 
  strIngredient3: "Rapeseed Oil",
  strIngredient4: "Red Wine",
  strIngredient5: "Beef Stock",
  strIngredient6: "Onion",
  strIngredient7: "Carrots",
  strIngredient8: "Thyme",
  strIngredient9: "Mustard",
  strIngredient10: "Egg",
  strIngredient11: "Milk"
};

async function testTranslations() {
  console.log('🧪 Тестируем систему переводов...\n');
  
  try {
    // Тестируем перевод блюда
    console.log('📝 Переводим блюдо целиком:');
    const translatedDish = await TranslationService.translateDish(testDish, true, true);
    
    console.log('Оригинал:', testDish.strMeal);
    console.log('Перевод:', translatedDish.strMealRu || 'НЕ ПЕРЕВЕДЕНО');
    console.log('Категория:', translatedDish.strCategoryRu || 'НЕ ПЕРЕВЕДЕНО');
    console.log('Кухня:', translatedDish.strAreaRu || 'НЕ ПЕРЕВЕДЕНО');
    
    if (translatedDish.ingredientsRu) {
      console.log('\n🥘 Ингредиенты:');
      const ingredients = TranslationService.extractIngredients(testDish);
      ingredients.forEach((ingredient, index) => {
        const translation = translatedDish.ingredientsRu[index];
        console.log(`  ${ingredient} -> ${translation || 'НЕ ПЕРЕВЕДЕНО'}`);
      });
    }
    
    // Статистика
    console.log('\n📊 Статистика кэша:');
    const stats = TranslationService.getCacheStats();
    console.log(`  Элементов в кэше: ${stats.count}`);
    console.log(`  Размер кэша: ${stats.sizeKB} KB`);
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

// Запускаем тест
testTranslations();
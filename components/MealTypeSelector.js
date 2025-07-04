// Компонент выбора типа питания с красивыми кнопками

import { useState, useEffect } from 'react';
import { Coffee, Sun, Moon, Clock } from 'lucide-react';
import { getCurrentMealType } from '../utils/timeUtils.js';
import { MEAL_TYPES } from '../utils/constants.js';

/**
 * Компонент для выбора типа питания
 * @param {Object} props - свойства компонента
 * @param {string} props.selectedType - выбранный тип питания
 * @param {Function} props.onTypeChange - callback при изменении типа
 * @param {boolean} props.autoDetect - автоматическое определение по времени
 * @returns {JSX.Element} JSX элемент селектора
 */
export default function MealTypeSelector({ 
  selectedType, 
  onTypeChange, 
  autoDetect = true 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detectedType, setDetectedType] = useState(null);

  // Конфигурация типов питания
  const mealTypeConfig = {
    [MEAL_TYPES.BREAKFAST]: {
      label: 'Завтрак',
      icon: Coffee,
      color: 'orange',
      timeRange: '7:00 - 11:00',
      description: 'Начни день правильно'
    },
    [MEAL_TYPES.LUNCH]: {
      label: 'Обед', 
      icon: Sun,
      color: 'yellow',
      timeRange: '12:00 - 16:00',
      description: 'Насыщенный и сытный'
    },
    [MEAL_TYPES.DINNER]: {
      label: 'Ужин',
      icon: Moon,
      color: 'purple',
      timeRange: '18:00 - 22:00',
      description: 'Легкий и вкусный'
    }
  };

  // Обновление времени каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Обновляем каждую минуту

    return () => clearInterval(timer);
  }, []);

  // Автоопределение типа питания
  useEffect(() => {
    if (autoDetect) {
      const detected = getCurrentMealType();
      setDetectedType(detected);
      
      // Если нет выбранного типа, устанавливаем автоопределенный
      if (!selectedType) {
        onTypeChange(detected);
      }
    }
  }, [currentTime, autoDetect, selectedType, onTypeChange]);

  // Форматирование времени
  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Получение CSS классов для кнопки
  const getButtonClasses = (type) => {
    const config = mealTypeConfig[type];
    const isSelected = selectedType === type;
    const isDetected = detectedType === type;
    
    const baseClasses = 'relative flex flex-col items-center p-3 md:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50';
    
    if (isSelected) {
      return `${baseClasses} border-${config.color}-500 bg-${config.color}-50 shadow-lg ring-4 ring-${config.color}-200`;
    }
    
    if (isDetected && autoDetect) {
      return `${baseClasses} border-${config.color}-300 bg-${config.color}-25 border-dashed`;
    }
    
    return `${baseClasses} border-gray-200 bg-white hover:border-${config.color}-300 hover:bg-${config.color}-25`;
  };

  // Получение CSS классов для иконки
  const getIconClasses = (type) => {
    const config = mealTypeConfig[type];
    const isSelected = selectedType === type;
    
    if (isSelected) {
      return `w-6 h-6 md:w-8 md:h-8 text-${config.color}-600`;
    }
    
    return `w-6 h-6 md:w-8 md:h-8 text-gray-400 group-hover:text-${config.color}-500`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Заголовок секции */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Что будем готовить?
        </h2>
        
        {autoDetect && (
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Сейчас {formatTime(currentTime)} - время для {mealTypeConfig[detectedType]?.label.toLowerCase()}
            </span>
          </div>
        )}
      </div>

      {/* Кнопки выбора типа питания */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {Object.entries(mealTypeConfig).map(([type, config]) => {
          const IconComponent = config.icon;
          const isSelected = selectedType === type;
          const isDetected = detectedType === type && autoDetect;
          
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`group ${getButtonClasses(type)}`}
              aria-label={`Выбрать ${config.label}`}
            >
              {/* Иконка типа питания */}
              <div className="mb-2 md:mb-3">
                <IconComponent className={getIconClasses(type)} />
              </div>
              
              {/* Название типа питания */}
              <h3 className={`text-base md:text-lg font-semibold mb-1 ${
                isSelected 
                  ? `text-${config.color}-700` 
                  : 'text-gray-700 group-hover:text-gray-800'
              }`}>
                {config.label}
              </h3>
              
              {/* Временной диапазон */}
              <p className={`text-xs mb-1 ${
                isSelected 
                  ? `text-${config.color}-600` 
                  : 'text-gray-500'
              }`}>
                {config.timeRange}
              </p>
              
              {/* Описание */}
              <p className={`text-sm text-center hidden md:block ${
                isSelected 
                  ? `text-${config.color}-600` 
                  : 'text-gray-500'
              }`}>
                {config.description}
              </p>
              
              {/* Индикатор автоопределения */}
              {isDetected && !isSelected && (
                <div className={`absolute top-2 right-2 w-3 h-3 bg-${config.color}-400 rounded-full animate-pulse`} />
              )}
              
              {/* Индикатор выбора */}
              {isSelected && (
                <div className={`absolute top-2 right-2 w-3 h-3 bg-${config.color}-600 rounded-full`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Подсказка для пользователя */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          {autoDetect && detectedType && !selectedType ? (
            <>Мы определили подходящее время для <strong>{mealTypeConfig[detectedType]?.label.toLowerCase()}</strong>, но вы можете выбрать любой тип питания</>
          ) : selectedType ? (
            <>Выбрано: <strong>{mealTypeConfig[selectedType]?.label}</strong></>
          ) : (
            'Выберите тип питания для персонализированных рекомендаций'
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * Компонент компактного селектора типа питания
 * @param {Object} props - свойства компонента
 * @param {string} props.selectedType - выбранный тип питания
 * @param {Function} props.onTypeChange - callback при изменении типа
 * @returns {JSX.Element} JSX элемент компактного селектора
 */
export function CompactMealTypeSelector({ selectedType, onTypeChange }) {
  const mealTypeConfig = {
    [MEAL_TYPES.BREAKFAST]: { label: 'Завтрак', icon: Coffee, color: 'orange' },
    [MEAL_TYPES.LUNCH]: { label: 'Обед', icon: Sun, color: 'yellow' },
    [MEAL_TYPES.DINNER]: { label: 'Ужин', icon: Moon, color: 'purple' }
  };

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {Object.entries(mealTypeConfig).map(([type, config]) => {
        const IconComponent = config.icon;
        const isSelected = selectedType === type;
        
        return (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
              isSelected 
                ? `bg-${config.color}-500 text-white shadow-md` 
                : 'text-gray-600 hover:text-gray-800 hover:bg-white'
            }`}
          >
            <IconComponent className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
// Компонент красивой анимации загрузки

import { Loader2 } from 'lucide-react';

/**
 * Компонент спиннера загрузки с анимацией
 * @param {Object} props - свойства компонента
 * @param {string} props.size - размер спиннера ('sm', 'md', 'lg')
 * @param {string} props.text - текст для отображения под спиннером
 * @param {string} props.className - дополнительные CSS классы
 * @returns {JSX.Element} JSX элемент спиннера
 */
export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Подбираем идеальное блюдо...', 
  className = '' 
}) {
  // Размеры спиннера
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  // Размеры текста
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Анимированный спиннер */}
      <div className="relative">
        <Loader2 
          className={`${sizeClasses[size]} text-blue-600 animate-spin`}
          strokeWidth={2}
        />
        
        {/* Пульсирующий фон */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} bg-blue-100 rounded-full animate-pulse opacity-50`}
          style={{ animationDelay: '0.5s' }}
        />
      </div>
      
      {/* Текст загрузки */}
      {text && (
        <p className={`mt-4 text-gray-600 text-center font-medium ${textSizeClasses[size]} animate-pulse`}>
          {text}
        </p>
      )}
      
      {/* Дополнительные точки анимации */}
      <div className="flex space-x-1 mt-2">
        <div 
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div 
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}

/**
 * Компонент полноэкранного загрузочного оверлея
 * @param {Object} props - свойства компонента
 * @param {boolean} props.show - показывать ли оверлей
 * @param {string} props.text - текст загрузки
 * @returns {JSX.Element|null} JSX элемент или null
 */
export function LoadingOverlay({ show, text = 'Загрузка...' }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-2xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * Компонент мини-спиннера для кнопок
 * @param {Object} props - свойства компонента
 * @param {string} props.className - дополнительные CSS классы
 * @returns {JSX.Element} JSX элемент мини-спиннера
 */
export function MiniSpinner({ className = '' }) {
  return (
    <Loader2 
      className={`w-4 h-4 animate-spin ${className}`}
      strokeWidth={2}
    />
  );
}

/**
 * Компонент скелетного загрузчика для карточки блюда
 * @returns {JSX.Element} JSX элемент скелетона
 */
export function DishCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      {/* Заголовок */}
      <div className="h-6 bg-gray-200 rounded mb-4"></div>
      
      {/* Изображение */}
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      
      {/* Метаданные */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Кнопки */}
      <div className="flex space-x-2 mt-4">
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  );
}
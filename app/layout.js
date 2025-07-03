import '../styles/globals.css'

export const metadata = {
  title: 'Smart Menu Generator для Тани',
  description: 'Умный генератор меню для выбора блюд',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
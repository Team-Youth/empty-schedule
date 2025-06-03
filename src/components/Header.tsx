import React from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { Globe } from 'lucide-react'

const Header: React.FC = () => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { locale, locales, asPath } = router

  const changeLanguage = (newLocale: string) => {
    router.push(asPath, asPath, { locale: newLocale })
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gradient">
              {t('nav.title')}
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.about')}
            </a>
            <a 
              href="#privacy" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.privacy')}
            </a>
          </nav>

          {/* Language Switcher */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-600" />
              <select
                value={locale}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 border-0 focus:ring-0 cursor-pointer"
              >
                {locales?.map((loc) => (
                  <option key={loc} value={loc}>
                    {getLanguageName(loc)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function getLanguageName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    ko: '한국어',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  }
  return names[locale] || locale
}

export default Header 
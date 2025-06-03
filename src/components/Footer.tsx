import React from 'react'
import { useTranslation } from 'next-i18next'
import { Mail } from 'lucide-react'

const Footer: React.FC = () => {
  const { t } = useTranslation('common')

  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Mail className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">Support:</span>
          <a 
            href="mailto:qkr5882103@gmail.com" 
            className="text-white hover:text-gray-300 transition-colors"
          >
            qkr5882103@gmail.com
          </a>
        </div>
        
        <div className="border-t border-gray-800 pt-4">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 
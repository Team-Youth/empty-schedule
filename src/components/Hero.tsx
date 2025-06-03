import React from 'react'
import { useTranslation } from 'next-i18next'
import { Calendar, Clock, Zap } from 'lucide-react'

const Hero: React.FC = () => {
  const { t } = useTranslation('common')

  const scrollToAnalyzer = () => {
    const element = document.getElementById('analyzer')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-gradient">{t('hero.title')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          <button
            onClick={scrollToAnalyzer}
            className="btn btn-primary text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            {t('hero.cta')}
          </button>
        </div>
        
        {/* Feature highlights */}
        <div className="mt-20 grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="animate-slide-up delay-200">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-10 border border-white/20 shadow-lg h-72 flex flex-col justify-center items-center hover:shadow-xl transition-shadow duration-300">
              <Calendar className="w-16 h-16 text-primary-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Universal Support
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Works with any ICS calendar file
              </p>
            </div>
          </div>
          
          <div className="animate-slide-up delay-400">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-10 border border-white/20 shadow-lg h-72 flex flex-col justify-center items-center hover:shadow-xl transition-shadow duration-300">
              <Zap className="w-16 h-16 text-secondary-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Instant Analysis
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Get results in seconds
              </p>
            </div>
          </div>
          
          <div className="animate-slide-up delay-600">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-10 border border-white/20 shadow-lg h-72 flex flex-col justify-center items-center hover:shadow-xl transition-shadow duration-300">
              <Clock className="w-16 h-16 text-purple-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Smart Scheduling
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Find optimal meeting times
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero 
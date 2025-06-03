import React from 'react'
import { useTranslation } from 'next-i18next'
import { Brain, Shield, Globe, Download } from 'lucide-react'

const Features: React.FC = () => {
  const { t } = useTranslation('common')

  const features = [
    {
      icon: Brain,
      title: t('features.smart.title'),
      description: t('features.smart.description'),
      color: 'text-blue-600'
    },
    {
      icon: Shield,
      title: t('features.privacy.title'),
      description: t('features.privacy.description'),
      color: 'text-green-600'
    },
    {
      icon: Globe,
      title: t('features.formats.title'),
      description: t('features.formats.description'),
      color: 'text-purple-600'
    },
    {
      icon: Download,
      title: t('features.export.title'),
      description: t('features.export.description'),
      color: 'text-orange-600'
    }
  ]

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-80 flex flex-col justify-between">
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gray-50 mb-8 group-hover:bg-gray-100 transition-colors ${feature.color} mx-auto`}>
                    <feature.icon className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-center flex-1 flex items-center justify-center min-h-[4.5rem]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Notice */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-10 text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            100% Privacy Guaranteed
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Your calendar data is processed entirely in your browser. No data is sent to our servers, 
            ensuring complete privacy and security of your personal information.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Features 
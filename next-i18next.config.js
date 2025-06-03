module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de'],
    fallbackLng: 'en',
    debug: false,
    reloadOnPrerender: process.env.NODE_ENV === 'development',
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
  ns: ['common'],
  defaultNS: 'common',
} 
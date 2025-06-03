import React from 'react'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import dynamic from 'next/dynamic'

import Header from '../src/components/Header'
import Hero from '../src/components/Hero'
import Features from '../src/components/Features'
import Footer from '../src/components/Footer'

// Dynamic import to avoid SSR issues with file upload
const CalendarAnalyzer = dynamic(() => import('../src/components/CalendarAnalyzer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>
})

export default function Home() {
  const { t } = useTranslation('common')

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <meta name="keywords" content={t('meta.keywords')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.title')} />
        <meta name="twitter:description" content={t('meta.description')} />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://your-domain.com" />
        <meta name="robots" content="index,follow" />
        <meta name="author" content="Free Time Analyzer" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: t('meta.title'),
              description: t('meta.description'),
              url: 'https://your-domain.com',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main>
          <Hero />
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <CalendarAnalyzer />
            </div>
          </section>
          <Features />
        </main>
        <Footer />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
} 
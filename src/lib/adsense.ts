export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

// AdSense 스크립트가 로드되었는지 확인
export const isAdSenseLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).adsbygoogle
}

// AdSense 광고 초기화
export const initializeAdSense = () => {
  if (typeof window !== 'undefined' && ADSENSE_CLIENT_ID) {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense initialization error:', error)
    }
  }
}

// 광고 새로고침 (SPA에서 페이지 전환 시 사용)
export const refreshAds = () => {
  if (isAdSenseLoaded()) {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense refresh error:', error)
    }
  }
} 
import { useEffect } from 'react'
import * as adsense from '../../lib/adsense'

interface AdBannerProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
  responsive?: boolean
}

const AdBanner: React.FC<AdBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  responsive = true
}) => {
  useEffect(() => {
    if (adsense.ADSENSE_CLIENT_ID && adsense.isAdSenseLoaded()) {
      try {
        adsense.initializeAdSense()
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  // AdSense가 비활성화된 경우 렌더링하지 않음
  if (!adsense.ADSENSE_CLIENT_ID) {
    return null
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          textAlign: 'center',
          ...style
        }}
        data-ad-client={adsense.ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

export default AdBanner 
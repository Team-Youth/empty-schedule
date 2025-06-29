import React, { useState, useCallback } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { Upload, Calendar, Clock, Settings, Download, Sun, Moon, Coffee, Sparkles } from 'lucide-react'
import { ICSAnalyzer } from '../lib/icsAnalyzer'
import { CalendarEvent, FreeSlot, AnalysisSettings } from '../types/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import * as gtag from '../lib/gtag'

const CalendarAnalyzer: React.FC = () => {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { locale = 'en' } = router
  
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isHourlyView, setIsHourlyView] = useState(true)
  const [settings, setSettings] = useState<AnalysisSettings>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    workStart: '09:00',
    workEnd: '18:00',
    includeWeekends: false,
    minDuration: 30,
    maxGap: 480
  })

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const content = await file.text()
      const analyzer = new ICSAnalyzer()
      const parsedEvents = analyzer.parseICS(content)
      setEvents(parsedEvents)
      
      // Google Analytics 이벤트 추적
      gtag.event({
        action: 'file_upload',
        category: 'calendar_analyzer',
        label: 'ics_file_uploaded',
        value: parsedEvents.length
      })
    } catch (error) {
      console.error('Error parsing ICS file:', error)
      alert(t('common.error'))
      
      // 에러 이벤트 추적
      gtag.event({
        action: 'file_upload_error',
        category: 'calendar_analyzer',
        label: 'ics_parsing_failed'
      })
    }
  }, [t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const icsFile = files.find(file => file.name.endsWith('.ics'))
    
    if (icsFile) {
      handleFileUpload(icsFile)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const analyzeSchedule = useCallback(async () => {
    if (events.length === 0) return
    
    setIsAnalyzing(true)
    
    try {
      const analyzer = new ICSAnalyzer()
      const startDate = new Date(settings.startDate)
      const endDate = new Date(settings.endDate)
      
      const slots = analyzer.findFreeSlots(
        events,
        startDate,
        endDate,
        settings.workStart,
        settings.workEnd,
        settings.includeWeekends,
        settings.minDuration
      )
      
      setFreeSlots(slots)
      
      // Google Analytics 이벤트 추적
      gtag.event({
        action: 'schedule_analysis',
        category: 'calendar_analyzer',
        label: 'free_slots_analyzed',
        value: slots.length
      })
    } catch (error) {
      console.error('Error analyzing schedule:', error)
      alert(t('common.error'))
      
      // 에러 이벤트 추적
      gtag.event({
        action: 'analysis_error',
        category: 'calendar_analyzer',
        label: 'schedule_analysis_failed'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [events, settings, t])

  const exportFreeSlots = useCallback(() => {
    const analyzer = new ICSAnalyzer()
    const icsContent = analyzer.exportFreeSlots(freeSlots)
    
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'free-time-slots.ics'
    a.click()
    URL.revokeObjectURL(url)
    
    // Google Analytics 이벤트 추적
    gtag.event({
      action: 'export_calendar',
      category: 'calendar_analyzer',
      label: 'free_slots_exported',
      value: freeSlots.length
    })
  }, [freeSlots])

  // 연속된 시간 슬롯을 병합하는 함수
  const mergeConsecutiveSlots = useCallback((slots: FreeSlot[]): FreeSlot[] => {
    if (slots.length <= 1) return slots
    
    const sortedSlots = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime())
    const merged: FreeSlot[] = []
    let currentSlot = { ...sortedSlots[0] }
    
    for (let i = 1; i < sortedSlots.length; i++) {
      const nextSlot = sortedSlots[i]
      
      // 현재 슬롯의 끝 시간과 다음 슬롯의 시작 시간이 연속되는지 확인
      if (currentSlot.end.getTime() === nextSlot.start.getTime()) {
        // 병합: 끝 시간을 다음 슬롯의 끝 시간으로 업데이트
        currentSlot = {
          ...currentSlot,
          end: nextSlot.end,
          duration: currentSlot.duration + nextSlot.duration
        }
      } else {
        // 연속되지 않으면 현재 슬롯을 결과에 추가하고 새로운 슬롯 시작
        merged.push(currentSlot)
        currentSlot = { ...nextSlot }
      }
    }
    
    // 마지막 슬롯 추가
    merged.push(currentSlot)
    return merged
  }, [])

  // 날짜별로 그룹화하고 토글 상태에 따라 병합 여부 결정
  const groupSlotsByDate = useCallback((slots: FreeSlot[]) => {
    const grouped: { [key: string]: FreeSlot[] } = {}
    
    slots.forEach(slot => {
      const dateKey = slot.start.toLocaleDateString('en-CA') // YYYY-MM-DD format
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })
    
    // 토글 상태에 따라 각 날짜의 슬롯들을 병합할지 결정
    if (!isHourlyView) {
      Object.keys(grouped).forEach(dateKey => {
        grouped[dateKey] = mergeConsecutiveSlots(grouped[dateKey])
      })
    }
    
    return grouped
  }, [isHourlyView, mergeConsecutiveSlots])

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }, [])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    
    // locale에 따른 날짜 형식 설정
    const localeMap: { [key: string]: string } = {
      'ko': 'ko-KR',
      'en': 'en-US',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE'
    }
    
    const browserLocale = localeMap[locale] || 'en-US'
    
    // 기본 날짜 포맷 (년, 월, 일)
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }
    
    const formattedDate = date.toLocaleDateString(browserLocale, dateOptions)
    const dayName = t(`results.dayNames.${dayOfWeek}`)
    
    // 언어별 날짜 포맷 조합
    if (locale === 'ko') {
      return `${formattedDate} ${dayName}`
    } else if (locale === 'ja') {
      return `${formattedDate} ${dayName}`
    } else if (locale === 'zh') {
      return `${formattedDate} ${dayName}`
    } else {
      return `${dayName}, ${formattedDate}`
    }
  }, [t, locale])

  // 시간 표시 포맷팅 함수
  const formatTimeDisplay = useCallback((hours: number, minutes: number) => {
    if (hours > 0 && minutes > 0) {
      return t('results.timeDisplay.hoursAndMinutes', { hours, minutes })
    } else if (hours > 0) {
      return t('results.timeDisplay.hoursOnly', { hours })
    } else if (minutes > 0) {
      return t('results.timeDisplay.minutesOnly', { minutes })
    }
    return ''
  }, [t])

  // Get time period icon and colors
  const getTimeSlotStyle = useCallback((slot: FreeSlot) => {
    const hour = slot.start.getHours()
    const duration = Math.floor(slot.duration / 60)
    
    if (hour >= 6 && hour < 12) {
      return {
        icon: Sun,
        bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-100',
        borderColor: 'border-l-amber-400',
        iconColor: 'text-amber-600',
        badgeColor: duration >= 1 ? 'bg-amber-500' : 'bg-amber-200 text-amber-800'
      }
    } else if (hour >= 12 && hour < 18) {
      return {
        icon: Coffee,
        bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
        borderColor: 'border-l-blue-400',
        iconColor: 'text-blue-600',
        badgeColor: duration >= 1 ? 'bg-blue-500' : 'bg-blue-200 text-blue-800'
      }
    } else if (hour >= 18 && hour < 22) {
      return {
        icon: Sparkles,
        bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-100',
        borderColor: 'border-l-purple-400',
        iconColor: 'text-purple-600',
        badgeColor: duration >= 1 ? 'bg-purple-500' : 'bg-purple-200 text-purple-800'
      }
    } else {
      return {
        icon: Moon,
        bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-100',
        borderColor: 'border-l-slate-400',
        iconColor: 'text-slate-600',
        badgeColor: duration >= 1 ? 'bg-slate-500' : 'bg-slate-200 text-slate-800'
      }
    }
  }, [])

  const totalFreeTime = freeSlots.reduce((sum, slot) => sum + slot.duration, 0)
  const totalHours = Math.floor(totalFreeTime / 60)
  const totalMinutes = totalFreeTime % 60
  const groupedSlots = groupSlotsByDate(freeSlots)

  return (
    <div id="analyzer" className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            {t('upload.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : events.length > 0
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {events.length > 0 ? (
              <div className="space-y-4">
                <Calendar className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-green-800">
                    {t('upload.loaded', { count: events.length })}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {t('upload.formats')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    {t('upload.dragDrop')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('upload.formats')}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".ics"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {t('upload.button')}
                  </label>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              {t('settings.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">{t('settings.dateRange')}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('settings.startDate')}</label>
                    <input
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('settings.endDate')}</label>
                    <input
                      type="date"
                      value={settings.endDate}
                      onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">{t('settings.workHours')}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('settings.workStart')}</label>
                    <input
                      type="time"
                      value={settings.workStart}
                      onChange={(e) => setSettings(prev => ({ ...prev, workStart: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      lang={locale === 'ko' ? 'en' : locale}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('settings.workEnd')}</label>
                    <input
                      type="time"
                      value={settings.workEnd}
                      onChange={(e) => setSettings(prev => ({ ...prev, workEnd: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      lang={locale === 'ko' ? 'en' : locale}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-700 mb-4">{t('settings.options')}</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeWeekends"
                  checked={settings.includeWeekends}
                  onChange={(e) => setSettings(prev => ({ ...prev, includeWeekends: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="includeWeekends" className="text-sm font-medium">
                  {t('settings.includeWeekends')}
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={analyzeSchedule}
                disabled={isAnalyzing}
                size="lg"
                className="px-8"
              >
                {isAnalyzing ? t('analyze.processing') : t('analyze.button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {Object.keys(groupedSlots).length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('results.title')}
              </CardTitle>
              
              <div className="flex items-center gap-3">
                {/* 시간 슬롯 표시 토글 버튼 */}
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-1">
                  <Button
                    variant={isHourlyView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsHourlyView(true)}
                    className="h-8 px-3 text-xs font-medium"
                    title={t('results.viewMode.tooltip')}
                  >
                    {t('results.viewMode.hourly')}
                  </Button>
                  <Button
                    variant={!isHourlyView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsHourlyView(false)}
                    className="h-8 px-3 text-xs font-medium"
                    title={t('results.viewMode.tooltip')}
                  >
                    {t('results.viewMode.merged')}
                  </Button>
                </div>
                
                <Button
                  onClick={exportFreeSlots}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/50 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  Export ICS
                </Button>
              </div>
            </div>
            <CardDescription>
              {t('results.summaryText', { 
                days: Object.keys(groupedSlots).length, 
                slots: freeSlots.length 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 mb-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 mb-1">{t('results.totalFreeTime')}</p>
                    <p className="text-3xl font-bold">
                      {formatTimeDisplay(totalHours, totalMinutes)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">{t('results.slotsCount', { count: freeSlots.length })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {Object.entries(groupedSlots)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, slots]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <h4 className="text-xl font-bold text-gray-800">
                      {formatDate(date)}
                    </h4>
                    <Badge variant="outline" className="bg-gray-100">
                      {t('results.slotsCount', { count: slots.length })}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.map((slot, index) => {
                      const duration = Math.floor(slot.duration / 60)
                      const minutes = slot.duration % 60
                      const style = getTimeSlotStyle(slot)
                      const IconComponent = style.icon
                      
                      return (
                        <div 
                          key={index} 
                          className={`group relative overflow-hidden rounded-xl border-2 border-l-4 ${style.borderColor} ${style.bgGradient} transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                        >
                          <div className="absolute inset-0 bg-white/60 group-hover:bg-white/40 transition-all duration-300"></div>
                          <div className="relative p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/80 ${style.iconColor}`}>
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-lg">
                                    {formatTime(slot.start)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatTime(slot.end)} {t('results.until')}
                                  </p>
                                </div>
                              </div>
                              
                              <Badge 
                                className={`${style.badgeColor} text-white font-semibold shadow-lg`}
                              >
                                {duration >= 1 ? 
                                  (duration >= 2 ? `${duration}${t('results.hours')}` : t('results.oneHourPlus')) 
                                  : t('results.thirtyMinutes')
                                }
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTimeDisplay(duration, minutes)}
                              </span>
                            </div>
                            
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CalendarAnalyzer 
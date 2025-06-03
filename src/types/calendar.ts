export interface CalendarEvent {
  dtstart: Date
  dtend: Date
  summary?: string
  location?: string
  description?: string
  uid?: string
}

export interface FreeSlot {
  start: Date
  end: Date
  duration: number // in minutes
}

export interface AnalysisSettings {
  startDate: string
  endDate: string
  workStart: string
  workEnd: string
  includeWeekends: boolean
  minDuration: number
  maxGap: number
}

export interface ParsedICSData {
  events: CalendarEvent[]
  timezone?: string
}

export interface TimeSlot {
  start: Date
  end: Date
  type: 'busy' | 'free'
  event?: CalendarEvent
} 
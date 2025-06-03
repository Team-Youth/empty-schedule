import { CalendarEvent, FreeSlot } from '../types/calendar'

export class ICSAnalyzer {
  parseICS(icsContent: string): CalendarEvent[] {
    const events: CalendarEvent[] = []
    const lines = icsContent.split('\n')
    let currentEvent: Partial<CalendarEvent> | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {}
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.dtstart && currentEvent.dtend) {
          events.push(currentEvent as CalendarEvent)
        }
        currentEvent = null
      } else if (currentEvent) {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':')
        
        if (key.startsWith('DTSTART')) {
          currentEvent.dtstart = this.parseDateTime(value)
        } else if (key.startsWith('DTEND')) {
          currentEvent.dtend = this.parseDateTime(value)
        } else if (key === 'SUMMARY') {
          currentEvent.summary = value
        } else if (key === 'LOCATION') {
          currentEvent.location = value
        } else if (key === 'DESCRIPTION') {
          currentEvent.description = value
        } else if (key === 'UID') {
          currentEvent.uid = value
        }
      }
    }

    return events
  }

  private parseDateTime(dateTimeStr: string): Date {
    // Handle YYYYMMDDTHHMMSS format
    if (dateTimeStr.length >= 15) {
      const year = parseInt(dateTimeStr.substr(0, 4))
      const month = parseInt(dateTimeStr.substr(4, 2)) - 1 // Month is 0-based
      const day = parseInt(dateTimeStr.substr(6, 2))
      const hour = parseInt(dateTimeStr.substr(9, 2))
      const minute = parseInt(dateTimeStr.substr(11, 2))
      const second = parseInt(dateTimeStr.substr(13, 2))
      
      return new Date(year, month, day, hour, minute, second)
    }
    return new Date(dateTimeStr)
  }

  findFreeSlots(
    events: CalendarEvent[],
    startDate: Date,
    endDate: Date,
    workStart: string,
    workEnd: string,
    includeWeekends: boolean = false,
    minDuration: number = 30
  ): FreeSlot[] {
    const freeSlots: FreeSlot[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      // Skip weekends if not included
      if (!includeWeekends && (current.getDay() === 0 || current.getDay() === 6)) {
        current.setDate(current.getDate() + 1)
        continue
      }

      const dayFreeSlots = this.findDayFreeSlots(
        current,
        events,
        workStart,
        workEnd,
        minDuration
      )
      freeSlots.push(...dayFreeSlots)
      current.setDate(current.getDate() + 1)
    }

    return freeSlots
  }

  private findDayFreeSlots(
    date: Date,
    events: CalendarEvent[],
    workStart: string,
    workEnd: string,
    minDuration: number
  ): FreeSlot[] {
    const [startHour, startMinute] = workStart.split(':').map(Number)
    const [endHour, endMinute] = workEnd.split(':').map(Number)
    
    const dayStart = new Date(date)
    dayStart.setHours(startHour, startMinute, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(endHour, endMinute, 0, 0)

    // Find events for this day
    const dayEvents = events
      .filter(event => {
        const eventStart = new Date(event.dtstart)
        const eventEnd = new Date(event.dtend)
        return (
          eventStart.toDateString() === date.toDateString() ||
          eventEnd.toDateString() === date.toDateString() ||
          (eventStart <= dayStart && eventEnd >= dayEnd)
        )
      })
      .sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime())

    const freeSlots: FreeSlot[] = []
    let currentTime = new Date(dayStart)

    for (const event of dayEvents) {
      const eventStart = new Date(event.dtstart)
      const eventEnd = new Date(event.dtend)
      
      // Check for free time before this event
      if (currentTime < eventStart && eventStart > dayStart) {
        const slotStart = new Date(Math.max(currentTime.getTime(), dayStart.getTime()))
        const slotEnd = new Date(Math.min(eventStart.getTime(), dayEnd.getTime()))
        
        if (slotEnd.getTime() > slotStart.getTime()) {
          const duration = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60)
          if (duration >= minDuration) {
            // Break into 1-hour slots
            const hourlySlots = this.breakIntoHourlySlots(slotStart, slotEnd)
            freeSlots.push(...hourlySlots)
          }
        }
      }
      
      currentTime = new Date(Math.max(currentTime.getTime(), eventEnd.getTime()))
    }

    // Check for free time after the last event
    if (currentTime < dayEnd) {
      const duration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60)
      if (duration >= minDuration) {
        // Break into 1-hour slots
        const hourlySlots = this.breakIntoHourlySlots(currentTime, dayEnd)
        freeSlots.push(...hourlySlots)
      }
    }

    return freeSlots
  }

  // New method to break free time into 1-hour slots
  private breakIntoHourlySlots(start: Date, end: Date): FreeSlot[] {
    const slots: FreeSlot[] = []
    const current = new Date(start)
    
    while (current < end) {
      const slotEnd = new Date(current)
      slotEnd.setHours(slotEnd.getHours() + 1)
      
      // If this would go past the end time, adjust to end time
      if (slotEnd > end) {
        slotEnd.setTime(end.getTime())
      }
      
      const duration = (slotEnd.getTime() - current.getTime()) / (1000 * 60)
      
      // Only add slots that are at least 30 minutes
      if (duration >= 30) {
        slots.push({
          start: new Date(current),
          end: new Date(slotEnd),
          duration
        })
      }
      
      current.setHours(current.getHours() + 1)
    }
    
    return slots
  }

  exportFreeSlots(freeSlots: FreeSlot[]): string {
    let ics = 'BEGIN:VCALENDAR\r\n'
    ics += 'VERSION:2.0\r\n'
    ics += 'PRODID:-//Free Time Analyzer//EN\r\n'
    ics += 'CALSCALE:GREGORIAN\r\n'
    ics += 'METHOD:PUBLISH\r\n'

    freeSlots.forEach((slot, index) => {
      ics += 'BEGIN:VEVENT\r\n'
      ics += `UID:free-slot-${index}-${Date.now()}@freetimeanalyzer.com\r\n`
      ics += `DTSTART:${this.formatDateTime(slot.start)}\r\n`
      ics += `DTEND:${this.formatDateTime(slot.end)}\r\n`
      ics += `SUMMARY:Free Time Slot (${Math.floor(slot.duration / 60)}h ${slot.duration % 60}m)\r\n`
      ics += `DESCRIPTION:Available time slot found by Free Time Analyzer\r\n`
      ics += `CREATED:${this.formatDateTime(new Date())}\r\n`
      ics += `LAST-MODIFIED:${this.formatDateTime(new Date())}\r\n`
      ics += 'END:VEVENT\r\n'
    })

    ics += 'END:VCALENDAR\r\n'
    return ics
  }

  private formatDateTime(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart ? String(date.getMonth() + 1).padStart(2, '0') : ('0' + (date.getMonth() + 1)).slice(-2)
    const day = String(date.getDate()).padStart ? String(date.getDate()).padStart(2, '0') : ('0' + date.getDate()).slice(-2)
    const hour = String(date.getHours()).padStart ? String(date.getHours()).padStart(2, '0') : ('0' + date.getHours()).slice(-2)
    const minute = String(date.getMinutes()).padStart ? String(date.getMinutes()).padStart(2, '0') : ('0' + date.getMinutes()).slice(-2)
    const second = String(date.getSeconds()).padStart ? String(date.getSeconds()).padStart(2, '0') : ('0' + date.getSeconds()).slice(-2)
    
    return `${year}${month}${day}T${hour}${minute}${second}`
  }
} 
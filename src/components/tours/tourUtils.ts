export type TourType =
  | 'In-person Guided Tour'
  | '4K Drone & Video Walkthrough'
  | 'Open House Visit'
  | 'Land Boundary & Soil Survey'

export type ScheduledTour = {
  id: string
  propertyId: string
  propertyTitle: string
  propertyCity: string
  propertyCounty: string
  propertyPrice: number
  propertyAcres: number
  propertyImage: string
  date: string // YYYY-MM-DD
  time: string // e.g. "10:00 AM"
  type: TourType
  agentName: string
  agentPhone: string
  agentEmail: string
  notes?: string
  status: 'confirmed' | 'rescheduled' | 'cancelled'
  createdAt: string
}

export function formatTourStartTime(time: string): string {
  if (!time) return ''
  // Strip any ending time (e.g. "10:00 AM – 11:30 AM" or "10:00 AM - 11:30 AM" -> "10:00 AM")
  const parts = time.split(/–|-/)
  return parts[0].trim()
}

export function getTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTomorrowDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getNextSaturdayDateString(): string {
  const d = new Date()
  const dayOfWeek = d.getDay()
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilSaturday)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isDateToday(dateString: string): boolean {
  return dateString === getTodayDateString()
}

export function formatTourDate(dateString: string): string {
  try {
    const today = getTodayDateString()
    const tomorrow = getTomorrowDateString()
    const [y, m, d] = dateString.split('-').map(Number)
    const tourDate = new Date(y, m - 1, d)

    if (dateString === today) {
      return `Today · ${tourDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    if (dateString === tomorrow) {
      return `Tomorrow · ${tourDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    return tourDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const defaultScheduledTours: ScheduledTour[] = [
  {
    id: 'tour-sample-today-1',
    propertyId: 'pearce-homestead',
    propertyTitle: 'Desert Homestead with Mountain Views',
    propertyCity: 'Pearce',
    propertyCounty: 'Cochise',
    propertyPrice: 95000,
    propertyAcres: 20.1,
    propertyImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=85',
    date: getTodayDateString(),
    time: '10:00 AM',
    type: 'In-person Guided Tour',
    agentName: 'Rick Frank, Designated Broker',
    agentPhone: '(520) 403-3903',
    agentEmail: 'rick@arizonalifehomes.com',
    notes: 'Guided tour of 20.1-acre homestead parcel. Review boundary pins, high-volume water well test, and Dragoon Mountain panoramic building site.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
]

export function getGoogleCalendarUrl(tour: ScheduledTour): string {
  const [y, m, d] = tour.date.split('-').map(Number)
  const startTimeMatch = tour.time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let startHour = 10
  let startMin = 0
  if (startTimeMatch) {
    let hour = parseInt(startTimeMatch[1], 10)
    const min = parseInt(startTimeMatch[2], 10)
    const meridiem = startTimeMatch[3].toUpperCase()
    if (meridiem === 'PM' && hour < 12) hour += 12
    if (meridiem === 'AM' && hour === 12) hour = 0
    startHour = hour
    startMin = min
  }
  const startDate = new Date(y, m - 1, d, startHour, startMin)
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000)

  const fmt = (dt: Date) => dt.toISOString().replace(/-|:|\.\d+/g, '')
  const dates = `${fmt(startDate)}/${fmt(endDate)}`
  const text = encodeURIComponent(`Arizona Life Tour: ${tour.propertyTitle}`)
  const details = encodeURIComponent(
    `Property Tour: ${tour.propertyTitle}\nType: ${tour.type}\nBroker: ${tour.agentName} (${tour.agentPhone})\nLocation: ${tour.propertyCity}, ${tour.propertyCounty} County, AZ\nNotes: ${tour.notes || ''}`
  )
  const location = encodeURIComponent(`${tour.propertyCity}, ${tour.propertyCounty} County, AZ`)

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`
}

export function downloadIcsFile(tour: ScheduledTour) {
  const [y, m, d] = tour.date.split('-').map(Number)
  const startDate = new Date(y, m - 1, d, 10, 0)
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000)
  const fmt = (dt: Date) => dt.toISOString().replace(/-|:|\.\d+/g, '')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Arizona Life Homes & Land//Tour Schedule//EN',
    'BEGIN:VEVENT',
    `UID:tour-${tour.id}@arizonalifehomes.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(startDate)}`,
    `DTEND:${fmt(endDate)}`,
    `SUMMARY:Arizona Life Tour: ${tour.propertyTitle}`,
    `DESCRIPTION:${tour.type} with ${tour.agentName}. Phone: ${tour.agentPhone}. Notes: ${tour.notes || ''}`,
    `LOCATION:${tour.propertyCity}, ${tour.propertyCounty} County, AZ`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `tour-${tour.propertyId || 'schedule'}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


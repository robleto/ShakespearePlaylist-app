export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  // If same day, show just one date
  if (start.toDateString() === end.toDateString()) {
    return formatDate(start)
  }
  
  // If same month and year, optimize display
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${end.getDate()}, ${end.getFullYear()}`
  }
  
  // Different months or years
  return `${formatDate(start)} – ${formatDate(end)}`
}

export function isUpcoming(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d > new Date()
}

export function isOngoing(startDate: Date | string, endDate: Date | string): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const now = new Date()
  
  return start <= now && end >= now
}

export function parseRelativeDate(input: string): Date | null {
  const today = new Date()
  const normalizedInput = input.toLowerCase().trim()
  
  if (normalizedInput === 'today') {
    return today
  }
  
  if (normalizedInput === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }
  
  if (normalizedInput === 'this week') {
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
    return endOfWeek
  }
  
  if (normalizedInput === 'this month') {
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return endOfMonth
  }
  
  if (normalizedInput === 'this year') {
    const endOfYear = new Date(today.getFullYear(), 11, 31)
    return endOfYear
  }
  
  // Try to parse as a regular date
  try {
    const parsed = new Date(input)
    return isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

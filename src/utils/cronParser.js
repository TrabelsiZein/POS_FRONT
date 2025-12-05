/**
 * Utility to convert CRON expressions to human-readable descriptions
 */

export function cronToHumanReadable(cronExpression) {
  if (!cronExpression || !cronExpression.trim()) {
    return 'Invalid CRON expression'
  }

  const parts = cronExpression.trim().split(/\s+/)
  if (parts.length < 5) {
    return 'Invalid CRON expression'
  }

  // Handle 5-field (minute hour day month weekday) or 6-field (second minute hour day month weekday)
  const is6Field = parts.length === 6
  const second = is6Field ? parseField(parts[0], 0, 59) : -1
  const minute = parts[is6Field ? 1 : 0]
  const hour = parts[is6Field ? 2 : 1]
  const day = parts[is6Field ? 3 : 2]
  const month = parts[is6Field ? 4 : 3]
  const weekday = parts[is6Field ? 5 : 4]

  // Every second
  if (second === 0 && minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
    return 'Every second'
  }

  // Every minute
  if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
    return 'Every minute'
  }

  // Every N minutes
  if (minute.startsWith('*/') && hour === '*' && day === '*' && month === '*' && weekday === '*') {
    const interval = parseInt(minute.substring(2), 10)
    if (!isNaN(interval)) {
      if (interval === 1) {
        return 'Every minute'
      }
      return `Every ${interval} minutes`
    }
  }

  // Every hour
  if (minute === '0' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
    return 'Every hour at minute 0'
  }

  // Every N hours
  if (hour.startsWith('*/') && day === '*' && month === '*' && weekday === '*') {
    const interval = parseInt(hour.substring(2), 10)
    if (!isNaN(interval)) {
      const minuteStr = minute === '0' ? '' : ` at minute ${minute}`
      return `Every ${interval} hours${minuteStr}`
    }
  }

  // Daily at specific time
  if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
    const h = parseField(hour, 0, 23)
    const m = parseField(minute, 0, 59)
    if (h !== -1 && m !== -1) {
      return `Daily at ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }

  // Weekly on specific day
  if (weekday !== '*' && day === '*' && month === '*') {
    const dayName = getWeekdayName(weekday)
    if (dayName) {
      const h = parseField(hour, 0, 23)
      const m = parseField(minute, 0, 59)
      if (h !== -1 && m !== -1) {
        return `Every ${dayName} at ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
      return `Every ${dayName}`
    }
  }

  // Monthly on specific day
  if (day !== '*' && month === '*' && weekday === '*') {
    const dayNum = parseField(day, 1, 31)
    if (dayNum !== -1) {
      const h = parseField(hour, 0, 23)
      const m = parseField(minute, 0, 59)
      if (h !== -1 && m !== -1) {
        return `Monthly on day ${dayNum} at ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
      return `Monthly on day ${dayNum}`
    }
  }

  // Complex expression - return simplified version
  return `Custom schedule (${cronExpression})`
}

function parseField(field, min, max) {
  if (!field || field === '*') {
    return -1
  }
  const value = parseInt(field, 10)
  if (!isNaN(value) && value >= min && value <= max) {
    return value
  }
  return -1
}

function getWeekdayName(weekday) {
  const day = parseInt(weekday, 10)
  if (isNaN(day)) {
    return null
  }
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  if (day === 0 || day === 7) {
    return days[0]
  }
  if (day >= 1 && day <= 6) {
    return days[day]
  }
  return null
}

export function isValidCronExpression(cronExpression) {
  if (!cronExpression || !cronExpression.trim()) {
    return false
  }
  const parts = cronExpression.trim().split(/\s+/)
  return parts.length >= 5 && parts.length <= 6
}


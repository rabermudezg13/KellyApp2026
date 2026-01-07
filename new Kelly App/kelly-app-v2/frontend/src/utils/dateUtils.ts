/**
 * Date utility functions for Miami timezone (America/New_York)
 * Miami uses Eastern Time (ET) - UTC-5 (EST) or UTC-4 (EDT)
 */

/**
 * Format a date string to Miami local time
 * @param dateString ISO date string from backend (UTC)
 * @returns Formatted date string in Miami timezone
 */
export const formatMiamiTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  
  try {
    // Parse the date string - backend sends ISO format (UTC)
    // Python's .isoformat() returns format like "2026-01-07T21:03:47.123456" (no Z)
    // JavaScript's Date() interprets strings without timezone as LOCAL time, not UTC!
    // We MUST add 'Z' to force UTC interpretation, then convert to Miami time
    
    let dateStr = dateString.trim()
    
    // Always ensure we have UTC indicator for proper parsing
    if (dateStr.includes('T')) {
      // ISO format: "2026-01-07T21:03:47" or "2026-01-07T21:03:47.123456"
      // Check if it already has timezone info
      const hasTimezone = dateStr.endsWith('Z') || 
                         dateStr.match(/[+-]\d{2}:\d{2}$/) || 
                         dateStr.match(/[+-]\d{4}$/)
      
      if (!hasTimezone) {
        // No timezone - remove microseconds and add 'Z' for UTC
        if (dateStr.includes('.')) {
          // Has microseconds: "2026-01-07T21:03:47.123456"
          const parts = dateStr.split('.')
          dateStr = parts[0] + 'Z'  // Keep only seconds, add Z for UTC
        } else {
          // No microseconds: "2026-01-07T21:03:47"
          dateStr = dateStr + 'Z'  // Add Z for UTC
        }
      }
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      // SQLite format: "2026-01-07 21:03:47" -> convert to ISO UTC
      dateStr = dateStr.replace(' ', 'T') + 'Z'
    }
    
    // Parse as UTC date (the 'Z' ensures UTC interpretation)
    const date = new Date(dateStr)
    
    // Verify the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString, 'Parsed as:', dateStr)
      return 'Invalid Date'
    }
    
    // Convert to Miami timezone (America/New_York = Eastern Time)
    // EST is UTC-5, EDT is UTC-4 (daylight saving)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    
    return formatter.format(date)
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString)
    return 'Invalid Date'
  }
}

/**
 * Format a date string to Miami local date only (no time)
 * @param dateString ISO date string from backend (UTC)
 * @returns Formatted date string in Miami timezone
 */
export const formatMiamiDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    // Format in Miami timezone (America/New_York)
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Format a date string to Miami local time only (no date)
 * @param dateString ISO date string from backend (UTC)
 * @returns Formatted time string in Miami timezone
 */
export const formatMiamiTimeOnly = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    // Format in Miami timezone (America/New_York)
    return date.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'Invalid Time'
  }
}

/**
 * Get the date part (without time) in Miami timezone
 * @param dateString ISO date string from backend (UTC)
 * @returns Date string in format YYYY-MM-DD for grouping
 */
export const getMiamiDateKey = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  
  try {
    let dateStr = dateString.trim()
    
    // Handle different date formats from backend
    if (dateStr.includes('T')) {
      if (dateStr.includes('.')) {
        const parts = dateStr.split('.')
        dateStr = parts[0] + 'Z'
      } else if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
        dateStr = dateStr + 'Z'
      }
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      dateStr = dateStr.replace(' ', 'T') + 'Z'
    }
    
    const date = new Date(dateStr)
    
    if (isNaN(date.getTime())) {
      return ''
    }
    
    // Get date in Miami timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const parts = formatter.formatToParts(date)
    const year = parts.find(p => p.type === 'year')?.value || ''
    const month = parts.find(p => p.type === 'month')?.value || ''
    const day = parts.find(p => p.type === 'day')?.value || ''
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error getting date key:', error)
    return ''
  }
}

/**
 * Format date for display in date separators
 * @param dateString ISO date string from backend (UTC)
 * @returns Formatted date string like "January 7, 2026"
 */
export const formatMiamiDateDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  
  try {
    let dateStr = dateString.trim()
    
    // Handle different date formats from backend
    if (dateStr.includes('T')) {
      if (dateStr.includes('.')) {
        const parts = dateStr.split('.')
        dateStr = parts[0] + 'Z'
      } else if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
        dateStr = dateStr + 'Z'
      }
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
      dateStr = dateStr.replace(' ', 'T') + 'Z'
    }
    
    const date = new Date(dateStr)
    
    if (isNaN(date.getTime())) {
      return ''
    }
    
    // Format date in Miami timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
    
    return formatter.format(date)
  } catch (error) {
    console.error('Error formatting date display:', error)
    return ''
  }
}


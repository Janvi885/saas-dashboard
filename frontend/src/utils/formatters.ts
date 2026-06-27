import { format, isValid, parseISO } from 'date-fns'

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatDate(dateString: string, formatStr = 'MMM d, yyyy'): string {
  const date = parseISO(dateString)

  if (!isValid(date)) {
    return dateString
  }

  return format(date, formatStr)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

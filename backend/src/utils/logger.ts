type LogLevel = 'info' | 'warn' | 'error'

export function log(
  level: LogLevel,
  message: string,
  meta?: object,
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }

  const output = JSON.stringify(entry)

  if (level === 'error') {
    console.error(output)
  } else if (level === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

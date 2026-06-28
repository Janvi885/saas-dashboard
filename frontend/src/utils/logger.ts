/** Dev-only client logger — avoids console noise in production builds. */
export function logClientError(message: string, ...details: unknown[]): void {
  if (import.meta.env.DEV) {
    console.error(message, ...details)
  }
}

/**
 * Returns a safe in-app path for post-login redirect.
 * Prevents open redirects to external URLs.
 */
export function getSafeRedirectPath(from: unknown): string {
  if (
    typeof from === 'object' &&
    from !== null &&
    'pathname' in from &&
    typeof (from as { pathname?: unknown }).pathname === 'string'
  ) {
    const pathname = (from as { pathname: string }).pathname

    if (
      pathname.startsWith('/') &&
      !pathname.startsWith('//') &&
      pathname !== '/login' &&
      pathname !== '/register'
    ) {
      return pathname
    }
  }

  return '/dashboard'
}

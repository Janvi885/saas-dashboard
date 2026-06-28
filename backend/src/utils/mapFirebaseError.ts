export type MappedFirebaseError = {
  message: string
  code: string
  statusCode: number
}

type FirebaseLikeError = {
  code?: string
  message?: string
}

function extractCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as FirebaseLikeError).code === 'string'
  ) {
    return (error as FirebaseLikeError).code
  }

  return undefined
}

export function mapFirebaseError(error: unknown): MappedFirebaseError {
  const firebaseCode = extractCode(error)

  switch (firebaseCode) {
    case 'auth/user-not-found':
      return {
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404,
      }
    case 'auth/id-token-expired':
      return {
        message: 'Session expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      }
    case 'auth/id-token-revoked':
      return {
        message: 'Session revoked. Please sign in again.',
        code: 'TOKEN_REVOKED',
        statusCode: 401,
      }
    case 'auth/invalid-id-token':
      return {
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
      }
    case 'not-found':
      return {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      }
    case 'permission-denied':
      return {
        message: 'Permission denied',
        code: 'PERMISSION_DENIED',
        statusCode: 403,
      }
    case 'already-exists':
      return {
        message: 'Resource already exists',
        code: 'ALREADY_EXISTS',
        statusCode: 409,
      }
    default:
      return {
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
        statusCode: 401,
      }
  }
}

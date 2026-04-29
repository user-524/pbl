export class ApiError extends Error {
  constructor({ status, code, message, details }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const STATUS_CODE_MAP = { 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 404: 'NOT_FOUND', 500: 'INTERNAL' }

export function normalizeError(error) {
  if (!error.response) {
    return new ApiError({ status: 0, code: 'NETWORK_ERROR', message: error.message, details: null })
  }
  const { status, data } = error.response
  const code = STATUS_CODE_MAP[status] ?? 'UNKNOWN'
  return new ApiError({ status, code, message: data?.message ?? error.message, details: data })
}

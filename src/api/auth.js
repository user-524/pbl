import client from './client.js'
import { ENDPOINTS } from './endpoints.js'
import { ApiError } from '../lib/errors.js'

/**
 * @param {{ username: string, password: string }} payload
 * @returns {Promise<{ success: boolean, access_token: string, username: string }>}
 */
export async function login(payload, { signal } = {}) {
  const data = await client.post(ENDPOINTS.auth.login, payload, { signal })
  if (!data.success) {
    throw new ApiError({ status: 200, code: 'BUSINESS_ERROR', message: data.message, details: data })
  }
  return data
}

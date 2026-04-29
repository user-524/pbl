import client from './client.js'
import { ENDPOINTS } from './endpoints.js'

/**
 * @returns {Promise<Array>}
 */
export async function getProblems({ signal } = {}) {
  return client.get(ENDPOINTS.problems.list, { signal })
}

/**
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getProblem(id, { signal } = {}) {
  return client.get(ENDPOINTS.problems.detail(id), { signal })
}

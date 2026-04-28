import client from './client.js'
import { ENDPOINTS } from './endpoints.js'

/**
 * @returns {Promise<Array>}
 */
export async function getReports({ signal } = {}) {
  return client.get(ENDPOINTS.reports.list, { signal })
}

/**
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getReport(id, { signal } = {}) {
  return client.get(ENDPOINTS.reports.detail(id), { signal })
}

/**
 * @param {{ submission_id: number|string }} body
 * @returns {Promise<object>}
 */
export async function generateReport(body, { signal } = {}) {
  return client.post(ENDPOINTS.reports.generate, body, { signal })
}

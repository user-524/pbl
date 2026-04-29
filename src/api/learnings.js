import client from './client.js'
import { ENDPOINTS } from './endpoints.js'

/**
 * @param {{
 *   anonymous_id: string,
 *   submission_id: number|string,
 *   report_id: number|string,
 *   problem_title: string,
 *   language: string,
 *   raw_code: string,
 *   total_score: number
 * }} body
 * @returns {Promise<{ success: boolean, learning_id: number, saved_at: string }>}
 */
export async function saveLearning(body, { signal } = {}) {
  return client.post(ENDPOINTS.learnings.save, body, { signal })
}

/**
 * @param {string} anonymousId
 * @returns {Promise<{ learnings: Array }>}
 */
export async function getLearnings(anonymousId, { signal } = {}) {
  return client.get(ENDPOINTS.learnings.list, {
    params: { anonymous_id: anonymousId },
    signal,
  })
}

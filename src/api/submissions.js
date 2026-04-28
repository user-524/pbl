import client from './client.js'
import { ENDPOINTS } from './endpoints.js'

/**
 * @param {{ language: string, raw_code: string, test_cases?: Array }} body
 * @returns {Promise<object>}
 */
export async function executeCode(body, { signal } = {}) {
  return client.post(ENDPOINTS.execute, body, { signal })
}

/**
 * @param {{ problem_title: string, problem_description: string, language: string, raw_code: string }} body
 * @returns {Promise<object>}
 */
export async function createSubmission(body, { signal } = {}) {
  return client.post(ENDPOINTS.submissions.create, body, { signal })
}

/**
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getSubmission(id, { signal } = {}) {
  return client.get(ENDPOINTS.submissions.detail(id), { signal })
}

/**
 * @param {number|string} id
 * @param {{ answers: Array<{ question_id: number, selected_number: number }> }} body
 * @returns {Promise<object>}
 */
export async function submitAnswers(id, body, { signal } = {}) {
  return client.post(ENDPOINTS.submissions.answers(id), body, { signal })
}

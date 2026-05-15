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

/**
 * username: 공백 불가, 서버에서 중복 검증
 * password: 영문+숫자 조합 권장, 최대 72자(영문) / 24자(한글) — bcrypt 72 bytes 제한
 *
 * @param {{ username: string, password: string }} payload
 * @returns {Promise<{ success: boolean, access_token: string, username: string }>}
 */
export async function register(payload, { signal } = {}) {
  const { username, password } = payload

  if (!username || /\s/.test(username)) {
    throw new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: '사용자 이름에 공백을 포함할 수 없습니다.' })
  }

  if (!password) {
    throw new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: '비밀번호를 입력해주세요.' })
  }

  // 한글 포함 여부에 따라 다른 길이 제한 적용 (bcrypt 72 bytes 한계)
  const hasKorean = /[가-힣ᄀ-ᇿ㄰-㆏]/.test(password)
  const maxLen = hasKorean ? 24 : 72
  if (password.length > maxLen) {
    throw new ApiError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: `비밀번호는 최대 ${maxLen}자까지 입력 가능합니다.`,
    })
  }

  const data = await client.post(ENDPOINTS.auth.register, { username, password }, { signal })
  if (!data.success) {
    throw new ApiError({ status: 200, code: 'BUSINESS_ERROR', message: data.message, details: data })
  }
  return data
}

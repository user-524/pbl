// src/api/services.js
import axiosInstance from './axiosInstance.js'

const getErrorMessage = (error) => {
  if (!error.response) {
    return '서버에 연결할 수 없습니다.'
  }
  const status = error.response.status
  if (status === 400) return '입력값을 확인해주세요.'
  if (status === 401) return '인증이 만료되었습니다. 다시 로그인해주세요.'
  if (status === 404) return '요청한 데이터를 찾을 수 없습니다.'
  if (status === 422) return '코드를 실행할 수 없습니다. 문법을 확인해주세요.'
  if (status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  return error.response.data?.message || '알 수 없는 오류가 발생했습니다.'
}

// 1. 로그인
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', { username, password })
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 2. 문제 목록 조회
export const getProblems = async () => {
  try {
    const response = await axiosInstance.get('/api/problems')
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 3. 문제 상세 조회
export const getProblemDetail = async (problemId) => {
  try {
    const response = await axiosInstance.get(`/api/problems/${problemId}`)
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 4. 코드 제출 및 분석
export const submitCode = async (problemId, language, rawCode) => {
  try {
    const response = await axiosInstance.post('/api/submissions', {
      problem_id: problemId,
      language,
      raw_code: rawCode,
    })
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 5. 제출 상세 조회 (새로고침/재진입 복원용)
export const getSubmissionDetail = async (submissionId) => {
  try {
    const response = await axiosInstance.get(`/api/submissions/${submissionId}`)
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 6. 학생 답변 제출 및 평가
export const submitAnswers = async (submissionId, answers) => {
  try {
    const response = await axiosInstance.post(
      `/api/submissions/${submissionId}/answers`,
      { answers }
    )
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 7. 종합 리포트 조회
export const getReport = async (reportId) => {
  try {
    const response = await axiosInstance.get(`/api/reports/${reportId}`)
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

// 8. 리포트 목록 조회 (마이페이지)
export const getReports = async () => {
  try {
    const response = await axiosInstance.get('/api/reports')
    return response.data
  } catch (error) {
    return { success: false, message: getErrorMessage(error) }
  }
}

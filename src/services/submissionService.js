import { submitCode, getSubmissionDetail } from '../api/services.js'

/**
 * 코드를 제출하고 분석 결과를 받는다.
 * 기존 draft 구조와의 호환을 위해 problem_id가 없으면 1을 사용한다.
 */
export const submitCodeForAnalysis = async (draft) => {
  return submitCode(
    draft.problem_id ?? 1,
    draft.language,
    draft.raw_code
  )
}

export const getSubmissionById = async (submissionId) => {
  return getSubmissionDetail(submissionId)
}

import { submitAnswers } from '../api/services.js'

/**
 * QA 답변을 제출하고 평가 결과(report_id)를 받는다.
 */
export const submitAnswersForEvaluation = async ({ submissionId, answers }) => {
  return submitAnswers(submissionId, answers)
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSubmission, executeCode, getSubmission, runCodeSandbox, submitAnswers } from '../api/submissions.js'
import { queryKeys } from '../api/queryKeys.js'
import useSubmissionStore from '../store/submissionStore.js'

/**
 * Mutation hook that runs code only (no AI question generation).
 * On success, stores codeExecutionResult in submissionStore.
 */
export function useExecuteCode() {
  const setCodeExecutionResult = useSubmissionStore.getState().setCodeExecutionResult
  return useMutation({
    mutationFn: async (body) => {
      const data = await runCodeSandbox({ language: body.language, code: body.raw_code })
      return {
        status: data.success ? 'SUCCESS' : 'FAILURE',
        output: data.success ? (data.stdout || '') : (data.stderr || data.stdout || ''),
        measured_time_complexity: null,
        test_case_results: [],
      }
    },
    retry: false,
    onSuccess: (data) => {
      setCodeExecutionResult(data)
    },
    onError: (error) => {
      console.error('[/api/exe] 오류 발생')
      console.error('status:', error.status)
      console.error('code:', error.code)
      console.error('message:', error.message)
      console.error('response body:', error.details)
    },
  })
}

/**
 * Mutation hook that posts code for AI analysis (generates questions).
 * On success, stores analysisResult in submissionStore and invalidates submissions cache.
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient()
  const setAnalysisResult = useSubmissionStore.getState().setAnalysisResult
  return useMutation({
    mutationFn: (body) => createSubmission(body),
    retry: false,
    onSuccess: (data) => {
      setAnalysisResult(data)
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all })
    },
  })
}

/**
 * Fetches a single submission by id.
 * @param {number|string} id
 */
export function useSubmission(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.submissions.detail(id),
    queryFn: ({ signal }) => getSubmission(id, { signal }),
    enabled: !!id && (options.enabled ?? true),
    ...options,
  })
}

/**
 * Mutation hook that submits QA answers for a submission.
 * On success, invalidates reports cache. Routing is handled by caller via onSuccess chaining.
 * @param {number|string} submissionId
 */
export function useSubmitAnswers(submissionId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => submitAnswers(submissionId, body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSubmission, getSubmission, submitAnswers } from '../api/submissions.js'
import { queryKeys } from '../api/queryKeys.js'
import useSubmissionStore from '../store/submissionStore.js'

/**
 * Mutation hook that posts code for analysis.
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

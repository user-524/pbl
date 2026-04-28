import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateReport, getReport, getReports } from '../api/reports.js'
import { queryKeys } from '../api/queryKeys.js'

/**
 * Fetches the list of all reports.
 */
export function useReports(options = {}) {
  return useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: ({ signal }) => getReports({ signal }),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/**
 * Fetches a single report by id.
 * @param {number|string} id
 */
export function useReport(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: ({ signal }) => getReport(id, { signal }),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/**
 * Mutation hook that calls AI to generate a report for a submission.
 * @returns {UseMutationResult}
 */
export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => generateReport(body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })
}

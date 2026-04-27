import { useQuery } from '@tanstack/react-query'
import { getReports, getReport } from '../api/reports.js'
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

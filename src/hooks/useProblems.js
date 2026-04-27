import { useQuery } from '@tanstack/react-query'
import { getProblems, getProblem } from '../api/problems.js'
import { queryKeys } from '../api/queryKeys.js'

/**
 * Fetches the list of all problems.
 */
export function useProblems(options = {}) {
  return useQuery({
    queryKey: queryKeys.problems.all,
    queryFn: ({ signal }) => getProblems({ signal }),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Fetches a single problem by id.
 * @param {number|string} id
 */
export function useProblem(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.problems.detail(id),
    queryFn: ({ signal }) => getProblem(id, { signal }),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

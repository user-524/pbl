import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLearnings, saveLearning } from '../api/learnings.js'
import { queryKeys } from '../api/queryKeys.js'

/**
 * Mutation hook to save a learning record (anonymous, no login required).
 */
export function useSaveLearning() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => saveLearning(body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learnings.all })
    },
  })
}

/**
 * Fetches the list of saved learnings for the given anonymous id.
 * @param {string} anonymousId
 */
export function useLearnings(anonymousId, options = {}) {
  return useQuery({
    queryKey: queryKeys.learnings.list(anonymousId),
    queryFn: ({ signal }) => getLearnings(anonymousId, { signal }),
    enabled: !!anonymousId && (options.enabled ?? true),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

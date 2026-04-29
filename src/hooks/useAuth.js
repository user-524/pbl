import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth.js'
import useAuthStore, { useAuthToken } from '../store/authStore.js'

/**
 * Mutation hook for login. Stores token on success.
 */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (payload) => login(payload),
    retry: false,
    onSuccess: (data) => {
      setAuth({ token: data.access_token, username: data.username })
    },
  })
}

/**
 * Returns a logout callback that clears the auth store.
 */
export function useLogout() {
  const clearToken = useAuthStore((s) => s.clearToken)
  return clearToken
}

export { useAuthToken }

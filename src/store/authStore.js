import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      username: null,

      setAuth: ({ token, username }) => set({ accessToken: token, username }),
      clearToken: () => set({ accessToken: null, username: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const useAuthToken = () => useAuthStore((s) => s.accessToken)

export default useAuthStore

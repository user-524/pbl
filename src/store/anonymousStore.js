import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const useAnonymousStore = create(
  persist(
    (set, get) => ({
      anonymousId: null,

      ensureAnonymousId: () => {
        const current = get().anonymousId
        if (current) return current
        const next = generateId()
        set({ anonymousId: next })
        return next
      },
    }),
    {
      name: 'anonymous-id-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const useAnonymousId = () => {
  const id = useAnonymousStore((s) => s.anonymousId)
  const ensure = useAnonymousStore((s) => s.ensureAnonymousId)
  return id ?? ensure()
}

export default useAnonymousStore

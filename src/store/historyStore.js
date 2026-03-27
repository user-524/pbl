import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useHistoryStore = create(
  persist(
    (set) => ({
      entries: [],
      activeEntryId: null,

      addEntry: (draft) => {
        const id = `entry-${Date.now()}`
        const newEntry = {
          id,
          problem_title: draft.problem_title || '새 문제',
          language: draft.language || 'python',
          created_at: new Date().toISOString(),
          total_score: null,
          draft: { ...draft },
          analysisResult: null,
          qaAnswers: {},
        }
        set((state) => ({
          entries: [newEntry, ...state.entries],
          activeEntryId: id,
        }))
        return id
      },

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),

      setActiveEntry: (id) => set({ activeEntryId: id }),

      deleteEntry: (id) =>
        set((state) => {
          const remaining = state.entries.filter((e) => e.id !== id)
          const newActiveId =
            state.activeEntryId === id
              ? remaining.length > 0
                ? remaining[0].id
                : null
              : state.activeEntryId
          return { entries: remaining, activeEntryId: newActiveId }
        }),
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useHistoryStore

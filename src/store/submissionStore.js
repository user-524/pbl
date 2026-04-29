import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const getInitialDraft = () => ({
  problem_title: '',
  problem_description: '',
  language: 'python',
  raw_code: '',
  test_cases: [{ input_data: '', expected_output: '' }],
})

const useSubmissionStore = create(
  persist(
    (set) => ({
      draft: getInitialDraft(),
      codeExecutionResult: null,
      analysisResult: null,
      qaAnswers: {},

      setDraft: (draft) => set({ draft }),

      setCodeExecutionResult: (codeExecutionResult) => set({ codeExecutionResult }),
      clearCodeExecutionResult: () => set({ codeExecutionResult: null }),

      setAnalysisResult: (analysisResult) => set({ analysisResult }),

      initializeQaAnswers: (questions) =>
        set((state) => {
          const nextAnswers = { ...state.qaAnswers }

          questions.forEach((question) => {
            if (nextAnswers[question.question_id] == null) {
              nextAnswers[question.question_id] = null
            }
          })

          return { qaAnswers: nextAnswers }
        }),

      setQaAnswer: (questionId, selectedNumber) =>
        set((state) => ({
          qaAnswers: {
            ...state.qaAnswers,
            [questionId]: selectedNumber,
          },
        })),

      clearAnalysisResult: () => set({ analysisResult: null }),
      clearQaAnswers: () => set({ qaAnswers: {} }),

      resetSubmissionFlow: () =>
        set({
          draft: getInitialDraft(),
          codeExecutionResult: null,
          analysisResult: null,
          qaAnswers: {},
        }),
    }),
    {
      name: 'submission-flow-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export default useSubmissionStore
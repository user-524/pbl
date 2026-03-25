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
      analysisResult: null,
      qaAnswers: {},

      setDraft: (draft) => set({ draft }),

      setAnalysisResult: (analysisResult) => set({ analysisResult }),

      initializeQaAnswers: (questions) =>
        set((state) => {
          const nextAnswers = { ...state.qaAnswers }

          questions.forEach((question) => {
            if (typeof nextAnswers[question.question_id] !== 'string') {
              nextAnswers[question.question_id] = ''
            }
          })

          return { qaAnswers: nextAnswers }
        }),

      setQaAnswer: (questionId, answerText) =>
        set((state) => ({
          qaAnswers: {
            ...state.qaAnswers,
            [questionId]: answerText,
          },
        })),

      clearAnalysisResult: () => set({ analysisResult: null }),
      clearQaAnswers: () => set({ qaAnswers: {} }),

      resetSubmissionFlow: () =>
        set({
          draft: getInitialDraft(),
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
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitAnswersForEvaluation } from '../services/qaService'
import useSubmissionStore from '../store/submissionStore'

function QASessionPage() {
  const { submissionId } = useParams()
  const navigate = useNavigate()

  const draft = useSubmissionStore((state) => state.draft)
  const analysisResult = useSubmissionStore((state) => state.analysisResult)
  const qaAnswers = useSubmissionStore((state) => state.qaAnswers)
  const initializeQaAnswers = useSubmissionStore((state) => state.initializeQaAnswers)
  const setQaAnswer = useSubmissionStore((state) => state.setQaAnswer)

  const questions = analysisResult?.generated_questions ?? []

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (questions.length > 0) {
      initializeQaAnswers(questions)
    }
  }, [questions, initializeQaAnswers])

  if (!draft.raw_code || !analysisResult || questions.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>QA Session Page</h1>
          <p style={styles.description}>
            질문 데이터가 없습니다. 먼저 분석 페이지를 거쳐주세요.
          </p>
          <button style={styles.button} onClick={() => navigate('/input')}>
            입력 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswerChange = (value) => {
    setQaAnswer(currentQuestion.question_id, value)
  }

  const handlePrev = () => {
    if (isFirstQuestion) return
    setCurrentQuestionIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    if (isLastQuestion) return
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const answerList = questions.map((question) => ({
        question_id: question.question_id,
        answer_text: qaAnswers[question.question_id] || '',
      }))

      const result = await submitAnswersForEvaluation({
        submissionId,
        answers: answerList,
      })

      navigate(`/result/${result.report_id}`)
    } catch (error) {
      setErrorMessage('답변 제출 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        <section style={styles.leftPanel}>
          <h2 style={styles.panelTitle}>제출 코드</h2>
          <p style={styles.smallText}>제출 ID: {submissionId}</p>
          <pre style={styles.codeBlock}>{draft.raw_code}</pre>
        </section>

        <section style={styles.rightPanel}>
          <h1 style={styles.title}>질문 답변 세션</h1>
          <p style={styles.description}>
            질문 {currentQuestionIndex + 1} / {questions.length}
          </p>

          <div style={styles.questionCard}>
            <p style={styles.questionType}>
              질문 유형: {currentQuestion.type}
            </p>
            <p style={styles.questionText}>{currentQuestion.text}</p>
          </div>

          <label style={styles.label}>내 답변</label>
          <textarea
            style={styles.textarea}
            placeholder="질문에 대한 설명을 작성해보세요."
            value={qaAnswers[currentQuestion.question_id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />

          {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handlePrev}
              disabled={isFirstQuestion}
            >
              이전 질문
            </button>

            {!isLastQuestion ? (
              <button
                type="button"
                style={styles.button}
                onClick={handleNext}
              >
                다음 질문
              </button>
            ) : (
              <button
                type="button"
                style={styles.button}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '채점 중...' : '답변 제출하기'}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    padding: '40px 20px',
  },
  layout: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  leftPanel: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  },
  rightPanel: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  panelTitle: {
    marginTop: 0,
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
  },
  description: {
    margin: 0,
    color: '#555',
  },
  smallText: {
    marginTop: 0,
    color: '#666',
    fontSize: '14px',
  },
  questionCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#fafafa',
  },
  questionType: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '600',
  },
  questionText: {
    margin: 0,
    fontSize: '17px',
    lineHeight: '1.5',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
  },
  textarea: {
    minHeight: '180px',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d0d7de',
    borderRadius: '10px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  codeBlock: {
    backgroundColor: '#111827',
    color: '#f9fafb',
    padding: '16px',
    borderRadius: '10px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    minHeight: '300px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  },
  button: {
    flex: 1,
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
  },
  secondaryButton: {
    flex: 1,
    padding: '14px',
    border: '1px solid #2563eb',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    color: '#2563eb',
    fontSize: '16px',
    cursor: 'pointer',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    margin: 0,
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}

export default QASessionPage
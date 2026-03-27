import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitAnswersForEvaluation } from '../services/qaService'
import useSubmissionStore from '../store/submissionStore'
import CodeEditor from '../components/editor/CodeEditor'
import Button from '../components/ui/Button'

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
          <Button onClick={() => navigate('/input')}>
            입력 페이지로 돌아가기
          </Button>
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
          <CodeEditor readOnly value={draft.raw_code} language={draft.language} height="440px" />
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
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={isFirstQuestion}
              style={{ flex: 1 }}
            >
              이전 질문
            </Button>

            {!isLastQuestion ? (
              <Button onClick={handleNext} style={{ flex: 1 }}>
                다음 질문
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                style={{ flex: 1 }}
              >
                {isSubmitting ? '채점 중...' : '답변 제출하기'}
              </Button>
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
    backgroundColor: 'var(--color-bg)',
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
    backgroundColor: 'var(--color-surface)',
    padding: '24px',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
  },
  rightPanel: {
    backgroundColor: 'var(--color-surface)',
    padding: '24px',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
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
    color: 'var(--color-text-sub)',
  },
  smallText: {
    marginTop: 0,
    color: 'var(--color-text-sub)',
    fontSize: '14px',
  },
  questionCard: {
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#fafafa',
  },
  questionType: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: 'var(--color-primary)',
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
    borderRadius: 'var(--radius-input)',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  },
  errorText: {
    color: 'var(--color-error)',
    fontSize: '14px',
    margin: 0,
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    margin: '0 auto',
    backgroundColor: 'var(--color-surface)',
    padding: '32px',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}

export default QASessionPage

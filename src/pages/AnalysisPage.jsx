import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitCodeForAnalysis } from '../services/submissionService'
import useSubmissionStore from '../store/submissionStore'
import AstTreeViewer from '../components/ast/AstTreeViewer'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

const LOADING_MESSAGES = [
  '코드를 샌드박스에서 실행 중...',
  'AST 구조를 분석 중...',
  '질문을 생성 중...',
]

function AnalysisPage() {
  const navigate = useNavigate()

  const draft = useSubmissionStore((state) => state.draft)
  const analysisResult = useSubmissionStore((state) => state.analysisResult)
  const setAnalysisResult = useSubmissionStore((state) => state.setAnalysisResult)

  const [isLoading, setIsLoading] = useState(!analysisResult)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  const hasDraftData = Boolean(
    draft.problem_title.trim() &&
      draft.problem_description.trim() &&
      draft.raw_code.trim()
  )

  useEffect(() => {
    if (!hasDraftData) {
      setIsLoading(false)
      return
    }

    if (analysisResult) {
      setIsLoading(false)
      return
    }

    const runAnalysis = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const result = await submitCodeForAnalysis(draft)
        setAnalysisResult(result)
      } catch (error) {
        setErrorMessage('분석 중 오류가 발생했습니다.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    runAnalysis()
  }, [hasDraftData, analysisResult, draft, setAnalysisResult])

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      )
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!hasDraftData) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Analysis Page</h1>
          <p style={styles.description}>
            전달된 입력 데이터가 없습니다.
          </p>
          <Button onClick={() => navigate('/input')}>
            입력 페이지로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>코드 분석 중...</h1>
          <p style={styles.description}>
            샌드박스 실행, AST 분석, 질문 생성을 순서대로 진행하고 있습니다.
          </p>
          <div style={styles.loadingBox}>
            <Spinner size={32} />
            <p style={styles.loadingText}>
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>분석 실패</h1>
          <p style={styles.errorText}>{errorMessage}</p>
          <Button onClick={() => navigate('/input')}>
            다시 입력하러 가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>분석 완료</h1>
        <p style={styles.description}>
          현재는 목업 데이터를 사용하고 있습니다.
        </p>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>제출 ID</h2>
          <p style={styles.text}>{analysisResult.submission_id}</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>실행 결과</h2>
          <p style={styles.text}>
            상태: {analysisResult.execution_result.status}
          </p>
          <p style={styles.text}>
            시간복잡도: {analysisResult.execution_result.measured_time_complexity}
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>생성된 질문</h2>
          {analysisResult.generated_questions.map((question) => (
            <div key={question.question_id} style={styles.questionBox}>
              <p style={styles.text}>질문 ID: {question.question_id}</p>
              <p style={styles.text}>유형: {question.type}</p>
              <p style={styles.text}>내용: {question.text}</p>
            </div>
          ))}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>AST 구조 예시</h2>
          <AstTreeViewer data={analysisResult.ast_structure} />
        </section>

        <div style={styles.buttonGroup}>
          <Button variant="secondary" onClick={() => navigate('/input')}>
            다시 입력하기
          </Button>

          <Button onClick={() => navigate(`/qa/${analysisResult.submission_id}`)}>
            QA 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    backgroundColor: 'var(--color-surface)',
    padding: '32px',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
  },
  description: {
    margin: 0,
    color: 'var(--color-text-sub)',
  },
  section: {
    borderTop: '1px solid var(--color-border)',
    paddingTop: '16px',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
  },
  text: {
    margin: '4px 0',
    color: 'var(--color-text-main)',
  },
  questionBox: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-input)',
    padding: '12px',
    backgroundColor: '#fafafa',
    marginBottom: '10px',
  },
  loadingBox: {
    marginTop: '12px',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-primary-light)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  loadingText: {
    margin: 0,
    color: 'var(--color-primary)',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  errorText: {
    color: 'var(--color-error)',
    fontSize: '14px',
  },
}

export default AnalysisPage

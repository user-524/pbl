import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitCodeForAnalysis } from '../services/submissionService'
import useSubmissionStore from '../store/submissionStore'

function AnalysisPage() {
  const navigate = useNavigate()

  const draft = useSubmissionStore((state) => state.draft)
  const analysisResult = useSubmissionStore((state) => state.analysisResult)
  const setAnalysisResult = useSubmissionStore((state) => state.setAnalysisResult)

  const [isLoading, setIsLoading] = useState(!analysisResult)
  const [errorMessage, setErrorMessage] = useState('')

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

  if (!hasDraftData) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Analysis Page</h1>
          <p style={styles.description}>
            전달된 입력 데이터가 없습니다.
          </p>
          <button style={styles.button} onClick={() => navigate('/input')}>
            입력 페이지로 돌아가기
          </button>
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
            <p style={styles.loadingText}>문제와 코드를 분석하는 중입니다...</p>
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
          <button style={styles.button} onClick={() => navigate('/input')}>
            다시 입력하러 가기
          </button>
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
          <pre style={styles.codeBlock}>
            {JSON.stringify(analysisResult.ast_structure, null, 2)}
          </pre>
        </section>

        <div style={styles.buttonGroup}>
          <button style={styles.secondaryButton} onClick={() => navigate('/input')}>
            다시 입력하기
          </button>

          <button
            style={styles.button}
            onClick={() => navigate(`/qa/${analysisResult.submission_id}`)}
          >
            QA 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
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
    color: '#555',
  },
  section: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
  },
  text: {
    margin: '4px 0',
    color: '#222',
  },
  questionBox: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '12px',
    backgroundColor: '#fafafa',
    marginBottom: '10px',
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
  },
  loadingBox: {
    marginTop: '12px',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
  },
  loadingText: {
    margin: 0,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
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
  },
}

export default AnalysisPage
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReportById } from '../services/reportService'

function ResultPage() {
  const { reportId } = useParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reportData, setReportData] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data = await getReportById(reportId)
        setReportData(data)
      } catch (error) {
        setErrorMessage('리포트를 불러오는 중 오류가 발생했습니다.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>결과 리포트 불러오는 중...</h1>
          <p style={styles.description}>잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  if (errorMessage || !reportData) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Result Page</h1>
          <p style={styles.errorText}>{errorMessage || '리포트가 없습니다.'}</p>
          <button style={styles.button} onClick={() => navigate('/input')}>
            새 문제 입력하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>이해도 리포트</h1>
        <p style={styles.description}>리포트 ID: {reportId}</p>

        <section style={styles.scoreBox}>
          <p style={styles.scoreLabel}>총 이해도 점수</p>
          <p style={styles.scoreValue}>{reportData.total_score}점</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>세부 점수</h2>
          <div style={styles.detailGrid}>
            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>Keyword Match</p>
              <p style={styles.detailValue}>
                {reportData.detail_scores.keyword_match}
              </p>
            </div>

            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>Semantic Similarity</p>
              <p style={styles.detailValue}>
                {reportData.detail_scores.semantic_similarity}
              </p>
            </div>

            <div style={styles.detailCard}>
              <p style={styles.detailLabel}>Time Complexity</p>
              <p style={styles.detailValue}>
                {reportData.detail_scores.time_complexity}
              </p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>취약 키워드</h2>
          <div style={styles.keywordList}>
            {reportData.weak_keywords.map((keyword, index) => (
              <span key={index} style={styles.keywordItem}>
                {keyword}
              </span>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>AI 피드백</h2>
          <p style={styles.text}>{reportData.ai_feedback}</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>추천 학습 방향</h2>
          <ul style={styles.list}>
            {reportData.recommendations.map((item, index) => (
              <li key={index} style={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div style={styles.buttonGroup}>
          <button style={styles.secondaryButton} onClick={() => navigate('/input')}>
            새 문제 입력하기
          </button>

          <button style={styles.button} onClick={() => navigate('/login')}>
            처음으로 돌아가기
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
    maxWidth: '860px',
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
  scoreBox: {
    backgroundColor: '#eff6ff',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
  },
  scoreLabel: {
    margin: 0,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  scoreValue: {
    margin: '12px 0 0 0',
    fontSize: '40px',
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  detailCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#fafafa',
  },
  detailLabel: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  detailValue: {
    margin: '10px 0 0 0',
    fontSize: '24px',
    fontWeight: '700',
  },
  keywordList: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  keywordItem: {
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '14px',
    fontWeight: '600',
  },
  text: {
    margin: 0,
    lineHeight: '1.7',
    color: '#222',
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '8px',
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

export default ResultPage
import Spinner from '../ui/Spinner.jsx'
import Button from '../ui/Button.jsx'

function ExecutionResultPanel({ analysisResult, isAnalyzing, onGoToQA }) {
  if (isAnalyzing) {
    return (
      <div style={styles.center}>
        <Spinner size={28} color="#007acc" />
        <p style={styles.loadingText}>코드 분석 중...</p>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <div style={styles.center}>
        <p style={styles.empty}>분석 실행 후 결과가 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>상태</span>
          <span style={{
            ...styles.cardValue,
            color: analysisResult.execution_result?.status === 'SUCCESS' ? '#4ec9b0' : '#f44747',
          }}>
            {analysisResult.execution_result?.status || '-'}
          </span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>시간복잡도</span>
          <span style={styles.cardValue}>
            {analysisResult.execution_result?.measured_time_complexity || '-'}
          </span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>제출 ID</span>
          <span style={styles.cardValue}>{analysisResult.submission_id || '-'}</span>
        </div>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>생성된 질문 ({analysisResult.generated_questions?.length || 0}개)</p>
        <div style={styles.questionList}>
          {(analysisResult.generated_questions || []).map((q, i) => (
            <div key={q.question_id} style={styles.questionItem}>
              <span style={styles.qNum}>Q{i + 1}</span>
              <span style={styles.qType}>[{q.type}]</span>
              <span style={styles.qText}>{q.text}</span>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onGoToQA} style={{ marginTop: '8px', alignSelf: 'flex-start' }}>
        QA 세션 시작 →
      </Button>
    </div>
  )
}

const styles = {
  container: {
    padding: '10px 16px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '10px',
  },
  loadingText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    margin: 0,
  },
  empty: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
  },
  row: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#2d2d2d',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '6px',
    padding: '8px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '100px',
  },
  cardLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardValue: {
    color: 'var(--color-ide-text)',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTitle: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    margin: 0,
  },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  questionItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    padding: '6px 10px',
    backgroundColor: '#2d2d2d',
    borderRadius: '4px',
    border: '1px solid var(--color-ide-border)',
  },
  qNum: {
    color: '#007acc',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  qType: {
    color: '#dcdcaa',
    fontSize: '11px',
    flexShrink: 0,
  },
  qText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
  },
}

export default ExecutionResultPanel

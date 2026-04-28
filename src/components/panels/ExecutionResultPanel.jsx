import Spinner from '../ui/Spinner.jsx'

function ExecutionResultPanel({
  workflowStatus,
  codeExecutionResult,
  totalScore,
  onStartQA,
  onGenerateReport,
  onViewReport,
}) {
  if (workflowStatus === 'idle') {
    return (
      <div style={styles.center}>
        <div style={styles.emptyIcon}>⚡</div>
        <p style={styles.emptyTitle}>코드 실행 결과</p>
        <p style={styles.emptyText}>
          코드를 작성하고<br />
          상단의 <strong style={styles.strong}>▶ 코드 실행</strong> 버튼을 눌러보세요.
        </p>
      </div>
    )
  }

  if (workflowStatus === 'executing') {
    return (
      <div style={styles.center}>
        <Spinner size={24} color="#007acc" />
        <p style={styles.loadingText}>코드 실행 중...</p>
      </div>
    )
  }

  if (workflowStatus === 'analyzing') {
    return (
      <div style={styles.container}>
        {codeExecutionResult && <ExecutionCards execution={codeExecutionResult} />}
        <div style={styles.loadingBlock}>
          <Spinner size={20} color="#dcdcaa" />
          <p style={styles.loadingText}>AI 질문 생성 중...</p>
        </div>
      </div>
    )
  }

  if (workflowStatus === 'reporting') {
    return (
      <div style={styles.container}>
        {codeExecutionResult && <ExecutionCards execution={codeExecutionResult} />}
        <div style={styles.loadingBlock}>
          <Spinner size={20} color="#a855f7" />
          <p style={styles.loadingText}>AI 리포트 생성 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {codeExecutionResult && <ExecutionCards execution={codeExecutionResult} />}

      <div style={styles.actions}>
        {workflowStatus === 'executed' && (
          <button style={styles.actionBtnPrimary} onClick={onStartQA}>
            💬 AI 질의응답 시작
          </button>
        )}

        {workflowStatus === 'qa_done' && (
          <button style={styles.actionBtnReport} onClick={onGenerateReport}>
            📊 리포트 생성 (AI)
          </button>
        )}

        {workflowStatus === 'completed' && (
          <button style={styles.actionBtnView} onClick={onViewReport}>
            📊 리포트 보기{totalScore != null ? ` (${totalScore}점)` : ''}
          </button>
        )}
      </div>
    </div>
  )
}

function ExecutionCards({ execution }) {
  const isSuccess = execution.status === 'SUCCESS'
  return (
    <div style={styles.cards}>
      <div style={styles.card}>
        <span style={styles.cardLabel}>실행 상태</span>
        <span style={{ ...styles.cardValue, color: isSuccess ? '#4ec9b0' : '#f44747' }}>
          {execution.status || '-'}
        </span>
      </div>
      <div style={styles.card}>
        <span style={styles.cardLabel}>시간복잡도</span>
        <span style={styles.cardValue}>
          {execution.measured_time_complexity || '-'}
        </span>
      </div>
      {execution.output != null && (
        <div style={{ ...styles.card, flex: '1 1 100%' }}>
          <span style={styles.cardLabel}>출력</span>
          <pre style={styles.output}>{execution.output}</pre>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '12px 16px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '10px',
    padding: '24px',
  },
  emptyIcon: { fontSize: '36px' },
  emptyTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '15px',
    fontWeight: '600',
    margin: 0,
  },
  emptyText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    textAlign: 'center',
    lineHeight: '1.6',
    margin: 0,
  },
  strong: { color: '#4ec9b0' },
  loadingText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    margin: 0,
  },
  loadingBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
  },
  cards: {
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
    letterSpacing: '0.3px',
  },
  cardValue: {
    color: 'var(--color-ide-text)',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  output: {
    color: 'var(--color-ide-text)',
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: '4px 0 0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  actionBtnPrimary: {
    padding: '10px 16px',
    background: '#0e639c',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionBtnSecondary: {
    padding: '9px 16px',
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionBtnReport: {
    padding: '10px 16px',
    background: '#2d1f3d',
    border: '1px solid #a855f7',
    color: '#d8b4fe',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionBtnView: {
    padding: '10px 16px',
    background: '#1a3a1a',
    border: '1px solid #4ec9b0',
    color: '#4ec9b0',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
  },
}

export default ExecutionResultPanel

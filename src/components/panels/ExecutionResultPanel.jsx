import Spinner from '../ui/Spinner.jsx'

function ExecutionResultPanel({
  workflowStatus,
  codeExecutionResult,
  totalScore,
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

  if (workflowStatus === 'evaluating') {
    return (
      <div style={styles.container}>
        {codeExecutionResult && <ExecutionCards execution={codeExecutionResult} />}
        <div style={styles.loadingBlock}>
          <Spinner size={20} color="#4ec9b0" />
          <p style={styles.loadingText}>14개 답변 채점 중...</p>
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
  const testCaseResults = execution.test_case_results ?? []

  return (
    <div style={styles.cardsWrapper}>
      {!isSuccess && (
        <div style={styles.errorBanner}>
          <span style={styles.errorBannerIcon}>⚠</span>
          코드 실행 중 오류가 발생했습니다. 코드를 확인하고 다시 시도해 주세요.
        </div>
      )}

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

      {testCaseResults.length > 0 && (
        <div style={styles.testCaseSection}>
          <span style={styles.testCaseSectionLabel}>
            테스트케이스 결과 ({testCaseResults.filter((r) => r.passed).length}/{testCaseResults.length} 통과)
          </span>
          {testCaseResults.map((tc, i) => (
            <div key={i} style={{ ...styles.testCaseRow, borderColor: tc.passed ? '#4ec9b0' : '#f44747' }}>
              <div style={styles.testCaseHeader}>
                <span style={{ ...styles.testCaseBadge, backgroundColor: tc.passed ? '#1a3a2a' : '#3a1a1a', color: tc.passed ? '#4ec9b0' : '#f44747', borderColor: tc.passed ? '#4ec9b0' : '#f44747' }}>
                  {tc.passed ? '✓ PASS' : '✗ FAIL'}
                </span>
                <span style={styles.testCaseNum}>#{i + 1}</span>
              </div>
              <div style={styles.testCaseGrid}>
                <span style={styles.testCaseLabel}>입력</span>
                <pre style={styles.testCasePre}>{tc.input_data ?? '-'}</pre>
                <span style={styles.testCaseLabel}>기대 출력</span>
                <pre style={styles.testCasePre}>{tc.expected_output ?? '-'}</pre>
                {!tc.passed && (
                  <>
                    <span style={styles.testCaseLabel}>실제 출력</span>
                    <pre style={{ ...styles.testCasePre, color: '#f44747' }}>{tc.actual_output ?? '-'}</pre>
                  </>
                )}
              </div>
            </div>
          ))}
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
  cardsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#3a1a1a',
    border: '1px solid #f44747',
    borderRadius: '6px',
    color: '#f44747',
    fontSize: '13px',
    fontWeight: '500',
  },
  errorBannerIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  cards: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  testCaseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  testCaseSectionLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  testCaseRow: {
    backgroundColor: '#2d2d2d',
    border: '1px solid',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  testCaseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  testCaseBadge: {
    fontSize: '11px',
    fontWeight: '700',
    fontFamily: 'monospace',
    padding: '2px 7px',
    borderRadius: '3px',
    border: '1px solid',
  },
  testCaseNum: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
  },
  testCaseGrid: {
    display: 'grid',
    gridTemplateColumns: '64px 1fr',
    gap: '2px 8px',
    alignItems: 'start',
  },
  testCaseLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    paddingTop: '3px',
  },
  testCasePre: {
    color: 'var(--color-ide-text)',
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
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

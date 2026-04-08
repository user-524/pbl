import { useNavigate } from 'react-router-dom'

function TitleBar({
  isAnalyzing,
  onRunAnalysis,
  onToggleReport,
  onToggleTestCase,
  onToggleAgent,
  showReport,
  showTestCase,
  showAgent,
  workflowStatus,
}) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const canRun = workflowStatus !== 'analyzing'

  return (
    <div style={styles.bar}>
      {/* 왼쪽: 앱 제목 */}
      <div style={styles.left}>
        <span style={styles.icon}>⬡</span>
        <span style={styles.title}>AI 윤리 기반 학습 평가</span>
      </div>

      {/* 오른쪽: 액션 버튼들 */}
      <div style={styles.right}>
        {/* 토글 버튼들 */}
        <button
          style={{ ...styles.toggleBtn, ...(showTestCase ? styles.toggleBtnActive : {}) }}
          onClick={onToggleTestCase}
          title="테스트 케이스"
        >
          테스트케이스
        </button>

        <div style={styles.divider} />

        {/* 분석 실행 버튼 */}
        <button
          style={{
            ...styles.runBtn,
            opacity: isAnalyzing ? 0.6 : 1,
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
          }}
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          title="코드 분석 실행"
        >
          {isAnalyzing ? (
            <>
              <span style={styles.spinner} />
              분석 중...
            </>
          ) : (
            '▶ 실행'
          )}
        </button>

        {/* 리포트 버튼 */}
        <button
          style={{ ...styles.reportBtn, ...(showReport ? styles.reportBtnActive : {}) }}
          onClick={onToggleReport}
          title="리포트 보기"
        >
          📊 리포트
        </button>

        {/* 에이전트 버튼 */}
        <button
          style={{ ...styles.agentBtn, ...(showAgent ? styles.agentBtnActive : {}) }}
          onClick={onToggleAgent}
          title="정답 풀이 에이전트"
        >
          🤖 에이전트
        </button>

        <div style={styles.divider} />

        <button style={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  )
}

const styles = {
  bar: {
    height: '48px',
    backgroundColor: 'var(--color-ide-titlebar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
    userSelect: 'none',
    borderBottom: '1px solid var(--color-ide-border)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '20px',
    color: '#007acc',
  },
  title: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    fontWeight: '500',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'var(--color-ide-border)',
    margin: '0 4px',
  },
  toggleBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    backgroundColor: 'var(--color-ide-active)',
    borderColor: '#007acc',
    color: 'var(--color-ide-text)',
  },
  runBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0e639c',
    border: 'none',
    color: '#ffffff',
    padding: '5px 14px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  reportBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  reportBtnActive: {
    backgroundColor: '#094771',
    borderColor: '#007acc',
    color: '#ffffff',
  },
  agentBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  agentBtnActive: {
    backgroundColor: '#2d1f3d',
    borderColor: '#a855f7',
    color: '#d8b4fe',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text)',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}

export default TitleBar

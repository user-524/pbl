import { useNavigate } from 'react-router-dom'
import { useLogout } from '../../hooks/useAuth.js'

function TitleBar({
  workflowStatus,
  isExecuting,
  hasProblemTitle,
  onRunCode,
  onToggleAgent,
  showAgent,
  onToggleTestCase,
  showTestCase,
}) {
  const navigate = useNavigate()
  const clearToken = useLogout()

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  const runDisabled = isExecuting || !hasProblemTitle

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.icon}>⬡</span>
        <span style={styles.title}>AI 윤리 기반 학습 평가</span>
      </div>

      <div style={styles.right}>
        <button
          style={{ ...styles.toggleBtn, ...(showTestCase ? styles.toggleBtnActive : {}) }}
          onClick={onToggleTestCase}
          title="테스트 케이스"
        >
          테스트케이스
        </button>

        <div style={styles.divider} />

        <button
          style={{
            ...styles.runBtn,
            opacity: runDisabled ? 0.5 : 1,
            cursor: runDisabled ? 'not-allowed' : 'pointer',
          }}
          onClick={onRunCode}
          disabled={runDisabled}
          title={!hasProblemTitle ? '문제 제목을 먼저 입력하세요' : '코드 실행'}
        >
          {isExecuting ? (
            <>
              <span style={styles.spinner} />
              실행 중...
            </>
          ) : (
            '▶ 코드 실행'
          )}
        </button>

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

import { useNavigate } from 'react-router-dom'

function TitleBar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.icon}>⬡</span>
        <span style={styles.title}>AI 윤리 기반 학습 평가</span>
      </div>
      <div style={styles.right}>
        <span style={styles.username}>학생</span>
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
    gap: '12px',
  },
  username: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
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
}

export default TitleBar

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth.js'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button'

function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()
  const { mutate: doLogin, isPending } = useLogin()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!username.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    doLogin({ username, password }, {
      onSuccess: () => navigate('/workspace'),
      onError: (err) => {
        if (err.code === 'UNAUTHORIZED') {
          setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.')
        } else if (err.code === 'NETWORK_ERROR') {
          setErrorMessage('서버에 연결할 수 없습니다.')
        } else {
          setErrorMessage(err.message || '로그인에 실패했습니다.')
        }
      },
    })
  }

  const handleDemoStart = () => {
    setAuth({ token: 'test-admin-token', username: 'demo' })
    navigate('/workspace')
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>AI 윤리 기반 학습 평가</h1>
        <p style={styles.description}>
          백엔드가 아직 연결되지 않아도 시연용으로 계속 개발할 수 있습니다.
        </p>

        <label style={styles.label}>아이디</label>
        <input
          style={styles.input}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label style={styles.label}>비밀번호</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}

        <Button type="submit" isLoading={isPending} style={{ marginTop: '12px' }}>
          {isPending ? '로그인 중...' : '실제 로그인 시도'}
        </Button>

        <Button type="button" variant="secondary" onClick={handleDemoStart}>
          백엔드 없이 시연용 시작
        </Button>

        <p style={styles.helpText}>
          시연 계정: admin / password123
        </p>
      </form>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'var(--color-surface)',
    padding: '32px',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
  },
  description: {
    marginTop: '4px',
    marginBottom: '12px',
    color: 'var(--color-text-sub)',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d0d7de',
    borderRadius: 'var(--radius-input)',
  },
  helpText: {
    marginTop: '8px',
    fontSize: '13px',
    color: 'var(--color-text-sub)',
  },
  errorText: {
    margin: '4px 0 0 0',
    color: 'var(--color-error)',
    fontSize: '14px',
  },
}

export default LoginPage

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'

function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!username.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)

      const data = await loginUser({
        username,
        password,
      })

      if (data.success && data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        navigate('/input')
      } else {
        setErrorMessage(data.message || '로그인에 실패했습니다.')
      }
    } catch (error) {
      setErrorMessage('로그인 요청 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoStart = () => {
    localStorage.setItem('access_token', 'test-admin-token')
    navigate('/input')
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

        <button
          style={{
            ...styles.button,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '실제 로그인 시도'}
        </button>

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={handleDemoStart}
        >
          백엔드 없이 시연용 시작
        </button>

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
    backgroundColor: '#f5f7fb',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
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
    color: '#555',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d0d7de',
    borderRadius: '10px',
  },
  button: {
    marginTop: '12px',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '16px',
  },
  secondaryButton: {
    padding: '14px',
    border: '1px solid #2563eb',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    color: '#2563eb',
    fontSize: '16px',
    cursor: 'pointer',
  },
  helpText: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#666',
  },
  errorText: {
    margin: '4px 0 0 0',
    color: '#dc2626',
    fontSize: '14px',
  },
}

export default LoginPage
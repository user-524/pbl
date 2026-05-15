import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin, useRegister } from '../hooks/useAuth.js'
import useAuthStore from '../store/authStore.js'
import Button from '../components/ui/Button'

function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()
  const { mutate: doLogin, isPending: isLoginPending } = useLogin()
  const { mutate: doRegister, isPending: isRegisterPending } = useRegister()
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearToken = useAuthStore((s) => s.clearToken)

  const isPending = isLoginPending || isRegisterPending

  const switchMode = (next) => {
    setMode(next)
    setErrorMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!username.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    const onError = (err) => setErrorMessage(err.message || '요청에 실패했습니다.')

    if (mode === 'login') {
      doLogin({ username, password }, { onSuccess: () => navigate('/workspace'), onError })
    } else {
      doRegister({ username, password }, {
        onSuccess: () => {
          const goNow = window.confirm('바로 로그인하시겠습니까?')
          if (goNow) {
            navigate('/workspace')
          } else {
            clearToken()
            setPassword('')
            switchMode('login')
          }
        },
        onError,
      })
    }
  }

  const handleDemoStart = () => {
    setAuth({ token: 'test-admin-token', username: 'demo' })
    navigate('/workspace')
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>AI 윤리 기반 학습 평가</h1>

        <div style={styles.tabs}>
          <button
            type="button"
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
            onClick={() => switchMode('login')}
          >
            로그인
          </button>
          <button
            type="button"
            style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
            onClick={() => switchMode('register')}
          >
            회원가입
          </button>
        </div>

        <label style={styles.label}>아이디</label>
        <input
          style={styles.input}
          type="text"
          value={username}
          autoComplete="username"
          placeholder="공백 없이 입력"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label style={styles.label}>비밀번호</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder={mode === 'register' ? '영문+숫자 조합 권장' : ''}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === 'register' && (
          <p style={styles.hint}>
            최대 72자(영문 기준) / 한글 포함 시 24자
          </p>
        )}

        {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}

        <Button type="submit" isLoading={isPending} style={{ marginTop: '12px' }}>
          {isPending
            ? (mode === 'login' ? '로그인 중...' : '가입 중...')
            : (mode === 'login' ? '로그인' : '회원가입')}
        </Button>

        {mode === 'login' && (
          <Button type="button" variant="secondary" onClick={handleDemoStart}>
            백엔드 없이 시연용 시작
          </Button>
        )}

        {mode === 'login' && (
          <p style={styles.helpText}>시연 계정: admin / password123</p>
        )}
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
  tabs: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #d0d7de',
    marginBottom: '4px',
  },
  tab: {
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--color-text-sub)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
  },
  tabActive: {
    color: 'var(--color-primary, #2563eb)',
    borderBottom: '2px solid var(--color-primary, #2563eb)',
    fontWeight: '700',
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
  hint: {
    margin: '0',
    fontSize: '12px',
    color: 'var(--color-text-sub)',
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
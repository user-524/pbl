import { useState } from 'react'
import { useProblems, useProblem } from '../hooks/useProblems.js'
import { useSubmission } from '../hooks/useSubmissions.js'
import { useReports, useReport } from '../hooks/useReports.js'
import { useAuthToken } from '../hooks/useAuth.js'

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {children}
    </div>
  )
}

function Result({ query }) {
  if (query.isPending) return <p style={s.muted}>로딩 중...</p>
  if (query.isError) return <p style={s.error}>오류: {query.error?.message} ({query.error?.code})</p>
  return <pre style={s.pre}>{JSON.stringify(query.data, null, 2)}</pre>
}

export default function ApiDemoPage() {
  const token = useAuthToken()
  const [problemId, setProblemId] = useState('')
  const [submissionId, setSubmissionId] = useState('')
  const [reportId, setReportId] = useState('')
  const [enabledProblem, setEnabledProblem] = useState(false)
  const [enabledSubmission, setEnabledSubmission] = useState(false)
  const [enabledReport, setEnabledReport] = useState(false)

  const problems = useProblems()
  const problem = useProblem(problemId, { enabled: enabledProblem && !!problemId })
  const submission = useSubmission(submissionId, { enabled: enabledSubmission && !!submissionId })
  const reports = useReports()
  const report = useReport(reportId, { enabled: enabledReport && !!reportId })

  return (
    <div style={s.page}>
      <h1 style={s.title}>API Demo — 8 Endpoints</h1>
      <p style={s.sub}>현재 토큰: <code style={s.code}>{token ?? '없음'}</code></p>

      <Section title="1. GET /api/problems (목록)">
        <Result query={problems} />
      </Section>

      <Section title="2. GET /api/problems/:id (상세)">
        <div style={s.row}>
          <input
            style={s.input}
            placeholder="problem id"
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
          />
          <button style={s.btn} onClick={() => setEnabledProblem(true)}>조회</button>
        </div>
        <Result query={problem} />
      </Section>

      <Section title="3. POST /api/submissions — WorkspacePage에서 실행">
        <p style={s.muted}>WorkspacePage의 ▶ 실행 버튼으로 호출됩니다.</p>
      </Section>

      <Section title="4. GET /api/submissions/:id (상세)">
        <div style={s.row}>
          <input
            style={s.input}
            placeholder="submission id"
            value={submissionId}
            onChange={(e) => setSubmissionId(e.target.value)}
          />
          <button style={s.btn} onClick={() => setEnabledSubmission(true)}>조회</button>
        </div>
        <Result query={submission} />
      </Section>

      <Section title="5. POST /api/submissions/:id/answers — WorkspacePage에서 실행">
        <p style={s.muted}>WorkspacePage의 ✓ 답변 제출 버튼으로 호출됩니다.</p>
      </Section>

      <Section title="6. GET /api/reports (목록)">
        <Result query={reports} />
      </Section>

      <Section title="7. GET /api/reports/:id (상세)">
        <div style={s.row}>
          <input
            style={s.input}
            placeholder="report id"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
          />
          <button style={s.btn} onClick={() => setEnabledReport(true)}>조회</button>
        </div>
        <Result query={report} />
      </Section>

      <Section title="8. POST /api/auth/login — LoginPage에서 실행">
        <p style={s.muted}>LoginPage의 로그인 버튼으로 호출됩니다.</p>
      </Section>
    </div>
  )
}

const s = {
  page: {
    padding: '32px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'monospace',
    color: 'var(--color-ide-text, #d4d4d4)',
    backgroundColor: 'var(--color-ide-bg, #1e1e1e)',
    minHeight: '100vh',
  },
  title: { marginBottom: '4px' },
  sub: { color: '#888', marginBottom: '32px', fontSize: '13px' },
  code: { backgroundColor: '#2d2d2d', padding: '2px 6px', borderRadius: '3px' },
  section: {
    marginBottom: '32px',
    padding: '16px',
    border: '1px solid #3c3c3c',
    borderRadius: '6px',
    backgroundColor: '#252526',
  },
  sectionTitle: { margin: '0 0 12px', fontSize: '14px', color: '#9cdcfe' },
  pre: {
    margin: 0,
    fontSize: '12px',
    color: '#d4d4d4',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  muted: { color: '#888', margin: 0, fontSize: '13px' },
  error: { color: '#f44747', margin: 0, fontSize: '13px' },
  row: { display: 'flex', gap: '8px', marginBottom: '8px' },
  input: {
    flex: 1,
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#d4d4d4',
  },
  btn: {
    padding: '6px 14px',
    background: '#0e639c',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
}

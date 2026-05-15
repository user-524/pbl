import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'
import { useLogout } from '../hooks/useAuth.js'
import { useReports, useReport, useDownloadReport } from '../hooks/useReports.js'
import { useSubmissionList } from '../hooks/useSubmissions.js'
import ReportOverlay from '../components/panels/ReportOverlay.jsx'

const TABS = [
  { key: 'reports', label: '📊 리포트 목록' },
  { key: 'submissions', label: '💻 제출 목록' },
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#4ec9b0' : score >= 60 ? '#dcdcaa' : '#f44747'
  return (
    <span style={{ ...styles.badge, backgroundColor: color + '22', color, border: `1px solid ${color}55` }}>
      {score}점
    </span>
  )
}

function ReportCard({ report, onView }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>{report.problem_title || '(제목 없음)'}</span>
        {report.total_score != null && <ScoreBadge score={report.total_score} />}
      </div>
      <div style={styles.cardMeta}>
        {report.language && <span style={styles.langTag}>{report.language}</span>}
        <span style={styles.dateText}>{formatDate(report.created_at)}</span>
      </div>
      {report.detail_scores && (
        <div style={styles.scoreRow}>
          <ScoreBar label="Keyword" value={report.detail_scores.keyword_match} max={40} color="#007acc" />
          <ScoreBar label="Semantic" value={report.detail_scores.semantic_similarity} max={45} color="#4ec9b0" />
          <ScoreBar label="Time" value={report.detail_scores.time_complexity} max={20} color="#dcdcaa" />
        </div>
      )}
      <button style={styles.viewBtn} onClick={() => onView(report.id)}>
        상세 보기 →
      </button>
    </div>
  )
}

function ScoreBar({ label, value, max, color }) {
  return (
    <div style={styles.scoreBarItem}>
      <span style={styles.scoreBarLabel}>{label}</span>
      <div style={styles.scoreBarTrack}>
        <div style={{ ...styles.scoreBarFill, width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }} />
      </div>
      <span style={{ ...styles.scoreBarValue, color }}>{value}/{max}</span>
    </div>
  )
}

function SubmissionCard({ submission }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>{submission.problem_title || '(제목 없음)'}</span>
        <span style={styles.statusTag}>
          {submission.status || '완료'}
        </span>
      </div>
      <div style={styles.cardMeta}>
        {submission.language && <span style={styles.langTag}>{submission.language}</span>}
        <span style={styles.dateText}>{formatDate(submission.created_at)}</span>
      </div>
      {submission.raw_code && (
        <pre style={styles.codePreview}>
          {submission.raw_code.slice(0, 120)}{submission.raw_code.length > 120 ? '…' : ''}
        </pre>
      )}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyIcon}>📭</span>
      <p style={styles.emptyText}>{message}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={styles.emptyState}>
      <div style={styles.spinner} />
      <p style={styles.emptyText}>불러오는 중...</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyIcon}>⚠</span>
      <p style={{ ...styles.emptyText, color: '#f44747' }}>{message}</p>
    </div>
  )
}

function ReportDetailModal({ reportId, onClose }) {
  const { data: report, isLoading, isError } = useReport(reportId, { enabled: !!reportId })
  const { mutate: downloadMutate, isPending: isDownloading } = useDownloadReport()
  const [downloadError, setDownloadError] = useState('')

  const handleDownload = () => {
    setDownloadError('')
    downloadMutate(
      { reportId, format: 'pdf' },
      {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `report-${reportId}.pdf`
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(url), 0)
        },
        onError: () => setDownloadError('다운로드 중 오류가 발생했습니다.'),
      }
    )
  }

  if (!reportId) return null

  if (isLoading) {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <span style={styles.modalTitle}>📊 리포트 상세</span>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <LoadingState />
        </div>
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <span style={styles.modalTitle}>📊 리포트 상세</span>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <ErrorState message="리포트를 불러오지 못했습니다." />
        </div>
      </div>
    )
  }

  return (
    <ReportOverlay
      reportData={report}
      analysisResult={null}
      submissionId={report.submission_id}
      reportId={reportId}
      totalScore={report.total_score}
      problemTitle={report.problem_title}
      language={report.language}
      rawCode={report.raw_code}
      onClose={onClose}
      onNewProblem={onClose}
    />
  )
}

function MyPage() {
  const navigate = useNavigate()
  const username = useAuthStore((s) => s.username)
  const clearToken = useLogout()

  const [activeTab, setActiveTab] = useState('reports')
  const [selectedReportId, setSelectedReportId] = useState(null)

  const { data: reports, isLoading: reportsLoading, isError: reportsError } = useReports()
  const { data: submissions, isLoading: submissionsLoading, isError: submissionsError } = useSubmissionList()

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  const reportList = Array.isArray(reports) ? reports : []
  const submissionList = Array.isArray(submissions) ? submissions : []

  return (
    <div style={styles.page}>
      {/* 상단 바 */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.appIcon}>⬡</span>
          <span style={styles.appTitle}>AI 윤리 기반 학습 평가</span>
        </div>
        <div style={styles.topRight}>
          <button style={styles.topBtn} onClick={() => navigate('/workspace')}>
            워크스페이스
          </button>
          <button style={styles.topBtn} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div style={styles.content}>
        {/* 사용자 정보 헤더 */}
        <div style={styles.userHeader}>
          <div style={styles.userAvatar}>{username?.[0]?.toUpperCase() ?? 'U'}</div>
          <div>
            <div style={styles.userName}>{username ?? '사용자'}</div>
            <div style={styles.userStats}>
              리포트 {reportList.length}개 &nbsp;·&nbsp; 제출 {submissionList.length}개
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div style={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'reports' && (
          <div style={styles.grid}>
            {reportsLoading && <LoadingState />}
            {reportsError && <ErrorState message="리포트 목록을 불러오지 못했습니다." />}
            {!reportsLoading && !reportsError && reportList.length === 0 && (
              <EmptyState message="아직 생성된 리포트가 없습니다." />
            )}
            {reportList.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onView={setSelectedReportId}
              />
            ))}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div style={styles.grid}>
            {submissionsLoading && <LoadingState />}
            {submissionsError && <ErrorState message="제출 목록을 불러오지 못했습니다." />}
            {!submissionsLoading && !submissionsError && submissionList.length === 0 && (
              <EmptyState message="아직 제출된 코드가 없습니다." />
            )}
            {submissionList.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))}
          </div>
        )}
      </div>

      {/* 리포트 상세 모달 */}
      {selectedReportId && (
        <ReportDetailModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
        />
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    height: '48px',
    backgroundColor: '#2d2d30',
    borderBottom: '1px solid #3e3e42',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  appIcon: {
    fontSize: '20px',
    color: '#007acc',
  },
  appTitle: {
    color: '#d4d4d4',
    fontSize: '14px',
    fontWeight: '500',
  },
  topRight: {
    display: 'flex',
    gap: '8px',
  },
  topBtn: {
    background: 'none',
    border: '1px solid #3e3e42',
    color: '#d4d4d4',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#252526',
    border: '1px solid #3e3e42',
    borderRadius: '10px',
    padding: '20px 24px',
  },
  userAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#094771',
    color: '#9cdcfe',
    fontSize: '22px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#d4d4d4',
    marginBottom: '4px',
  },
  userStats: {
    fontSize: '13px',
    color: '#858585',
  },
  tabs: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #3e3e42',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    color: '#858585',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
  tabActive: {
    color: '#9cdcfe',
    borderBottomColor: '#007acc',
    fontWeight: '700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#252526',
    border: '1px solid #3e3e42',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'border-color 0.15s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  cardTitle: {
    color: '#d4d4d4',
    fontSize: '14px',
    fontWeight: '600',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  statusTag: {
    fontSize: '11px',
    color: '#4ec9b0',
    backgroundColor: '#4ec9b022',
    border: '1px solid #4ec9b055',
    padding: '2px 8px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  langTag: {
    fontSize: '11px',
    color: '#dcdcaa',
    backgroundColor: '#dcdcaa22',
    border: '1px solid #dcdcaa44',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  dateText: {
    fontSize: '12px',
    color: '#858585',
  },
  scoreRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  scoreBarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreBarLabel: {
    width: '54px',
    fontSize: '10px',
    color: '#858585',
    fontWeight: '600',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  scoreBarTrack: {
    flex: 1,
    height: '4px',
    backgroundColor: '#3e3e42',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  scoreBarValue: {
    width: '36px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'right',
    flexShrink: 0,
  },
  codePreview: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #3e3e42',
    borderRadius: '4px',
    padding: '8px',
    fontSize: '11px',
    color: '#858585',
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre',
    margin: 0,
    maxHeight: '72px',
    overflow: 'hidden',
  },
  viewBtn: {
    alignSelf: 'flex-end',
    background: 'none',
    border: '1px solid #007acc55',
    color: '#007acc',
    padding: '5px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '12px',
  },
  emptyIcon: {
    fontSize: '40px',
  },
  emptyText: {
    color: '#858585',
    fontSize: '14px',
    margin: 0,
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #3e3e42',
    borderTop: '3px solid #007acc',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalPanel: {
    width: '480px',
    maxWidth: '90vw',
    backgroundColor: '#252526',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #3e3e42',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #3e3e42',
    flexShrink: 0,
  },
  modalTitle: {
    color: '#d4d4d4',
    fontSize: '14px',
    fontWeight: '700',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#858585',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    lineHeight: 1,
  },
}

export default MyPage
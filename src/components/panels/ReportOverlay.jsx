import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function ReportOverlay({
  reportData,
  analysisResult,
  submissionId,
  reportId,
  totalScore,
  problemTitle,
  language,
  rawCode,
  onClose,
  onNewProblem,
}) {
  const navigate = useNavigate()
  const [actionError, setActionError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const bodyRef = useRef(null)

  const handleDownload = async () => {
    if (!bodyRef.current) return
    setActionError('')
    setIsDownloading(true)

    const body = bodyRef.current
    const panel = body.parentElement
    const navBtn = body.lastElementChild

    const savedBody = { overflowY: body.style.overflowY, height: body.style.height, flex: body.style.flex }
    const savedPanel = { overflow: panel.style.overflow, height: panel.style.height }

    try {
      body.scrollTop = 0
      if (navBtn) navBtn.style.display = 'none'

      // overflow 제약을 풀어 html2canvas가 전체 콘텐츠를 캡처하도록
      body.style.flex = 'none'
      body.style.overflowY = 'visible'
      body.style.height = 'auto'
      panel.style.overflow = 'visible'
      panel.style.height = 'auto'

      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      const canvas = await html2canvas(body, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#2d2d2d',
      })

      const imgData = canvas.toDataURL('image/png')
      const ptW = 595.28
      const ratio = ptW / canvas.width
      const ptH = canvas.height * ratio
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [ptW, ptH] })
      pdf.addImage(imgData, 'PNG', 0, 0, ptW, ptH)
      pdf.save(`report-${reportId ?? 'download'}.pdf`)
    } catch {
      setActionError('PDF 생성 중 오류가 발생했습니다.')
    } finally {
      body.style.overflowY = savedBody.overflowY
      body.style.height = savedBody.height
      body.style.flex = savedBody.flex
      panel.style.overflow = savedPanel.overflow
      panel.style.height = savedPanel.height
      if (navBtn) navBtn.style.display = ''
      setIsDownloading(false)
    }
  }

  const handleGoToMyPage = () => {
    onClose()
    navigate('/mypage')
  }

  if (!reportData) {
    return (
      <div style={styles.overlay}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>📊 리포트</span>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div style={styles.emptyBody}>
            <p style={styles.emptyText}>
              Q&A 답변을 제출하면 리포트가 생성됩니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const rd = reportData?.data ?? reportData
  const detailScores = rd.detail_scores ?? {}
  const radarData = [
    { subject: '이해도', score: detailScores.comprehension ?? 0, fullMark: 100 },
    { subject: '코드품질', score: detailScores.code_quality ?? 0, fullMark: 100 },
  ]

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={styles.panelHeader}>
          <span style={styles.panelTitle}>📊 평가 리포트</span>
          <div style={styles.headerActions}>
            <button
              style={{
                ...styles.downloadBtn,
                opacity: isDownloading ? 0.5 : 1,
                cursor: isDownloading ? 'not-allowed' : 'pointer',
              }}
              onClick={handleDownload}
              disabled={isDownloading}
              title="리포트 PDF 다운로드"
            >
              {isDownloading ? '생성 중...' : '⬇ 다운로드'}
            </button>
            <button
              style={styles.mypageBtn}
              onClick={handleGoToMyPage}
              title="마이페이지에서 내 리포트 보기"
            >
              마이페이지
            </button>
            <button style={styles.newProblemBtn} onClick={onNewProblem}>
              + 새 문제
            </button>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>
        {actionError && (
          <div style={styles.actionErrorBar}>{actionError}</div>
        )}

        <div ref={bodyRef} style={styles.body}>
          {/* 총점 */}
          <div style={styles.scoreBox}>
            <span style={styles.scoreLabel}>총 이해도 점수</span>
            <span style={styles.scoreValue}>{rd.total_score ?? '-'}점</span>
          </div>

          {/* ── 섹션 1: 코드 평가 ── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>💻</span>
              <span style={styles.sectionTitle}>코드 평가</span>
              <span style={styles.sectionSub}>사용자 코드 분석 결과</span>
            </div>

            <div style={styles.metaRow}>
              <div style={styles.metaCard}>
                <span style={styles.metaLabel}>실행 상태</span>
                <span style={{
                  ...styles.metaValue,
                  color: analysisResult?.execution_result?.status === 'SUCCESS' ? '#4ec9b0' : '#f44747',
                }}>
                  {analysisResult?.execution_result?.status || '-'}
                </span>
              </div>
              <div style={styles.metaCard}>
                <span style={styles.metaLabel}>시간복잡도</span>
                <span style={styles.metaValue}>
                  {analysisResult?.execution_result?.measured_time_complexity || '-'}
                </span>
              </div>
            </div>

            <div style={styles.detailRow}>
              {[
                { label: 'Code Quality', value: detailScores.code_quality ?? 0, max: 100 },
              ].map(({ label, value, max }) => (
                <div key={label} style={styles.detailCard}>
                  <span style={styles.detailLabel}>{label}</span>
                  <span style={styles.detailValue}>{value}</span>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(value / max) * 100}%`,
                        backgroundColor: '#007acc',
                      }}
                    />
                  </div>
                  <span style={styles.detailMax}>/ {max}</span>
                </div>
              ))}
            </div>

            <div style={styles.keywordSection}>
              <span style={styles.keywordLabel}>취약 키워드</span>
              <div style={styles.keywordList}>
                {(rd.weak_keywords ?? []).map((kw, i) => (
                  <span key={i} style={styles.keyword}>{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── 섹션 2: 질문 답변 평가 ── */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🤖</span>
              <span style={styles.sectionTitle}>질문 답변 평가</span>
              <span style={styles.sectionSub}>LLM 이해도 평가 결과</span>
            </div>

            <div style={styles.radarRow}>
              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#3e3e42" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#858585', fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar
                      dataKey="score"
                      fill="#007acc"
                      fillOpacity={0.3}
                      stroke="#007acc"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.semanticCard}>
                <span style={styles.detailLabel}>이해도 (Comprehension)</span>
                <span style={{ ...styles.detailValue, fontSize: '28px' }}>
                  {detailScores.comprehension ?? 0}
                </span>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${((detailScores.comprehension ?? 0) / 100) * 100}%`,
                      backgroundColor: '#4ec9b0',
                    }}
                  />
                </div>
                <span style={styles.detailMax}>/ 100</span>
              </div>
            </div>

            <div style={styles.feedbackBox}>
              <span style={styles.feedbackLabel}>AI 피드백</span>
              <p style={styles.feedbackText}>{rd.ai_feedback}</p>
            </div>

            <div style={styles.recSection}>
              <span style={styles.recLabel}>추천 학습 방향</span>
              <ul style={styles.recList}>
                {(rd.recommendations ?? []).map((item, i) => (
                  <li key={i} style={styles.recItem}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <button style={styles.mypageBottomBtn} onClick={handleGoToMyPage}>
            마이페이지에서 내 학습 기록 보기 →
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  panel: {
    width: '480px',
    maxWidth: '90vw',
    backgroundColor: 'var(--color-ide-sidebar)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--color-ide-border)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  panelTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    fontWeight: '700',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  newProblemBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  downloadBtn: {
    background: '#0e639c',
    border: '1px solid #0e639c',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  mypageBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  mypageBottomBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#094771',
    border: '1px solid #007acc',
    borderRadius: '6px',
    color: '#9cdcfe',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    flexShrink: 0,
  },
  actionErrorBar: {
    padding: '6px 16px',
    backgroundColor: '#3a1a1a',
    borderBottom: '1px solid #f44747',
    color: '#f44747',
    fontSize: '12px',
    fontWeight: '500',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    lineHeight: 1,
  },
  emptyBody: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  emptyText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  scoreBox: {
    backgroundColor: '#094771',
    borderRadius: '8px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    color: '#9cdcfe',
    fontSize: '13px',
    fontWeight: '600',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#2d2d2d',
    borderRadius: '8px',
    border: '1px solid var(--color-ide-border)',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--color-ide-border)',
    paddingBottom: '10px',
  },
  sectionIcon: {
    fontSize: '16px',
  },
  sectionTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    fontWeight: '700',
  },
  sectionSub: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
  },
  metaRow: {
    display: 'flex',
    gap: '10px',
  },
  metaCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: 'var(--color-ide-text)',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  detailRow: {
    display: 'flex',
    gap: '10px',
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: 'var(--color-ide-text)',
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#3e3e42',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  detailMax: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
  },
  keywordSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  keywordLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  keywordList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  keyword: {
    padding: '3px 10px',
    borderRadius: '999px',
    backgroundColor: '#1f3a5f',
    color: '#9cdcfe',
    fontSize: '12px',
    fontWeight: '600',
  },
  radarRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  chartWrapper: {
    width: '160px',
    flexShrink: 0,
  },
  semanticCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: '6px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  feedbackBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: '6px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  feedbackLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  feedbackText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
  recSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  recLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recList: {
    margin: 0,
    paddingLeft: '16px',
    color: 'var(--color-ide-text)',
    fontSize: '13px',
  },
  recItem: {
    marginBottom: '4px',
    lineHeight: '1.5',
  },
}

export default ReportOverlay

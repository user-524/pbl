import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import Button from '../ui/Button.jsx'

function ReportPanel({ reportData, onNewProblem }) {
  if (!reportData) {
    return (
      <div style={styles.center}>
        <p style={styles.empty}>QA 답변 제출 후 리포트가 표시됩니다.</p>
      </div>
    )
  }

  const radarData = [
    { subject: 'Keyword', score: reportData.detail_scores.keyword_match, fullMark: 40 },
    { subject: 'Semantic', score: reportData.detail_scores.semantic_similarity, fullMark: 45 },
    { subject: 'Time', score: reportData.detail_scores.time_complexity, fullMark: 20 },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.scoreSection}>
        <div style={styles.totalScore}>
          <span style={styles.scoreLabel}>총 점수</span>
          <span style={styles.scoreValue}>{reportData.total_score}점</span>
        </div>

        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={140}>
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

        <div style={styles.detailRow}>
          {[
            { label: 'Keyword', value: reportData.detail_scores.keyword_match },
            { label: 'Semantic', value: reportData.detail_scores.semantic_similarity },
            { label: 'Time', value: reportData.detail_scores.time_complexity },
          ].map(({ label, value }) => (
            <div key={label} style={styles.detailCard}>
              <span style={styles.detailLabel}>{label}</span>
              <span style={styles.detailValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>취약 키워드</p>
        <div style={styles.keywordList}>
          {reportData.weak_keywords.map((kw, i) => (
            <span key={i} style={styles.keyword}>{kw}</span>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>AI 피드백</p>
        <p style={styles.feedbackText}>{reportData.ai_feedback}</p>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>추천 학습 방향</p>
        <ul style={styles.list}>
          {reportData.recommendations.map((item, i) => (
            <li key={i} style={styles.listItem}>{item}</li>
          ))}
        </ul>
      </div>

      <Button
        variant="secondary"
        onClick={onNewProblem}
        style={{ alignSelf: 'flex-start', marginTop: '4px' }}
      >
        + 새 문제 시작
      </Button>
    </div>
  )
}

const styles = {
  container: {
    padding: '8px 16px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  empty: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  totalScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#094771',
    borderRadius: '8px',
    padding: '10px 20px',
    minWidth: '80px',
  },
  scoreLabel: {
    color: '#9cdcfe',
    fontSize: '11px',
    fontWeight: '600',
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: 1.2,
  },
  chartWrapper: {
    width: '180px',
    flexShrink: 0,
  },
  detailRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  detailCard: {
    backgroundColor: '#2d2d2d',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '6px',
    padding: '6px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: '70px',
  },
  detailLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
  },
  detailValue: {
    color: 'var(--color-ide-text)',
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
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
  feedbackText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
  list: {
    margin: 0,
    paddingLeft: '16px',
    color: 'var(--color-ide-text)',
    fontSize: '13px',
  },
  listItem: {
    marginBottom: '4px',
    lineHeight: '1.5',
  },
}

export default ReportPanel

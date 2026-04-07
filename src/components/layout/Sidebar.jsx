import { useState } from 'react'
import useHistoryStore from '../../store/historyStore.js'
import useSubmissionStore from '../../store/submissionStore.js'

const LANG_COLORS = {
  python: '#3572A5',
  javascript: '#F1E05A',
  java: '#B07219',
}

function Sidebar({ onNewProblem }) {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  const entries = useHistoryStore((s) => s.entries)
  const activeEntryId = useHistoryStore((s) => s.activeEntryId)
  const setActiveEntry = useHistoryStore((s) => s.setActiveEntry)
  const deleteEntry = useHistoryStore((s) => s.deleteEntry)

  const setDraft = useSubmissionStore((s) => s.setDraft)
  const setAnalysisResult = useSubmissionStore((s) => s.setAnalysisResult)
  const clearAnalysisResult = useSubmissionStore((s) => s.clearAnalysisResult)
  const clearQaAnswers = useSubmissionStore((s) => s.clearQaAnswers)

  const handleSelectEntry = (entry) => {
    setActiveEntry(entry.id)
    setDraft(entry.draft)
    if (entry.analysisResult) {
      setAnalysisResult(entry.analysisResult)
    } else {
      clearAnalysisResult()
      clearQaAnswers()
    }
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    deleteEntry(id)
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (collapsed) {
    return (
      <div style={styles.collapsed}>
        <button style={styles.iconBtn} onClick={() => setCollapsed(false)} title="탐색기 펼치기">
          ☰
        </button>
        <button style={styles.iconBtn} onClick={onNewProblem} title="새 문제">
          +
        </button>
      </div>
    )
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>탐색기</span>
        <button style={styles.iconBtn} onClick={() => setCollapsed(true)} title="접기">
          ‹
        </button>
      </div>

      <button style={styles.newBtn} onClick={onNewProblem}>
        + 새 문제
      </button>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>나의 기록</p>
        {entries.length === 0 && (
          <p style={styles.empty}>기록이 없습니다</p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              ...styles.entryItem,
              ...(entry.id === activeEntryId ? styles.entryActive : {}),
              ...(hoveredId === entry.id && entry.id !== activeEntryId ? styles.entryHover : {}),
            }}
            onClick={() => handleSelectEntry(entry)}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={styles.entryMain}>
              <div style={styles.entryTitleRow}>
                <span
                  style={{ ...styles.langDot, backgroundColor: LANG_COLORS[entry.language] || '#858585' }}
                />
                <span style={styles.entryTitle}>
                  {entry.problem_title || '새 문제'}
                </span>
              </div>
              <div style={styles.entryMeta}>
                <span style={styles.entryDate}>{formatDate(entry.created_at)}</span>
                {entry.total_score !== null && (
                  <span style={styles.entryScore}>{entry.total_score}점</span>
                )}
              </div>
            </div>
            {hoveredId === entry.id && (
              <button
                style={styles.deleteBtn}
                onClick={(e) => handleDelete(e, entry.id)}
                title="삭제"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--color-ide-sidebar)',
    borderRight: '1px solid var(--color-ide-border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  collapsed: {
    width: '48px',
    backgroundColor: 'var(--color-ide-sidebar)',
    borderRight: '1px solid var(--color-ide-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '8px',
    gap: '8px',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-ide-border)',
  },
  headerTitle: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 6px',
    borderRadius: '4px',
    lineHeight: 1,
  },
  newBtn: {
    margin: '8px',
    padding: '6px 12px',
    backgroundColor: '#0e639c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  section: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0',
  },
  sectionLabel: {
    margin: '8px 12px 4px',
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  empty: {
    margin: '8px 12px',
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  entryItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
  },
  entryActive: {
    backgroundColor: 'var(--color-ide-active)',
    borderLeft: '2px solid #007acc',
  },
  entryHover: {
    backgroundColor: 'var(--color-ide-hover)',
  },
  entryMain: {
    flex: 1,
    overflow: 'hidden',
  },
  entryTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  langDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  entryTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  entryMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '3px',
    paddingLeft: '14px',
  },
  entryDate: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
  },
  entryScore: {
    color: '#4ec9b0',
    fontSize: '11px',
    fontWeight: '600',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px 4px',
    borderRadius: '3px',
    flexShrink: 0,
  },
}

export default Sidebar

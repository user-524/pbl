function StatusBar({ language, workflowStatus, totalScore }) {
  const statusLabels = {
    idle: '대기',
    analyzing: '분석 중...',
    qa: 'QA 진행',
    completed: '완료',
  }

  const langLabels = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
  }

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.item}>
          {langLabels[language] || language || 'Python'}
        </span>
      </div>
      <div style={styles.center}>
        <span style={styles.item}>
          실행: {statusLabels[workflowStatus] || '대기'}
        </span>
      </div>
      <div style={styles.right}>
        <span style={styles.item}>
          점수: {totalScore !== null && totalScore !== undefined ? `${totalScore}점` : '--'}
        </span>
      </div>
    </div>
  )
}

const styles = {
  bar: {
    height: '28px',
    backgroundColor: 'var(--color-ide-statusbar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
  item: {
    color: '#ffffff',
    fontSize: '12px',
    opacity: 0.9,
  },
}

export default StatusBar

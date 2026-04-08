import StatusBar from './StatusBar.jsx'

function IDELayout({ children, language, workflowStatus, totalScore, titleBar }) {
  return (
    <div style={styles.root}>
      {titleBar}
      <div style={styles.mainArea}>
        {children}
      </div>
      <StatusBar
        language={language}
        workflowStatus={workflowStatus}
        totalScore={totalScore}
      />
    </div>
  )
}

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-ide-bg)',
    overflow: 'hidden',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
}

export default IDELayout

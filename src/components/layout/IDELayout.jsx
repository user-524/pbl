import TitleBar from './TitleBar.jsx'
import StatusBar from './StatusBar.jsx'

function IDELayout({ sidebar, children, language, workflowStatus, totalScore }) {
  return (
    <div style={styles.root}>
      <TitleBar />
      <div style={styles.middle}>
        {sidebar}
        <div style={styles.mainArea}>
          {children}
        </div>
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
  middle: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
}

export default IDELayout

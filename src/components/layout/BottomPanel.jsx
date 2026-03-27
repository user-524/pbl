import { useRef, useState, useCallback, useEffect } from 'react'
import ProblemInfoPanel from '../panels/ProblemInfoPanel.jsx'
import TestCasePanel from '../panels/TestCasePanel.jsx'
import ExecutionResultPanel from '../panels/ExecutionResultPanel.jsx'
import QAPanel from '../panels/QAPanel.jsx'
import ReportPanel from '../panels/ReportPanel.jsx'

const TABS = [
  { id: 'problem', label: '문제 정보' },
  { id: 'testcase', label: '테스트 케이스' },
  { id: 'result', label: '실행 결과' },
  { id: 'qa', label: 'QA 세션' },
  { id: 'report', label: '리포트' },
]

function BottomPanel({
  activeTab,
  onTabChange,
  panelHeight,
  onPanelHeightChange,
  isAnalyzing,
  isSubmitting,
  qaErrorMessage,
  reportData,
  analysisResult,
  onRunAnalysis,
  onGoToQA,
  onSubmitQA,
  onNewProblem,
}) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  const handleResizerMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    startYRef.current = e.clientY
    startHeightRef.current = panelHeight
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const deltaY = startYRef.current - e.clientY
    const viewportH = window.innerHeight
    const newHeightPx = startHeightRef.current + deltaY
    const newHeightPct = (newHeightPx / viewportH) * 100
    onPanelHeightChange(Math.min(70, Math.max(15, newHeightPct)))
  }, [isDragging, onPanelHeightChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const panelStyle = minimized
    ? { ...styles.panel, height: '32px' }
    : { ...styles.panel, height: `${panelHeight}vh` }

  return (
    <div ref={containerRef} style={panelStyle}>
      {/* 리사이저 */}
      <div
        style={{ ...styles.resizer, cursor: isDragging ? 'ns-resize' : 'ns-resize' }}
        onMouseDown={handleResizerMouseDown}
      />

      {/* 탭 헤더 */}
      <div style={styles.tabBar}>
        <div style={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => {
                if (minimized) setMinimized(false)
                onTabChange(tab.id)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          style={styles.minimizeBtn}
          onClick={() => setMinimized((p) => !p)}
          title={minimized ? '펼치기' : '최소화'}
        >
          {minimized ? '▲' : '▼'}
        </button>
      </div>

      {/* 패널 내용 */}
      {!minimized && (
        <div style={styles.content}>
          {activeTab === 'problem' && (
            <ProblemInfoPanel onRunAnalysis={onRunAnalysis} isAnalyzing={isAnalyzing} />
          )}
          {activeTab === 'testcase' && (
            <TestCasePanel onRunAnalysis={onRunAnalysis} isAnalyzing={isAnalyzing} />
          )}
          {activeTab === 'result' && (
            <ExecutionResultPanel
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
              onGoToQA={onGoToQA}
            />
          )}
          {activeTab === 'qa' && (
            <QAPanel
              onSubmit={onSubmitQA}
              isSubmitting={isSubmitting}
              errorMessage={qaErrorMessage}
            />
          )}
          {activeTab === 'report' && (
            <ReportPanel reportData={reportData} onNewProblem={onNewProblem} />
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  panel: {
    backgroundColor: 'var(--color-ide-panel-bg)',
    borderTop: '1px solid var(--color-ide-border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
    transition: 'height 0.05s',
  },
  resizer: {
    height: '4px',
    backgroundColor: 'var(--color-ide-border)',
    flexShrink: 0,
    cursor: 'ns-resize',
  },
  tabBar: {
    height: '32px',
    backgroundColor: 'var(--color-ide-titlebar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  tabs: {
    display: 'flex',
    height: '100%',
  },
  tab: {
    height: '100%',
    padding: '0 16px',
    background: 'none',
    border: 'none',
    borderRight: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    backgroundColor: 'var(--color-ide-tab-active)',
    color: 'var(--color-ide-text)',
    borderTop: '1px solid #007acc',
  },
  minimizeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    padding: '0 12px',
    fontSize: '12px',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
}

export default BottomPanel

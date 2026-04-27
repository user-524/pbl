import { useState, useRef, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import IDELayout from '../components/layout/IDELayout.jsx'
import TitleBar from '../components/layout/TitleBar.jsx'
import StatusBar from '../components/layout/StatusBar.jsx'
import QASection from '../components/panels/QASection.jsx'
import ReportOverlay from '../components/panels/ReportOverlay.jsx'
import AgentPanel from '../components/panels/AgentPanel.jsx'
import TestCaseDrawer from '../components/panels/TestCaseDrawer.jsx'
import { parseCodeToAst } from '../utils/simpleAstParser.js'
import AstTreeViewer from '../components/ast/AstTreeViewer.jsx'
import useSubmissionStore from '../store/submissionStore.js'
import { useCreateSubmission, useSubmitAnswers } from '../hooks/useSubmissions.js'
import { useReport } from '../hooks/useReports.js'

function WorkspacePage() {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)
  const analysisResult = useSubmissionStore((s) => s.analysisResult)
  const clearAnalysisResult = useSubmissionStore((s) => s.clearAnalysisResult)
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const initializeQaAnswers = useSubmissionStore((s) => s.initializeQaAnswers)
  const clearQaAnswers = useSubmissionStore((s) => s.clearQaAnswers)

  const [workflowStatus, setWorkflowStatus] = useState('idle')
  const [qaErrorMessage, setQaErrorMessage] = useState('')
  const [submissionId, setSubmissionId] = useState(null)
  const [reportId, setReportId] = useState(null)
  const [totalScore, setTotalScore] = useState(null)

  const [showReport, setShowReport] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [showTestCase, setShowTestCase] = useState(false)

  const containerRef = useRef(null)
  const [splitRatio, setSplitRatio] = useState(55)
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef(null)

  const [showAst, setShowAst] = useState(false)
  const [astData, setAstData] = useState(null)
  const debounceTimer = useRef(null)

  const { mutate: createSubmission, isPending: isAnalyzing } = useCreateSubmission()
  const { mutate: doSubmitAnswers, isPending: isSubmitting } = useSubmitAnswers(submissionId)
  const { data: reportData } = useReport(reportId, { enabled: !!reportId })

  useEffect(() => {
    if (!showAst) return
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setAstData(parseCodeToAst(draft.raw_code || '', draft.language))
    }, 300)
    return () => clearTimeout(debounceTimer.current)
  }, [draft.raw_code, draft.language, showAst])

  const handleDividerMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const ratio = ((e.clientX - rect.left) / rect.width) * 100
    setSplitRatio(Math.min(75, Math.max(30, ratio)))
  }, [isDragging])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

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

  const handleCodeChange = (newCode) => {
    setDraft({ ...draft, raw_code: newCode || '' })
  }

  const handleRunAnalysis = () => {
    if (!draft.problem_title.trim() || !draft.raw_code.trim()) return

    clearAnalysisResult()
    clearQaAnswers()
    setReportId(null)
    setTotalScore(null)
    setQaErrorMessage('')
    setWorkflowStatus('analyzing')

    createSubmission(
      {
        problem_title: draft.problem_title,
        problem_description: draft.problem_description,
        language: draft.language,
        raw_code: draft.raw_code,
      },
      {
        onSuccess: (result) => {
          setSubmissionId(result.submission_id)
          initializeQaAnswers(result.generated_questions)
          setWorkflowStatus('qa')
        },
        onError: () => setWorkflowStatus('idle'),
      }
    )
  }

  const handleSubmitQA = () => {
    if (!submissionId || !analysisResult) return
    const questions = analysisResult.generated_questions ?? []
    const answers = questions.map((q) => ({
      question_id: q.question_id,
      selected_number: qaAnswers[q.question_id] ?? null,
    }))

    setQaErrorMessage('')

    doSubmitAnswers(
      { answers },
      {
        onSuccess: (evalResult) => {
          setReportId(evalResult.report_id)
          setTotalScore(evalResult.total_score ?? null)
          setWorkflowStatus('completed')
          setShowReport(true)
        },
        onError: () => setQaErrorMessage('답변 제출 중 오류가 발생했습니다.'),
      }
    )
  }

  const handleApplyAgentCode = (code) => {
    setDraft({ ...draft, raw_code: code })
  }

  const handleNewProblem = () => {
    setDraft({
      problem_title: '',
      problem_description: '',
      language: 'python',
      raw_code: '',
      test_cases: [{ input_data: '', expected_output: '' }],
    })
    clearAnalysisResult()
    clearQaAnswers()
    setReportId(null)
    setSubmissionId(null)
    setWorkflowStatus('idle')
    setTotalScore(null)
    setShowReport(false)
    setQaErrorMessage('')
  }

  const handleNodeClick = (line) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line)
      editorRef.current.setPosition({ lineNumber: line, column: 1 })
      editorRef.current.focus()
    }
  }

  const titleBar = (
    <TitleBar
      isAnalyzing={isAnalyzing}
      onRunAnalysis={handleRunAnalysis}
      onToggleReport={() => setShowReport((p) => !p)}
      onToggleTestCase={() => setShowTestCase((p) => !p)}
      onToggleAgent={() => setShowAgent((p) => !p)}
      showReport={showReport}
      showTestCase={showTestCase}
      showAgent={showAgent}
      workflowStatus={workflowStatus}
    />
  )

  return (
    <>
      <div style={styles.root}>
        {titleBar}

        <div
          ref={containerRef}
          style={{ ...styles.main, cursor: isDragging ? 'col-resize' : 'default' }}
        >
          {showTestCase && (
            <TestCaseDrawer onClose={() => setShowTestCase(false)} />
          )}

          <div style={{ ...styles.editorColumn, width: `${splitRatio}%` }}>
            <div style={styles.panelHeader}>
              <span style={styles.panelLabel}>코드 에디터</span>
              <button
                style={{ ...styles.astToggle, ...(showAst ? styles.astToggleActive : {}) }}
                onClick={() => setShowAst((p) => !p)}
              >
                AST
              </button>
            </div>

            {showAst ? (
              <div style={styles.editorAstSplit}>
                <div style={styles.editorHalf}>
                  <Editor
                    height="100%"
                    language={draft.language}
                    value={draft.raw_code}
                    onChange={handleCodeChange}
                    onMount={(editor) => { editorRef.current = editor }}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      tabSize: 2,
                    }}
                  />
                </div>
                <div style={styles.astDivider} />
                <div style={styles.astHalf}>
                  <div style={styles.astHeader}>
                    <span style={styles.panelLabel}>AST 트리 (실시간)</span>
                  </div>
                  <AstTreeViewer data={astData} onNodeClick={handleNodeClick} />
                </div>
              </div>
            ) : (
              <div style={styles.editorWrapper}>
                <Editor
                  height="100%"
                  language={draft.language}
                  value={draft.raw_code}
                  onChange={handleCodeChange}
                  onMount={(editor) => { editorRef.current = editor }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    tabSize: 2,
                  }}
                />
              </div>
            )}
          </div>

          <div
            style={styles.divider}
            onMouseDown={handleDividerMouseDown}
          />

          <div style={{ ...styles.qaColumn, flex: 1 }}>
            <QASection
              analysisResult={analysisResult}
              onSubmit={handleSubmitQA}
              isSubmitting={isSubmitting}
              errorMessage={qaErrorMessage}
            />
          </div>
        </div>

        <StatusBar
          language={draft.language}
          workflowStatus={workflowStatus}
          totalScore={totalScore}
        />
      </div>

      {showReport && (
        <ReportOverlay
          reportData={reportData ?? null}
          analysisResult={analysisResult}
          onClose={() => setShowReport(false)}
          onNewProblem={() => {
            handleNewProblem()
            setShowReport(false)
          }}
        />
      )}

      {showAgent && (
        <AgentPanel
          onClose={() => setShowAgent(false)}
          onApplyCode={handleApplyAgentCode}
        />
      )}
    </>
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
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  editorColumn: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  panelHeader: {
    height: '32px',
    backgroundColor: 'var(--color-ide-titlebar)',
    borderBottom: '1px solid var(--color-ide-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '12px',
    paddingRight: '8px',
    flexShrink: 0,
  },
  panelLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    fontWeight: '500',
  },
  astToggle: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '2px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  astToggleActive: {
    backgroundColor: 'var(--color-ide-active)',
    borderColor: '#007acc',
    color: 'var(--color-ide-text)',
  },
  editorWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  editorAstSplit: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  editorHalf: {
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
  astDivider: {
    height: '3px',
    backgroundColor: 'var(--color-ide-border)',
    flexShrink: 0,
  },
  astHalf: {
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
  },
  astHeader: {
    height: '28px',
    backgroundColor: 'var(--color-ide-titlebar)',
    borderBottom: '1px solid var(--color-ide-border)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    flexShrink: 0,
  },
  divider: {
    width: '4px',
    backgroundColor: 'var(--color-ide-border)',
    cursor: 'col-resize',
    flexShrink: 0,
  },
  qaColumn: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
}

export default WorkspacePage

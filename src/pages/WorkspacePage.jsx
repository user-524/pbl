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
import { submitCodeForAnalysis } from '../services/submissionService.js'
import { submitAnswersForEvaluation } from '../services/qaService.js'
import { getReportById } from '../services/reportService.js'

function WorkspacePage() {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)
  const analysisResult = useSubmissionStore((s) => s.analysisResult)
  const setAnalysisResult = useSubmissionStore((s) => s.setAnalysisResult)
  const clearAnalysisResult = useSubmissionStore((s) => s.clearAnalysisResult)
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const initializeQaAnswers = useSubmissionStore((s) => s.initializeQaAnswers)
  const clearQaAnswers = useSubmissionStore((s) => s.clearQaAnswers)

  // 워크플로우 상태
  const [workflowStatus, setWorkflowStatus] = useState('idle')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qaErrorMessage, setQaErrorMessage] = useState('')
  const [reportData, setReportData] = useState(null)
  const [submissionId, setSubmissionId] = useState(null)
  const [totalScore, setTotalScore] = useState(null)

  // 패널 토글 상태
  const [showReport, setShowReport] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [showTestCase, setShowTestCase] = useState(false)

  // 에디터 분할 (좌우)
  const containerRef = useRef(null)
  const [splitRatio, setSplitRatio] = useState(55) // 코드 에디터 비율 %
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef(null)

  // AST 토글
  const [showAst, setShowAst] = useState(false)
  const [astData, setAstData] = useState(null)
  const debounceTimer = useRef(null)

  // 코드 변경 시 AST 갱신
  useEffect(() => {
    if (!showAst) return
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setAstData(parseCodeToAst(draft.raw_code || '', draft.language))
    }, 300)
    return () => clearTimeout(debounceTimer.current)
  }, [draft.raw_code, draft.language, showAst])

  // 드래그 분할
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

  // 코드 변경
  const handleCodeChange = (newCode) => {
    setDraft({ ...draft, raw_code: newCode || '' })
  }

  // 분석 실행
  const handleRunAnalysis = async () => {
    if (!draft.problem_title.trim() || !draft.raw_code.trim()) {
      return
    }
    try {
      setIsAnalyzing(true)
      setWorkflowStatus('analyzing')
      clearAnalysisResult()
      clearQaAnswers()
      setReportData(null)
      setTotalScore(null)
      setQaErrorMessage('')

      const result = await submitCodeForAnalysis(draft)
      setAnalysisResult(result)
      setSubmissionId(result.submission_id)
      initializeQaAnswers(result.generated_questions)
      setWorkflowStatus('qa')
    } catch (err) {
      console.error(err)
      setWorkflowStatus('idle')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // QA 제출
  const handleSubmitQA = async () => {
    if (!submissionId || !analysisResult) return
    const questions = analysisResult.generated_questions ?? []
    const answerList = questions.map((q) => ({
      question_id: q.question_id,
      answer_text: qaAnswers[q.question_id] || '',
    }))

    try {
      setIsSubmitting(true)
      setQaErrorMessage('')

      const evalResult = await submitAnswersForEvaluation({ submissionId, answers: answerList })
      const report = await getReportById(evalResult.report_id)
      setReportData(report)
      setTotalScore(report.total_score)
      setWorkflowStatus('completed')
      setShowReport(true)
    } catch (err) {
      setQaErrorMessage('답변 제출 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 에이전트가 생성한 코드 적용
  const handleApplyAgentCode = (code) => {
    setDraft({ ...draft, raw_code: code })
  }

  // 새 문제 시작
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
    setReportData(null)
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
        {/* 타이틀 바 */}
        {titleBar}

        {/* 메인 영역 */}
        <div
          ref={containerRef}
          style={{ ...styles.main, cursor: isDragging ? 'col-resize' : 'default' }}
        >
          {/* 드로어들 (absolute, 주 영역 위에 표시) */}
          {showTestCase && (
            <TestCaseDrawer onClose={() => setShowTestCase(false)} />
          )}

          {/* 왼쪽: 코드 에디터 (+ AST 토글) */}
          <div style={{ ...styles.editorColumn, width: `${splitRatio}%` }}>
            {/* 에디터 헤더 */}
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
              // AST 표시 시 에디터 + AST 상하 분할
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

          {/* 구분선 */}
          <div
            style={styles.divider}
            onMouseDown={handleDividerMouseDown}
          />

          {/* 오른쪽: Q&A 패널 */}
          <div style={{ ...styles.qaColumn, flex: 1 }}>
            <QASection
              analysisResult={analysisResult}
              onSubmit={handleSubmitQA}
              isSubmitting={isSubmitting}
              errorMessage={qaErrorMessage}
            />
          </div>
        </div>

        {/* 상태 바 */}
        <StatusBar
          language={draft.language}
          workflowStatus={workflowStatus}
          totalScore={totalScore}
        />
      </div>

      {/* 오버레이들 */}
      {showReport && (
        <ReportOverlay
          reportData={reportData}
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

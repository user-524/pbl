import { useState, useRef, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import TitleBar from '../components/layout/TitleBar.jsx'
import StatusBar from '../components/layout/StatusBar.jsx'
import QASection from '../components/panels/QASection.jsx'
import ReportOverlay from '../components/panels/ReportOverlay.jsx'
import AgentPanel from '../components/panels/AgentPanel.jsx'
import TestCaseDrawer from '../components/panels/TestCaseDrawer.jsx'
import ExecutionResultPanel from '../components/panels/ExecutionResultPanel.jsx'
import { parseCodeToAst } from '../utils/simpleAstParser.js'
import AstTreeViewer from '../components/ast/AstTreeViewer.jsx'
import useSubmissionStore from '../store/submissionStore.js'
import { useExecuteCode, useCreateSubmission, useSubmitAnswers } from '../hooks/useSubmissions.js'
import { useReport, useGenerateReport } from '../hooks/useReports.js'

function WorkspacePage() {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)
  const codeExecutionResult = useSubmissionStore((s) => s.codeExecutionResult)
  const clearCodeExecutionResult = useSubmissionStore((s) => s.clearCodeExecutionResult)
  const analysisResult = useSubmissionStore((s) => s.analysisResult)
  const clearAnalysisResult = useSubmissionStore((s) => s.clearAnalysisResult)
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const initializeQaAnswers = useSubmissionStore((s) => s.initializeQaAnswers)
  const clearQaAnswers = useSubmissionStore((s) => s.clearQaAnswers)

  // idle | executing | executed | analyzing | qa | qa_done | reporting | completed
  const [workflowStatus, setWorkflowStatus] = useState('idle')
  const [qaErrorMessage, setQaErrorMessage] = useState('')
  const [submissionId, setSubmissionId] = useState(null)
  const [reportId, setReportId] = useState(null)
  const [totalScore, setTotalScore] = useState(null)
  const [titleError, setTitleError] = useState(false)

  const [showReport, setShowReport] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [showTestCase, setShowTestCase] = useState(false)

  const containerRef = useRef(null)
  const [splitRatio, setSplitRatio] = useState(58)
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef(null)

  const [showAst, setShowAst] = useState(false)
  const [astData, setAstData] = useState(null)
  const [astHeight, setAstHeight] = useState(200)
  const [isAstDragging, setIsAstDragging] = useState(false)
  const astDragStartY = useRef(0)
  const astDragStartHeight = useRef(0)
  const debounceTimer = useRef(null)

  const { mutate: runCode, isPending: isExecuting } = useExecuteCode()
  const { mutate: createSubmission, isPending: isAnalyzing } = useCreateSubmission()
  const { mutate: doSubmitAnswers, isPending: isSubmitting } = useSubmitAnswers(submissionId)
  const { mutate: doGenerateReport } = useGenerateReport()
  const { data: reportData } = useReport(reportId, { enabled: !!reportId && workflowStatus === 'completed' })

  const qaActive = ['analyzing', 'qa', 'qa_done'].includes(workflowStatus)

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
    setSplitRatio(Math.min(80, Math.max(30, ratio)))
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

  const handleProblemChange = (field, value) => {
    setDraft({ ...draft, [field]: value })
    if (field === 'problem_title' && value.trim()) setTitleError(false)
  }

  // 1단계: 코드 실행 (문제 제목 필수)
  const handleRunCode = () => {
    if (!draft.problem_title.trim()) {
      setTitleError(true)
      return
    }
    if (!draft.raw_code.trim()) return

    clearCodeExecutionResult()
    setWorkflowStatus('executing')

    runCode(
      {
        language: draft.language,
        raw_code: draft.raw_code,
        test_cases: draft.test_cases,
      },
      {
        onSuccess: () => setWorkflowStatus('executed'),
        onError: () => setWorkflowStatus('idle'),
      }
    )
  }

  // 2단계: AI 질의응답 시작 (질문 생성)
  const handleStartQA = () => {
    if (!draft.problem_title.trim() || !draft.raw_code.trim()) return

    clearAnalysisResult()
    clearQaAnswers()
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
        onError: () => setWorkflowStatus('executed'),
      }
    )
  }

  // 3단계: Q&A 답변 제출
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
          setReportId(evalResult.report_id ?? null)
          setTotalScore(evalResult.total_score ?? null)
          setWorkflowStatus('qa_done')
        },
        onError: () => setQaErrorMessage('답변 제출 중 오류가 발생했습니다.'),
      }
    )
  }

  // 4단계: 리포트 생성 (AI 호출)
  const handleGenerateReport = () => {
    if (!submissionId) return

    setWorkflowStatus('reporting')

    doGenerateReport(
      { submission_id: submissionId },
      {
        onSuccess: (result) => {
          setReportId(result.report_id ?? reportId)
          setTotalScore(result.total_score ?? totalScore)
          setWorkflowStatus('completed')
          setShowReport(true)
        },
        onError: () => setWorkflowStatus('qa_done'),
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
    clearCodeExecutionResult()
    clearAnalysisResult()
    clearQaAnswers()
    setReportId(null)
    setSubmissionId(null)
    setWorkflowStatus('idle')
    setTotalScore(null)
    setShowReport(false)
    setTitleError(false)
    setQaErrorMessage('')
  }

  const handleAstDividerMouseDown = (e) => {
    e.preventDefault()
    setIsAstDragging(true)
    astDragStartY.current = e.clientY
    astDragStartHeight.current = astHeight
  }

  const handleAstMouseMove = useCallback((e) => {
    if (!isAstDragging) return
    const delta = astDragStartY.current - e.clientY
    setAstHeight(Math.min(600, Math.max(80, astDragStartHeight.current + delta)))
  }, [isAstDragging])

  const handleAstMouseUp = useCallback(() => setIsAstDragging(false), [])

  useEffect(() => {
    if (isAstDragging) {
      window.addEventListener('mousemove', handleAstMouseMove)
      window.addEventListener('mouseup', handleAstMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleAstMouseMove)
      window.removeEventListener('mouseup', handleAstMouseUp)
    }
  }, [isAstDragging, handleAstMouseMove, handleAstMouseUp])

  const handleNodeClick = (line) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line)
      editorRef.current.setPosition({ lineNumber: line, column: 1 })
      editorRef.current.focus()
    }
  }

  const titleBar = (
    <TitleBar
      workflowStatus={workflowStatus}
      isExecuting={isExecuting}
      hasProblemTitle={!!draft.problem_title.trim()}
      onRunCode={handleRunCode}
      onToggleAgent={() => setShowAgent((p) => !p)}
      showAgent={showAgent}
      onToggleTestCase={() => setShowTestCase((p) => !p)}
      showTestCase={showTestCase}
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

          {/* 에디터 컬럼 */}
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
              <div style={{ ...styles.editorAstSplit, cursor: isAstDragging ? 'ns-resize' : 'default' }}>
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
                <div
                  style={{ ...styles.astDivider, cursor: isAstDragging ? 'ns-resize' : 'ns-resize' }}
                  onMouseDown={handleAstDividerMouseDown}
                />
                <div style={{ ...styles.astHalf, height: `${astHeight}px` }}>
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

          {/* 우측 패널: 문제 정보 → 실행 결과 → Q&A */}
          <div style={{ ...styles.resultColumn, flex: 1 }}>
            <div style={styles.panelHeader}>
              <span style={styles.panelLabel}>
                {workflowStatus === 'idle' ? '문제 정보' : '실행 결과'}
              </span>
              {workflowStatus !== 'idle' && (
                <button style={styles.newProblemBtn} onClick={handleNewProblem}>
                  새 문제
                </button>
              )}
            </div>

            <div style={styles.rightPanelBody}>
              {workflowStatus === 'idle' ? (
                /* 문제 정보 입력 폼 */
                <div style={styles.problemForm}>
                  <p style={styles.problemFormHint}>
                    문제 정보를 입력한 후 코드를 실행할 수 있습니다.
                  </p>

                  <div style={styles.formField}>
                    <label style={styles.formLabel}>
                      문제 제목 <span style={styles.required}>*</span>
                    </label>
                    <input
                      style={{
                        ...styles.formInput,
                        ...(titleError ? styles.formInputError : {}),
                      }}
                      type="text"
                      placeholder="예: 피보나치 수열"
                      value={draft.problem_title}
                      onChange={(e) => handleProblemChange('problem_title', e.target.value)}
                    />
                    {titleError && (
                      <span style={styles.errorMsg}>문제 제목을 입력해 주세요.</span>
                    )}
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.formLabel}>문제 설명</label>
                    <textarea
                      style={styles.formTextarea}
                      placeholder="예: N번째 피보나치 수를 구하는 함수를 작성하시오."
                      value={draft.problem_description}
                      onChange={(e) => handleProblemChange('problem_description', e.target.value)}
                    />
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.formLabel}>언어</label>
                    <select
                      style={styles.formInput}
                      value={draft.language}
                      onChange={(e) => handleProblemChange('language', e.target.value)}
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* 실행 결과 + Q&A 영역 */
                <div style={styles.resultAndQA}>
                  {/* 실행 결과: Q&A 활성 시 최대 높이 고정 */}
                  <div style={qaActive ? styles.executionCompact : styles.executionFull}>
                    <ExecutionResultPanel
                      workflowStatus={workflowStatus}
                      codeExecutionResult={codeExecutionResult}
                      totalScore={totalScore}
                      onStartQA={handleStartQA}
                      onGenerateReport={handleGenerateReport}
                      onViewReport={() => setShowReport(true)}
                    />
                  </div>

                  {/* Q&A 패널 - analyzing/qa/qa_done 상태에서 직접 표시 */}
                  {qaActive && (
                    <QASection
                      analysisResult={analysisResult}
                      onSubmit={handleSubmitQA}
                      isSubmitting={isSubmitting}
                      errorMessage={qaErrorMessage}
                    />
                  )}
                </div>
              )}
            </div>
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
  resultColumn: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
    backgroundColor: 'var(--color-ide-sidebar)',
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
  rightPanelBody: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  /* 문제 정보 폼 */
  problemForm: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    overflowY: 'auto',
    flex: 1,
  },
  problemFormHint: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    margin: 0,
    padding: '8px 10px',
    backgroundColor: '#1a2a3a',
    borderRadius: '4px',
    border: '1px solid #1f4e79',
    lineHeight: 1.5,
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  formLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  required: {
    color: '#f44747',
  },
  formInput: {
    padding: '7px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    height: '34px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  formInputError: {
    borderColor: '#f44747',
    backgroundColor: '#3a2020',
  },
  formTextarea: {
    padding: '7px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    height: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    outline: 'none',
    boxSizing: 'border-box',
  },
  errorMsg: {
    color: '#f44747',
    fontSize: '11px',
  },
  /* 실행 결과 + Q&A */
  resultAndQA: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  executionFull: {
    flex: 1,
    overflow: 'hidden',
  },
  executionCompact: {
    maxHeight: '200px',
    flexShrink: 0,
    overflowY: 'auto',
    borderBottom: '1px solid var(--color-ide-border)',
  },
  newProblemBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text-dim)',
    padding: '2px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  /* 에디터 관련 */
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
    height: '4px',
    backgroundColor: 'var(--color-ide-border)',
    flexShrink: 0,
    cursor: 'ns-resize',
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
}

export default WorkspacePage

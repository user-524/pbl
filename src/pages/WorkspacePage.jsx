import { useState } from 'react'
import IDELayout from '../components/layout/IDELayout.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import EditorArea from '../components/layout/EditorArea.jsx'
import BottomPanel from '../components/layout/BottomPanel.jsx'
import useSubmissionStore from '../store/submissionStore.js'
import useHistoryStore from '../store/historyStore.js'
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
  const resetSubmissionFlow = useSubmissionStore((s) => s.resetSubmissionFlow)

  const addEntry = useHistoryStore((s) => s.addEntry)
  const updateEntry = useHistoryStore((s) => s.updateEntry)
  const activeEntryId = useHistoryStore((s) => s.activeEntryId)

  const [workflowStatus, setWorkflowStatus] = useState('idle')
  const [activeTab, setActiveTab] = useState('problem')
  const [panelHeight, setPanelHeight] = useState(35)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qaErrorMessage, setQaErrorMessage] = useState('')
  const [reportData, setReportData] = useState(null)
  const [submissionId, setSubmissionId] = useState(null)

  const [totalScore, setTotalScore] = useState(null)

  const handleCodeChange = (newCode) => {
    setDraft({ ...draft, raw_code: newCode })
  }

  const handleNewProblem = () => {
    resetSubmissionFlow()
    clearQaAnswers()
    setReportData(null)
    setSubmissionId(null)
    setWorkflowStatus('idle')
    setActiveTab('problem')
    setTotalScore(null)
    setQaErrorMessage('')
    addEntry({
      problem_title: '새 문제',
      problem_description: '',
      language: 'python',
      raw_code: '',
      test_cases: [{ input_data: '', expected_output: '' }],
    })
  }

  const handleRunAnalysis = async () => {
    if (!draft.problem_title.trim() || !draft.raw_code.trim()) {
      setActiveTab('problem')
      return
    }

    try {
      setIsAnalyzing(true)
      setWorkflowStatus('analyzing')
      clearAnalysisResult()
      clearQaAnswers()
      setReportData(null)
      setTotalScore(null)

      const entryId = activeEntryId || addEntry(draft)
      updateEntry(entryId, { draft: { ...draft } })

      const result = await submitCodeForAnalysis(draft)
      setAnalysisResult(result)
      setSubmissionId(result.submission_id)
      initializeQaAnswers(result.generated_questions)

      updateEntry(entryId, { analysisResult: result })

      setWorkflowStatus('qa')
      setActiveTab('result')
    } catch (err) {
      console.error(err)
      setWorkflowStatus('idle')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGoToQA = () => {
    setActiveTab('qa')
  }

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

      const evalResult = await submitAnswersForEvaluation({
        submissionId,
        answers: answerList,
      })

      const report = await getReportById(evalResult.report_id)
      setReportData(report)
      setTotalScore(report.total_score)
      setWorkflowStatus('completed')
      setActiveTab('report')

      if (activeEntryId) {
        updateEntry(activeEntryId, {
          total_score: report.total_score,
          qaAnswers: { ...qaAnswers },
        })
      }
    } catch (err) {
      setQaErrorMessage('답변 제출 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <IDELayout
      language={draft.language}
      workflowStatus={workflowStatus}
      totalScore={totalScore}
      sidebar={
        <Sidebar onNewProblem={handleNewProblem} />
      }
    >
      <EditorArea
        value={draft.raw_code}
        language={draft.language}
        onChange={handleCodeChange}
      />
      <BottomPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        panelHeight={panelHeight}
        onPanelHeightChange={setPanelHeight}
        isAnalyzing={isAnalyzing}
        isSubmitting={isSubmitting}
        qaErrorMessage={qaErrorMessage}
        reportData={reportData}
        analysisResult={analysisResult}
        onRunAnalysis={handleRunAnalysis}
        onGoToQA={handleGoToQA}
        onSubmitQA={handleSubmitQA}
        onNewProblem={handleNewProblem}
      />
    </IDELayout>
  )
}

export default WorkspacePage

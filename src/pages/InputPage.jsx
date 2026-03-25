import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSubmissionStore from '../store/submissionStore'
import CodeEditor from '../components/editor/CodeEditor'

function InputPage() {
  const navigate = useNavigate()

  const savedDraft = useSubmissionStore((state) => state.draft)
  const setDraft = useSubmissionStore((state) => state.setDraft)
  const clearAnalysisResult = useSubmissionStore((state) => state.clearAnalysisResult)
  const clearQaAnswers = useSubmissionStore((state) => state.clearQaAnswers)

  const [problemTitle, setProblemTitle] = useState(savedDraft.problem_title)
  const [problemDescription, setProblemDescription] = useState(savedDraft.problem_description)
  const [language, setLanguage] = useState(savedDraft.language)
  const [rawCode, setRawCode] = useState(savedDraft.raw_code)
  const [testCases, setTestCases] = useState(savedDraft.test_cases)

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases]
    updatedTestCases[index][field] = value
    setTestCases(updatedTestCases)
  }

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { input_data: '', expected_output: '' },
    ])
  }

  const handleRemoveTestCase = (index) => {
    if (testCases.length === 1) {
      alert('테스트 케이스는 최소 1개 필요합니다.')
      return
    }

    const updatedTestCases = testCases.filter((_, i) => i !== index)
    setTestCases(updatedTestCases)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!problemTitle.trim()) {
      alert('문제 제목을 입력해주세요.')
      return
    }

    if (!problemDescription.trim()) {
      alert('문제 설명을 입력해주세요.')
      return
    }

    if (!rawCode.trim()) {
      alert('코드를 입력해주세요.')
      return
    }

    const hasEmptyTestCase = testCases.some(
      (testCase) =>
        !testCase.input_data.trim() || !testCase.expected_output.trim()
    )

    if (hasEmptyTestCase) {
      alert('모든 테스트 케이스의 입력값과 기대 출력값을 채워주세요.')
      return
    }

    const draftData = {
      problem_title: problemTitle,
      problem_description: problemDescription,
      language,
      raw_code: rawCode,
      test_cases: testCases,
    }

    clearAnalysisResult()
    clearQaAnswers()
    setDraft(draftData)

    navigate('/analysis')
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>문제 및 코드 입력</h1>
        <p style={styles.description}>
          학생이 풀 문제와 코드를 입력하는 화면입니다.
        </p>

        <label style={styles.label}>문제 제목</label>
        <input
          style={styles.input}
          type="text"
          placeholder="예: 피보나치 수열"
          value={problemTitle}
          onChange={(e) => setProblemTitle(e.target.value)}
        />

        <label style={styles.label}>문제 설명</label>
        <textarea
          style={styles.textarea}
          placeholder="예: N번째 피보나치 수를 구하는 함수를 작성하시오."
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
        />

        <label style={styles.label}>언어 선택</label>
        <select
          style={styles.input}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>

        <label style={styles.label}>테스트 케이스</label>

        {testCases.map((testCase, index) => (
          <div key={index} style={styles.testCaseBox}>
            <p style={styles.testCaseTitle}>테스트 케이스 {index + 1}</p>

            <input
              style={styles.input}
              type="text"
              placeholder="입력값"
              value={testCase.input_data}
              onChange={(e) =>
                handleTestCaseChange(index, 'input_data', e.target.value)
              }
            />

            <input
              style={styles.input}
              type="text"
              placeholder="기대 출력값"
              value={testCase.expected_output}
              onChange={(e) =>
                handleTestCaseChange(index, 'expected_output', e.target.value)
              }
            />

            <button
              type="button"
              style={styles.removeButton}
              onClick={() => handleRemoveTestCase(index)}
            >
              이 테스트 케이스 삭제
            </button>
          </div>
        ))}

        <button
          type="button"
          style={styles.secondaryButton}
          onClick={handleAddTestCase}
        >
          테스트 케이스 추가
        </button>

        <label style={styles.label}>코드 입력</label>
        <CodeEditor
          language={language}
          value={rawCode}
          onChange={setRawCode}
        />

        <button style={styles.submitButton} type="submit">
          제출하고 분석 페이지로 이동
        </button>
      </form>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
  },
  description: {
    marginTop: '4px',
    marginBottom: '12px',
    color: '#555',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d0d7de',
    borderRadius: '10px',
  },
  textarea: {
    minHeight: '100px',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d0d7de',
    borderRadius: '10px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  testCaseBox: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fafafa',
  },
  testCaseTitle: {
    margin: 0,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: '4px',
    padding: '12px',
    border: '1px solid #2563eb',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    color: '#2563eb',
    fontSize: '15px',
    cursor: 'pointer',
  },
  removeButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitButton: {
    marginTop: '16px',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
  },
}

export default InputPage
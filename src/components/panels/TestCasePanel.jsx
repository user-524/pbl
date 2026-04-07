import useSubmissionStore from '../../store/submissionStore.js'
import Button from '../ui/Button.jsx'

function TestCasePanel({ onRunAnalysis, isAnalyzing }) {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)

  const testCases = draft.test_cases || [{ input_data: '', expected_output: '' }]

  const handleChange = (index, field, value) => {
    const updated = [...testCases]
    updated[index] = { ...updated[index], [field]: value }
    setDraft({ ...draft, test_cases: updated })
  }

  const handleAdd = () => {
    setDraft({
      ...draft,
      test_cases: [...testCases, { input_data: '', expected_output: '' }],
    })
  }

  const handleRemove = (index) => {
    if (testCases.length === 1) return
    setDraft({
      ...draft,
      test_cases: testCases.filter((_, i) => i !== index),
    })
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.title}>테스트 케이스</span>
        <div style={styles.actions}>
          <button style={styles.addBtn} onClick={handleAdd}>+ 추가</button>
          <Button
            onClick={onRunAnalysis}
            isLoading={isAnalyzing}
            disabled={isAnalyzing}
            style={{ height: '28px', fontSize: '12px', padding: '0 12px' }}
          >
            {isAnalyzing ? '분석 중...' : '▶ 분석 실행'}
          </Button>
        </div>
      </div>

      <div style={styles.list}>
        {testCases.map((tc, index) => (
          <div key={index} style={styles.caseRow}>
            <span style={styles.caseNum}>#{index + 1}</span>
            <input
              style={styles.input}
              placeholder="입력값"
              value={tc.input_data}
              onChange={(e) => handleChange(index, 'input_data', e.target.value)}
            />
            <span style={styles.arrow}>→</span>
            <input
              style={styles.input}
              placeholder="기대 출력값"
              value={tc.expected_output}
              onChange={(e) => handleChange(index, 'expected_output', e.target.value)}
            />
            <button
              style={styles.removeBtn}
              onClick={() => handleRemove(index)}
              disabled={testCases.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '8px 16px',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  title: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  addBtn: {
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text)',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  caseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  caseNum: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    width: '24px',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '5px 8px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    minWidth: 0,
  },
  arrow: {
    color: 'var(--color-ide-text-dim)',
    flexShrink: 0,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#f44747',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '2px 4px',
    flexShrink: 0,
  },
}

export default TestCasePanel

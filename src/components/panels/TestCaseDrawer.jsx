import useSubmissionStore from '../../store/submissionStore.js'

function TestCaseDrawer({ onClose }) {
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
    <div style={styles.drawer}>
      <div style={styles.header}>
        <span style={styles.title}>테스트 케이스</span>
        <div style={styles.headerActions}>
          <button style={styles.addBtn} onClick={handleAdd}>+ 추가</button>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>
      <div style={styles.body}>
        <div style={styles.columnHeaders}>
          <span style={styles.colLabel}>입력값</span>
          <span style={styles.colLabel}>기대 출력값</span>
        </div>
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
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#252526',
    borderBottom: '1px solid var(--color-ide-border)',
    zIndex: 100,
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    maxHeight: '240px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
  },
  title: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    fontWeight: '600',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 6px',
    lineHeight: 1,
  },
  body: {
    padding: '8px 16px 12px',
    overflowY: 'auto',
    maxHeight: '180px',
  },
  columnHeaders: {
    display: 'flex',
    gap: '8px',
    marginBottom: '6px',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  colLabel: {
    flex: 1,
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  caseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  caseNum: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
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
    fontFamily: 'monospace',
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
    fontSize: '12px',
    padding: '2px 4px',
    flexShrink: 0,
  },
}

export default TestCaseDrawer

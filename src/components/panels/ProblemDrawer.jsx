import useSubmissionStore from '../../store/submissionStore.js'

function ProblemDrawer({ onClose }) {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)

  const handleChange = (field, value) => {
    setDraft({ ...draft, [field]: value })
  }

  return (
    <div style={styles.drawer}>
      <div style={styles.header}>
        <span style={styles.title}>문제 정보</span>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div style={styles.body}>
        <div style={styles.field}>
          <label style={styles.label}>문제 제목</label>
          <input
            style={styles.input}
            type="text"
            placeholder="예: 피보나치 수열"
            value={draft.problem_title}
            onChange={(e) => handleChange('problem_title', e.target.value)}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>문제 설명</label>
          <textarea
            style={styles.textarea}
            placeholder="예: N번째 피보나치 수를 구하는 함수를 작성하시오."
            value={draft.problem_description}
            onChange={(e) => handleChange('problem_description', e.target.value)}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>언어</label>
          <select
            style={styles.input}
            value={draft.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>
        </div>
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
    padding: '12px 16px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '180px',
  },
  label: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    height: '34px',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    height: '60px',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.4',
  },
}

export default ProblemDrawer

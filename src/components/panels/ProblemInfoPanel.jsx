import useSubmissionStore from '../../store/submissionStore.js'
import Button from '../ui/Button.jsx'

function ProblemInfoPanel({ onRunAnalysis, isAnalyzing }) {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)

  const handleChange = (field, value) => {
    setDraft({ ...draft, [field]: value })
  }

  return (
    <div style={styles.container}>
      <div style={styles.column}>
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
        <div style={styles.fieldLarge}>
          <label style={styles.label}>문제 설명</label>
          <textarea
            style={styles.textarea}
            placeholder="예: N번째 피보나치 수를 구하는 함수를 작성하시오."
            value={draft.problem_description}
            onChange={(e) => handleChange('problem_description', e.target.value)}
          />
        </div>
        <div style={styles.bottomRow}>
          <div style={styles.fieldNarrow}>
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
          <div style={styles.btnArea}>
            <Button
              onClick={onRunAnalysis}
              isLoading={isAnalyzing}
              disabled={isAnalyzing}
              style={{ whiteSpace: 'nowrap', height: '36px', width: '100%' }}
            >
              {isAnalyzing ? '분석 중...' : '▶ 분석 실행'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '10px 16px',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLarge: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minHeight: '300px',
  },
  fieldNarrow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '130px',
  },
  bottomRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
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
    height: '36px',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    flex: 1,
    minHeight: '250px',
  },
  btnArea: {
    display: 'flex',
    alignItems: 'flex-end',
    flex: 1,
  },
}

export default ProblemInfoPanel

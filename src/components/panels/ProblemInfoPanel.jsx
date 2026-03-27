import useSubmissionStore from '../../store/submissionStore.js'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'

function ProblemInfoPanel({ onRunAnalysis, isAnalyzing }) {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)

  const handleChange = (field, value) => {
    setDraft({ ...draft, [field]: value })
  }

  return (
    <div style={styles.container}>
      <div style={styles.row}>
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
        <div style={styles.fieldWide}>
          <label style={styles.label}>문제 설명</label>
          <input
            style={styles.input}
            type="text"
            placeholder="예: N번째 피보나치 수를 구하는 함수를 작성하시오."
            value={draft.problem_description}
            onChange={(e) => handleChange('problem_description', e.target.value)}
          />
        </div>
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
            style={{ whiteSpace: 'nowrap', height: '36px' }}
          >
            {isAnalyzing ? '분석 중...' : '▶ 분석 실행'}
          </Button>
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
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    flexWrap: 'wrap',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '160px',
    flex: 1,
  },
  fieldWide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 2,
    minWidth: '200px',
  },
  fieldNarrow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '130px',
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
  btnArea: {
    display: 'flex',
    alignItems: 'flex-end',
  },
}

export default ProblemInfoPanel

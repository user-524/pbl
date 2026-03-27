import { useState } from 'react'
import useSubmissionStore from '../../store/submissionStore.js'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'

function QAPanel({ onSubmit, isSubmitting, errorMessage }) {
  const analysisResult = useSubmissionStore((s) => s.analysisResult)
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const setQaAnswer = useSubmissionStore((s) => s.setQaAnswer)

  const [currentIndex, setCurrentIndex] = useState(0)

  const questions = analysisResult?.generated_questions ?? []

  if (questions.length === 0) {
    return (
      <div style={styles.center}>
        <p style={styles.empty}>분석을 먼저 실행해주세요.</p>
      </div>
    )
  }

  const current = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1

  return (
    <div style={styles.container}>
      <div style={styles.progress}>
        <span style={styles.progressText}>
          질문 {currentIndex + 1} / {questions.length}
        </span>
        <div style={styles.dots}>
          {questions.map((_, i) => (
            <button
              key={i}
              style={{
                ...styles.dot,
                ...(i === currentIndex ? styles.dotActive : {}),
                ...(qaAnswers[questions[i].question_id]?.trim() ? styles.dotAnswered : {}),
              }}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      </div>

      <div style={styles.questionBox}>
        <span style={styles.qType}>{current.type}</span>
        <p style={styles.qText}>{current.text}</p>
      </div>

      <textarea
        style={styles.textarea}
        placeholder="질문에 대한 설명을 작성해보세요."
        value={qaAnswers[current.question_id] || ''}
        onChange={(e) => setQaAnswer(current.question_id, e.target.value)}
      />

      {errorMessage && <p style={styles.error}>{errorMessage}</p>}

      <div style={styles.btnRow}>
        <Button
          variant="secondary"
          onClick={() => setCurrentIndex((p) => p - 1)}
          disabled={isFirst}
          style={{ flex: 1, ...btnStyle }}
        >
          ← 이전
        </Button>

        {!isLast ? (
          <Button
            onClick={() => setCurrentIndex((p) => p + 1)}
            style={{ flex: 1, ...btnStyle }}
          >
            다음 →
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ flex: 1, ...btnStyle }}
          >
            {isSubmitting ? '채점 중...' : '답변 제출 ✓'}
          </Button>
        )}
      </div>
    </div>
  )
}

const btnStyle = { height: '32px', fontSize: '13px' }

const styles = {
  container: {
    padding: '8px 16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  empty: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
  },
  progress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    flexShrink: 0,
  },
  dots: {
    display: 'flex',
    gap: '6px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '1px solid var(--color-ide-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  dotActive: {
    backgroundColor: '#007acc',
    borderColor: '#007acc',
  },
  dotAnswered: {
    backgroundColor: '#4ec9b0',
    borderColor: '#4ec9b0',
  },
  questionBox: {
    backgroundColor: '#2d2d2d',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '6px',
    padding: '10px 14px',
  },
  qType: {
    color: '#dcdcaa',
    fontSize: '11px',
    fontWeight: '600',
  },
  qText: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    margin: '6px 0 0 0',
    lineHeight: '1.5',
  },
  textarea: {
    flex: 1,
    minHeight: '60px',
    padding: '8px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  error: {
    color: '#f44747',
    fontSize: '12px',
    margin: 0,
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
  },
}

export default QAPanel

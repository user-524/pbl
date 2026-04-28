import { useState } from 'react'
import useSubmissionStore from '../../store/submissionStore.js'

function QASection({ onSubmit, isSubmitting, errorMessage, analysisResult }) {
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const setQaAnswer = useSubmissionStore((s) => s.setQaAnswer)
  const [currentIndex, setCurrentIndex] = useState(0)

  const questions = analysisResult?.generated_questions ?? []
  const answeredCount = questions.filter((q) => qaAnswers[q.question_id] != null).length

  if (questions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>💬 AI 질의응답</span>
        </div>
        <div style={styles.emptyBody}>
          <p style={styles.emptyText}>질문을 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  const current = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const choices = current.choices ?? []

  return (
    <div style={styles.container}>
      {/* 섹션 헤더 */}
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>💬 AI 질의응답</span>
        <span style={styles.progress}>{answeredCount}/{questions.length} 답변</span>
      </div>

      {/* 질문 번호 네비게이션 */}
      <div style={styles.navRow}>
        {questions.map((q, i) => {
          const answered = qaAnswers[q.question_id] != null
          return (
            <button
              key={i}
              style={{
                ...styles.navDot,
                ...(i === currentIndex ? styles.navDotActive : {}),
                ...(answered && i !== currentIndex ? styles.navDotAnswered : {}),
              }}
              onClick={() => setCurrentIndex(i)}
              title={`Q${i + 1}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* 채팅 스타일 본문 */}
      <div style={styles.chatBody}>
        <div style={styles.aiMsg}>
          <div style={styles.aiAvatar}>AI</div>
          <div style={styles.aiContent}>
            <span style={styles.qTypeBadge}>{current.type}</span>
            <p style={styles.qText}>{current.text}</p>
          </div>
        </div>

        <div style={styles.choices}>
          {choices.length === 0 ? (
            <p style={styles.noChoices}>객관식 옵션이 제공되지 않았습니다.</p>
          ) : (
            choices.map((choice) => {
              const selected = qaAnswers[current.question_id] === choice.number
              return (
                <label
                  key={choice.number}
                  style={{ ...styles.choiceLabel, ...(selected ? styles.choiceLabelSelected : {}) }}
                >
                  <input
                    type="radio"
                    name={`q-${current.question_id}`}
                    value={choice.number}
                    checked={selected}
                    onChange={() => setQaAnswer(current.question_id, choice.number)}
                    style={styles.radio}
                  />
                  <span style={styles.choiceNum}>{choice.number + 1}.</span>
                  <span style={styles.choiceText}>{choice.text}</span>
                </label>
              )
            })
          )}
        </div>
      </div>

      {errorMessage && <p style={styles.error}>{errorMessage}</p>}

      {/* 이전 / 다음 / 제출 */}
      <div style={styles.footer}>
        <button
          style={{
            ...styles.navBtn,
            opacity: isFirst ? 0.4 : 1,
            cursor: isFirst ? 'not-allowed' : 'pointer',
          }}
          onClick={() => !isFirst && setCurrentIndex((p) => p - 1)}
          disabled={isFirst}
        >
          ← 이전
        </button>

        {!isLast ? (
          <button style={styles.nextBtn} onClick={() => setCurrentIndex((p) => p + 1)}>
            다음 →
          </button>
        ) : (
          <button
            style={{
              ...styles.submitBtn,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span style={styles.spinner} />
                채점 중...
              </>
            ) : (
              '✓ 답변 제출'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    borderTop: '1px solid var(--color-ide-border)',
    minHeight: 0,
  },
  sectionHeader: {
    height: '36px',
    backgroundColor: '#1a2a3a',
    borderBottom: '1px solid var(--color-ide-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 14px',
    flexShrink: 0,
  },
  sectionTitle: {
    color: '#4fc3f7',
    fontSize: '12px',
    fontWeight: '600',
  },
  progress: {
    color: '#4ec9b0',
    fontSize: '11px',
    fontWeight: '600',
  },
  navRow: {
    display: 'flex',
    gap: '6px',
    padding: '8px 14px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
    flexWrap: 'wrap',
  },
  navDot: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: '1px solid var(--color-ide-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  navDotActive: {
    backgroundColor: '#007acc',
    borderColor: '#007acc',
    color: '#fff',
  },
  navDotAnswered: {
    backgroundColor: '#4ec9b0',
    borderColor: '#4ec9b0',
    color: '#1e1e1e',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  aiMsg: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0e639c',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiContent: {
    flex: 1,
    backgroundColor: '#2a2d2e',
    borderRadius: '0 8px 8px 8px',
    padding: '8px 12px',
    border: '1px solid var(--color-ide-border)',
  },
  qTypeBadge: {
    display: 'block',
    color: '#dcdcaa',
    fontSize: '10px',
    fontWeight: '600',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  qText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    margin: 0,
    lineHeight: 1.6,
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    paddingLeft: '38px',
  },
  noChoices: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
  },
  choiceLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid var(--color-ide-border)',
    backgroundColor: '#3c3c3c',
    cursor: 'pointer',
    color: 'var(--color-ide-text)',
    fontSize: '12px',
    lineHeight: 1.4,
  },
  choiceLabelSelected: {
    backgroundColor: '#094771',
    borderColor: '#007acc',
  },
  radio: {
    marginTop: '2px',
    flexShrink: 0,
    accentColor: '#007acc',
  },
  choiceNum: {
    color: '#007acc',
    fontWeight: '700',
    flexShrink: 0,
    fontSize: '11px',
    minWidth: '16px',
  },
  choiceText: { flex: 1 },
  error: {
    color: '#f44747',
    fontSize: '12px',
    margin: '0 14px 4px',
    flexShrink: 0,
  },
  footer: {
    display: 'flex',
    gap: '8px',
    padding: '8px 14px',
    borderTop: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  navBtn: {
    flex: 1,
    padding: '7px',
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text)',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  nextBtn: {
    flex: 2,
    padding: '7px',
    background: '#0e639c',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px',
    background: '#4ec9b0',
    border: 'none',
    color: '#1e1e1e',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(0,0,0,0.3)',
    borderTop: '2px solid #1e1e1e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBody: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    margin: 0,
  },
}

export default QASection

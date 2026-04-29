import { useEffect, useMemo, useRef } from 'react'
import useSubmissionStore from '../../store/submissionStore.js'

/**
 * Chat-timeline Q&A panel.
 * AI questions appear as left bubbles, user choices as right bubbles.
 * Questions are revealed sequentially: only after answering Q_n does Q_{n+1} appear.
 * When the last question is answered, onAllAnswered() fires automatically.
 */
function QASection({ analysisResult, onAllAnswered, isSubmitting, errorMessage }) {
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const setQaAnswer = useSubmissionStore((s) => s.setQaAnswer)
  const scrollRef = useRef(null)
  const allAnsweredFiredRef = useRef(false)

  const questions = useMemo(
    () => analysisResult?.generated_questions ?? [],
    [analysisResult]
  )
  const totalCount = questions.length

  // Find the index of the first unanswered question (or totalCount if all answered).
  const currentIndex = useMemo(() => {
    for (let i = 0; i < questions.length; i++) {
      if (qaAnswers[questions[i].question_id] == null) return i
    }
    return questions.length
  }, [questions, qaAnswers])

  const answeredCount = totalCount - (currentIndex < totalCount ? totalCount - currentIndex : 0)

  // Auto-fire onAllAnswered exactly once when every question gains an answer.
  useEffect(() => {
    if (totalCount === 0) return
    if (currentIndex < totalCount) {
      allAnsweredFiredRef.current = false
      return
    }
    if (!allAnsweredFiredRef.current) {
      allAnsweredFiredRef.current = true
      onAllAnswered?.()
    }
  }, [currentIndex, totalCount, onAllAnswered])

  // Auto-scroll to bottom whenever a new turn appears.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [currentIndex, totalCount, isSubmitting])

  if (totalCount === 0) {
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

  // Visible questions: all answered ones + the current unanswered one.
  const visibleCount = Math.min(currentIndex + 1, totalCount)
  const visible = questions.slice(0, visibleCount)
  const allAnswered = currentIndex >= totalCount

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>💬 AI 질의응답</span>
        <span style={styles.progress}>{answeredCount}/{totalCount} 답변</span>
      </div>

      <div ref={scrollRef} style={styles.chatBody}>
        {visible.map((q, idx) => {
          const selectedNumber = qaAnswers[q.question_id]
          const isLocked = selectedNumber != null
          const choices = q.choices ?? []
          const selectedChoice = choices.find((c) => c.number === selectedNumber)

          return (
            <div key={q.question_id ?? idx} style={styles.turnGroup}>
              {/* AI question bubble (left) */}
              <div style={styles.aiMsg}>
                <div style={styles.aiAvatar}>AI</div>
                <div style={styles.aiContent}>
                  <span style={styles.qIndex}>Q{idx + 1}</span>
                  {q.type && <span style={styles.qTypeBadge}>{q.type}</span>}
                  <p style={styles.qText}>{q.text}</p>
                </div>
              </div>

              {/* Choices (only for the current unanswered question) */}
              {!isLocked && (
                <div style={styles.choices}>
                  {choices.length === 0 ? (
                    <p style={styles.noChoices}>객관식 옵션이 제공되지 않았습니다.</p>
                  ) : (
                    choices.map((choice) => (
                      <button
                        key={choice.number}
                        type="button"
                        style={styles.choiceBtn}
                        onClick={() => setQaAnswer(q.question_id, choice.number)}
                        disabled={isSubmitting}
                      >
                        <span style={styles.choiceNum}>{choice.number + 1}.</span>
                        <span style={styles.choiceText}>{choice.text}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* User answer bubble (right) */}
              {isLocked && selectedChoice && (
                <div style={styles.userMsg}>
                  <div style={styles.userContent}>
                    <span style={styles.userChoiceNum}>{selectedChoice.number + 1}.</span>
                    <span style={styles.userChoiceText}>{selectedChoice.text}</span>
                  </div>
                  <div style={styles.userAvatar}>나</div>
                </div>
              )}
            </div>
          )
        })}

        {/* All-answered footer message */}
        {allAnswered && (
          <div style={styles.completeBanner}>
            {isSubmitting ? (
              <>
                <span style={styles.spinner} />
                14개 답변 채점 중...
              </>
            ) : (
              <>✓ 모든 답변이 완료되었습니다. 우측 상단의 <strong>리포트 생성</strong> 버튼을 눌러주세요.</>
            )}
          </div>
        )}
      </div>

      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
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
  chatBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    scrollBehavior: 'smooth',
  },
  turnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  /* AI (left) */
  aiMsg: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    maxWidth: '85%',
    alignSelf: 'flex-start',
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
    backgroundColor: '#2a2d2e',
    borderRadius: '0 12px 12px 12px',
    padding: '8px 12px',
    border: '1px solid var(--color-ide-border)',
  },
  qIndex: {
    display: 'inline-block',
    color: '#4fc3f7',
    fontSize: '10px',
    fontWeight: '700',
    marginRight: '6px',
    fontFamily: 'monospace',
  },
  qTypeBadge: {
    display: 'inline-block',
    color: '#dcdcaa',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  qText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    margin: '4px 0 0',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  /* Choices (under current question) */
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingLeft: '38px',
  },
  noChoices: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
  },
  choiceBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--color-ide-border)',
    backgroundColor: '#3c3c3c',
    cursor: 'pointer',
    color: 'var(--color-ide-text)',
    fontSize: '12px',
    lineHeight: 1.4,
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  choiceNum: {
    color: '#007acc',
    fontWeight: '700',
    flexShrink: 0,
    fontSize: '11px',
    minWidth: '16px',
  },
  choiceText: { flex: 1 },
  /* User (right) */
  userMsg: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#4ec9b0',
    color: '#1e1e1e',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userContent: {
    backgroundColor: '#094771',
    border: '1px solid #007acc',
    borderRadius: '12px 0 12px 12px',
    padding: '8px 12px',
    display: 'flex',
    gap: '6px',
    color: '#ffffff',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  userChoiceNum: {
    color: '#9cdcfe',
    fontWeight: '700',
    flexShrink: 0,
  },
  userChoiceText: { flex: 1 },
  /* Complete banner */
  completeBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#1a3a2a',
    border: '1px solid #4ec9b0',
    borderRadius: '6px',
    color: '#4ec9b0',
    fontSize: '12px',
    fontWeight: '600',
  },
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(78,201,176,0.3)',
    borderTop: '2px solid #4ec9b0',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  error: {
    color: '#f44747',
    fontSize: '12px',
    margin: '0 14px 8px',
    flexShrink: 0,
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

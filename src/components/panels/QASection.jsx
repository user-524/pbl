import { useEffect, useMemo, useRef, useState } from 'react'
import useSubmissionStore from '../../store/submissionStore.js'

const TYPE_LABELS = {
  Q03_CODE_EXPLAIN: '코드 설명',
  Q04_TIME_COMPLEXITY: '시간 복잡도',
  Q05_SPACE_COMPLEXITY: '공간 복잡도',
  Q06_DATA_STRUCTURE: '자료구조',
  Q08_BUG_SPOT: '버그 탐색',
  Q09_FLOW_ANALYSIS: '실행 흐름',
  Q10_ALGORITHM_ID: '알고리즘 패턴',
  Q11_RECURSION_ANALYSIS: '재귀 분석',
  Q12_TRADEOFF: '트레이드오프',
  Q13_CODE_QUALITY: '코드 품질',
}

const BLOOM_COLORS = {
  '이해 (Understand)': '#4fc3f7',
  '적용 (Apply)': '#dcdcaa',
  '분석 (Analyze)': '#ce9178',
  '평가 (Evaluate)': '#c586c0',
}

function QASection({ analysisResult, onAllAnswered, isSubmitting, errorMessage }) {
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const setQaAnswer = useSubmissionStore((s) => s.setQaAnswer)
  const scrollRef = useRef(null)
  const allAnsweredFiredRef = useRef(false)
  const [openExplanations, setOpenExplanations] = useState({})

  const questions = useMemo(
    () => analysisResult?.generated_questions ?? [],
    [analysisResult]
  )

  const totalCount = questions.length

  const currentIndex = useMemo(() => {
    for (let i = 0; i < questions.length; i++) {
      if (qaAnswers[questions[i].question_id] == null) return i
    }
    return questions.length
  }, [questions, qaAnswers])

  const answeredCount = currentIndex < totalCount ? currentIndex : totalCount

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

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [currentIndex, totalCount, isSubmitting])

  const toggleExplanation = (questionId) => {
    setOpenExplanations((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  if (totalCount === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>🧠 코드 이해 퀴즈</span>
        </div>
        <div style={styles.emptyBody}>
          <p style={styles.emptyText}>질문을 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  const visibleCount = Math.min(currentIndex + 1, totalCount)
  const visible = questions.slice(0, visibleCount)
  const allAnswered = currentIndex >= totalCount

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>🧠 코드 이해 퀴즈</span>
        <span style={styles.progress}>{answeredCount}/{totalCount} 완료</span>
      </div>

      <div ref={scrollRef} style={styles.chatBody}>
        {visible.map((q, idx) => {
          const selectedNumber = qaAnswers[q.question_id]
          const isLocked = selectedNumber != null
          const rawChoices = q.choices ?? q.options ?? []
          const choices = rawChoices.map((c, i) => ({
            number: c.number ?? c.option_number ?? i,
            text: c.text ?? c.option_text ?? c.content ?? c.label ?? String(c),
          }))

          const selectedChoice = choices.find((c) => c.number === selectedNumber)
          const correctNumber = q.answer_key
          const isCorrect = isLocked && selectedNumber === correctNumber
          const wrongReason =
            !isCorrect && isLocked
              ? q.wrong_reasons?.[String(selectedNumber)]
              : null
          const correctChoice = choices.find((c) => c.number === correctNumber)
          const bloomColor = BLOOM_COLORS[q.bloom_level] ?? '#888'
          const typeLabel = TYPE_LABELS[q.type] ?? q.type ?? ''
          const isExplOpen = openExplanations[q.question_id] ?? false

          return (
            <div key={q.question_id ?? idx} style={styles.turnGroup}>
              {/* AI question bubble */}
              <div style={styles.aiMsg}>
                <div style={styles.aiAvatar}>AI</div>
                <div style={styles.aiContent}>
                  <div style={styles.qMeta}>
                    <span style={styles.qIndex}>Q{idx + 1}</span>
                    {typeLabel && (
                      <span style={styles.qTypeBadge}>{typeLabel}</span>
                    )}
                    {q.bloom_level && (
                      <span style={{ ...styles.bloomBadge, color: bloomColor, borderColor: bloomColor }}>
                        {q.bloom_level}
                      </span>
                    )}
                  </div>
                  <p style={styles.qText}>{q.text}</p>
                </div>
              </div>

              {/* Choices — only for the current unanswered question */}
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
                        <span style={styles.choiceNum}>{choice.number}.</span>
                        <span style={styles.choiceText}>{choice.text}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* User answer bubble */}
              {isLocked && selectedChoice && (
                <div style={styles.userMsg}>
                  <div
                    style={{
                      ...styles.userContent,
                      borderColor: isCorrect ? '#4ec9b0' : '#f44747',
                      backgroundColor: isCorrect ? '#0d3d2a' : '#3d0d0d',
                    }}
                  >
                    <span style={styles.userChoiceNum}>{selectedChoice.number}.</span>
                    <span style={styles.userChoiceText}>{selectedChoice.text}</span>
                    <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  <div
                    style={{
                      ...styles.userAvatar,
                      backgroundColor: isCorrect ? '#4ec9b0' : '#f44747',
                    }}
                  >
                    나
                  </div>
                </div>
              )}

              {/* AI feedback bubble */}
              {isLocked && (
                <div style={styles.aiMsg}>
                  <div style={styles.aiAvatar}>AI</div>
                  <div
                    style={{
                      ...styles.aiFeedback,
                      borderColor: isCorrect ? '#4ec9b0' : '#f44747',
                    }}
                  >
                    {isCorrect ? (
                      <p style={{ ...styles.feedbackResult, color: '#4ec9b0' }}>
                        ✓ 정답입니다!
                      </p>
                    ) : (
                      <>
                        <p style={{ ...styles.feedbackResult, color: '#f44747' }}>
                          ✗ 오답입니다.
                        </p>
                        {wrongReason && (
                          <p style={styles.wrongReason}>{wrongReason}</p>
                        )}
                        {correctChoice && (
                          <p style={styles.correctHint}>
                            정답:{' '}
                            <strong style={{ color: '#4ec9b0' }}>
                              {correctChoice.number}. {correctChoice.text}
                            </strong>
                          </p>
                        )}
                      </>
                    )}

                    {/* Explanation toggle */}
                    {q.explanation && (
                      <>
                        <button
                          type="button"
                          style={styles.explToggleBtn}
                          onClick={() => toggleExplanation(q.question_id)}
                        >
                          {isExplOpen ? '▲ 해설 닫기' : '▼ 해설 보기'}
                        </button>
                        {isExplOpen && (
                          <div style={styles.explanationBox}>
                            <p style={styles.explanationText}>{q.explanation}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* All-answered footer */}
        {allAnswered && (
          <div style={styles.completeBanner}>
            {isSubmitting ? (
              <>
                <span style={styles.spinner} />
                답변 채점 중...
              </>
            ) : (
              <>✓ 모든 질문에 답변했습니다. 우측 상단의 <strong>리포트 생성</strong> 버튼을 눌러주세요.</>
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
    maxWidth: '90%',
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
  aiFeedback: {
    backgroundColor: '#1e2021',
    borderRadius: '0 12px 12px 12px',
    padding: '8px 12px',
    border: '1px solid',
    minWidth: '160px',
  },
  qMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '2px',
  },
  qIndex: {
    color: '#4fc3f7',
    fontSize: '10px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  qTypeBadge: {
    display: 'inline-block',
    backgroundColor: '#007acc22',
    border: '1px solid #007acc55',
    color: '#9cdcfe',
    fontSize: '10px',
    fontWeight: '600',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  bloomBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '600',
    padding: '1px 6px',
    borderRadius: '4px',
    border: '1px solid',
    opacity: 0.85,
  },
  qText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    margin: '4px 0 0',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  feedbackResult: {
    margin: '0 0 4px',
    fontSize: '13px',
    fontWeight: '700',
  },
  wrongReason: {
    margin: '4px 0',
    color: '#f49090',
    fontSize: '12px',
    lineHeight: 1.5,
  },
  correctHint: {
    margin: '4px 0',
    color: '#ccc',
    fontSize: '12px',
    lineHeight: 1.5,
  },
  explToggleBtn: {
    marginTop: '8px',
    display: 'block',
    backgroundColor: 'transparent',
    border: '1px solid #555',
    borderRadius: '4px',
    color: '#9cdcfe',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  explanationBox: {
    marginTop: '8px',
    padding: '8px 10px',
    backgroundColor: '#252526',
    borderLeft: '3px solid #007acc',
    borderRadius: '0 4px 4px 0',
  },
  explanationText: {
    margin: 0,
    color: '#d4d4d4',
    fontSize: '12px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  /* Choices */
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
    transition: 'background-color 0.15s',
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
    color: '#1e1e1e',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userContent: {
    border: '1px solid',
    borderRadius: '12px 0 12px 12px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
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
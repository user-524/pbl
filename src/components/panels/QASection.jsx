import { useState } from 'react'
import useSubmissionStore from '../../store/submissionStore.js'

function ProblemInfoPanel({ onClose }) {
  const draft = useSubmissionStore((s) => s.draft)
  const setDraft = useSubmissionStore((s) => s.setDraft)

  const handleChange = (field, value) => {
    setDraft({ ...draft, [field]: value })
  }

  return (
    <div style={styles.problemPanel}>
      <div style={styles.problemHeader}>
        <span style={styles.problemTitle}>문제 정보</span>
        <button style={styles.problemCloseBtn} onClick={onClose}>✕</button>
      </div>
      <div style={styles.problemBody}>
        <div style={styles.problemField}>
          <label style={styles.fieldLabel}>문제 제목</label>
          <input
            style={styles.fieldInput}
            type="text"
            placeholder="예: 피보나치 수열"
            value={draft.problem_title}
            onChange={(e) => handleChange('problem_title', e.target.value)}
          />
        </div>
        <div style={styles.problemField}>
          <label style={styles.fieldLabel}>문제 설명</label>
          <textarea
            style={styles.fieldTextarea}
            placeholder="예: N번째 피보나치 수를 구하는 함수를 작성하시오."
            value={draft.problem_description}
            onChange={(e) => handleChange('problem_description', e.target.value)}
          />
        </div>
        <div style={styles.problemField}>
          <label style={styles.fieldLabel}>언어</label>
          <select
            style={styles.fieldInput}
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

function QASection({ onSubmit, isSubmitting, errorMessage, analysisResult }) {
  const qaAnswers = useSubmissionStore((s) => s.qaAnswers)
  const setQaAnswer = useSubmissionStore((s) => s.setQaAnswer)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showProblemInfo, setShowProblemInfo] = useState(false)

  const questions = analysisResult?.generated_questions ?? []

  const qaContent = questions.length === 0 ? (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>💬</div>
      <p style={styles.emptyTitle}>Q&A 세션</p>
      <p style={styles.emptyText}>
        코드를 작성하고 상단의 <strong style={styles.strong}>▶ 실행</strong> 버튼을 눌러
        분석을 시작하면 질문이 생성됩니다.
      </p>
    </div>
  ) : (() => {
    const current = questions[currentIndex]
    const isFirst = currentIndex === 0
    const isLast = currentIndex === questions.length - 1
    const choices = current.choices ?? []

    return (
      <div style={styles.qaContent}>
        {/* 헤더 */}
        <div style={styles.header}>
          <span style={styles.headerTitle}>질문 & 답변</span>
          <span style={styles.headerCount}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* 질문 목록 네비게이션 */}
        <div style={styles.questionNav}>
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
                title={`질문 ${i + 1}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {/* 현재 질문 */}
        <div style={styles.questionBox}>
          <div style={styles.questionMeta}>
            <span style={styles.qType}>{current.type}</span>
            <span style={styles.qNum}>Q{currentIndex + 1}</span>
          </div>
          <p style={styles.qText}>{current.text}</p>
        </div>

        {/* 라디오 버튼 선택지 */}
        <div style={styles.answerSection}>
          <label style={styles.answerLabel}>선택지</label>
          {choices.length === 0 ? (
            <p style={styles.noChoices}>객관식 옵션이 제공되지 않았습니다.</p>
          ) : (
            <div style={styles.choiceList}>
              {choices.map((choice) => {
                const selected = qaAnswers[current.question_id] === choice.number
                return (
                  <label
                    key={choice.number}
                    style={{ ...styles.choiceLabel, ...(selected ? styles.choiceLabelSelected : {}) }}
                  >
                    <input
                      type="radio"
                      name={`question-${current.question_id}`}
                      value={choice.number}
                      checked={selected}
                      onChange={() => setQaAnswer(current.question_id, choice.number)}
                      style={styles.radioInput}
                    />
                    <span style={styles.choiceNumber}>{choice.number + 1}.</span>
                    <span style={styles.choiceText}>{choice.text}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {errorMessage && <p style={styles.error}>{errorMessage}</p>}

        {/* 이전/다음/제출 버튼 */}
        <div style={styles.btnRow}>
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
            <button
              style={styles.nextBtn}
              onClick={() => setCurrentIndex((p) => p + 1)}
            >
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

        {/* 전체 질문 요약 */}
        <div style={styles.summary}>
          <p style={styles.summaryTitle}>전체 질문 목록</p>
          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                ...styles.summaryItem,
                ...(i === currentIndex ? styles.summaryItemActive : {}),
              }}
              onClick={() => setCurrentIndex(i)}
            >
              <span style={styles.summaryNum}>Q{i + 1}</span>
              <span style={styles.summaryType}>[{q.type}]</span>
              <span style={styles.summaryText}>{q.text}</span>
              {qaAnswers[q.question_id] != null && (
                <span style={styles.answeredBadge}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  })()

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.qaArea, flex: showProblemInfo ? '0 0 50%' : 1 }}>
        {qaContent}
      </div>

      <div style={styles.toggleBar}>
        <button
          style={{
            ...styles.toggleBtn,
            ...(showProblemInfo ? styles.toggleBtnActive : {}),
          }}
          onClick={() => setShowProblemInfo((p) => !p)}
        >
          {showProblemInfo ? '▼' : '▲'} 문제 정보
        </button>
      </div>

      {showProblemInfo && (
        <div style={styles.problemWrapper}>
          <ProblemInfoPanel onClose={() => setShowProblemInfo(false)} />
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'var(--color-ide-sidebar)',
  },
  qaArea: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  qaContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  toggleBar: {
    flexShrink: 0,
    borderTop: '1px solid var(--color-ide-border)',
    backgroundColor: 'var(--color-ide-titlebar)',
    padding: '0',
  },
  toggleBtn: {
    width: '100%',
    padding: '7px 16px',
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    letterSpacing: '0.3px',
  },
  toggleBtnActive: {
    color: '#007acc',
    backgroundColor: 'var(--color-ide-active)',
  },
  problemWrapper: {
    flex: '0 0 50%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid var(--color-ide-border)',
  },
  problemPanel: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#252526',
  },
  problemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  problemTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    fontWeight: '600',
  },
  problemCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 4px',
    lineHeight: 1,
  },
  problemBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  problemField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldInput: {
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    height: '34px',
    boxSizing: 'border-box',
  },
  fieldTextarea: {
    padding: '6px 10px',
    fontSize: '13px',
    backgroundColor: '#3c3c3c',
    border: '1px solid var(--color-ide-border)',
    borderRadius: '4px',
    color: 'var(--color-ide-text)',
    height: '72px',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    boxSizing: 'border-box',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '12px',
  },
  emptyIcon: { fontSize: '40px' },
  emptyTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  emptyText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    textAlign: 'center',
    lineHeight: '1.6',
    margin: 0,
  },
  strong: { color: '#4ec9b0' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  headerTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    fontWeight: '600',
  },
  headerCount: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
  },
  questionNav: {
    display: 'flex',
    gap: '6px',
    padding: '8px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
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
    color: '#ffffff',
  },
  navDotAnswered: {
    backgroundColor: '#4ec9b0',
    borderColor: '#4ec9b0',
    color: '#1e1e1e',
  },
  questionBox: {
    backgroundColor: '#2d2d2d',
    margin: '12px 16px 0',
    borderRadius: '6px',
    padding: '12px 14px',
    border: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  questionMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  qType: {
    color: '#dcdcaa',
    fontSize: '11px',
    fontWeight: '600',
  },
  qNum: {
    color: '#007acc',
    fontSize: '12px',
    fontWeight: '700',
  },
  qText: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5',
  },
  answerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px 16px 0',
    flexShrink: 0,
  },
  answerLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  noChoices: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '13px',
    margin: 0,
    fontStyle: 'italic',
  },
  choiceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  choiceLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid var(--color-ide-border)',
    backgroundColor: '#3c3c3c',
    cursor: 'pointer',
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  choiceLabelSelected: {
    backgroundColor: '#094771',
    borderColor: '#007acc',
  },
  radioInput: {
    marginTop: '2px',
    flexShrink: 0,
    accentColor: '#007acc',
  },
  choiceNumber: {
    color: '#007acc',
    fontWeight: '700',
    flexShrink: 0,
    fontSize: '12px',
    minWidth: '18px',
  },
  choiceText: {
    flex: 1,
  },
  error: {
    color: '#f44747',
    fontSize: '12px',
    margin: '4px 16px 0',
    flexShrink: 0,
  },
  btnRow: {
    display: 'flex',
    gap: '8px',
    padding: '10px 16px',
    flexShrink: 0,
  },
  navBtn: {
    flex: 1,
    padding: '7px',
    background: 'none',
    border: '1px solid var(--color-ide-border)',
    color: 'var(--color-ide-text)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  nextBtn: {
    flex: 2,
    padding: '7px',
    background: '#0e639c',
    border: 'none',
    color: '#ffffff',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
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
    fontSize: '13px',
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
  summary: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
    borderTop: '1px solid var(--color-ide-border)',
  },
  summaryTitle: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '4px 16px 6px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    padding: '6px 16px',
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
  },
  summaryItemActive: {
    backgroundColor: 'var(--color-ide-active)',
    borderLeft: '2px solid #007acc',
  },
  summaryNum: {
    color: '#007acc',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  summaryType: {
    color: '#dcdcaa',
    fontSize: '10px',
    flexShrink: 0,
  },
  summaryText: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  answeredBadge: {
    color: '#4ec9b0',
    fontSize: '11px',
    flexShrink: 0,
  },
}

export default QASection

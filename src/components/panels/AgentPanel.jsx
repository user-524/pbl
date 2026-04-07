import { useState } from 'react'
import useSubmissionStore from '../../store/submissionStore.js'

// 정답 풀이 생성 에이전트 (시연용 - 실제 LLM 연동 가능)
async function generateSolution(draft) {
  // TODO: 실제 LLM API 연동 시 여기를 교체
  return new Promise((resolve) => {
    setTimeout(() => {
      const lang = draft.language || 'python'
      const title = draft.problem_title || '문제'

      let solution = ''
      if (lang === 'python') {
        solution = `# ${title} - AI 생성 풀이

def solution(n):
    """
    문제: ${draft.problem_description || ''}

    풀이 전략:
    - 재귀적 접근 또는 동적 프로그래밍 적용
    - 시간복잡도: O(n), 공간복잡도: O(n)
    """
    # 기저 조건
    if n <= 1:
        return n

    # 메모이제이션을 활용한 최적화
    memo = {}

    def dp(k):
        if k in memo:
            return memo[k]
        if k <= 1:
            return k
        memo[k] = dp(k-1) + dp(k-2)
        return memo[k]

    return dp(n)

# 테스트
if __name__ == "__main__":
    print(solution(10))  # 예시 출력`
      } else if (lang === 'javascript') {
        solution = `// ${title} - AI 생성 풀이

/**
 * 문제: ${draft.problem_description || ''}
 * 풀이 전략: 동적 프로그래밍 활용
 * 시간복잡도: O(n), 공간복잡도: O(n)
 */
function solution(n) {
  // 기저 조건
  if (n <= 1) return n;

  // 메모이제이션
  const memo = new Map();

  function dp(k) {
    if (memo.has(k)) return memo.get(k);
    if (k <= 1) return k;
    const result = dp(k - 1) + dp(k - 2);
    memo.set(k, result);
    return result;
  }

  return dp(n);
}

// 테스트
console.log(solution(10));`
      } else {
        solution = `// ${title} - AI 생성 풀이

import java.util.HashMap;
import java.util.Map;

public class Solution {
    /**
     * 문제: ${draft.problem_description || ''}
     * 풀이 전략: 동적 프로그래밍 활용
     * 시간복잡도: O(n), 공간복잡도: O(n)
     */
    private Map<Integer, Long> memo = new HashMap<>();

    public long solution(int n) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) return memo.get(n);

        long result = solution(n - 1) + solution(n - 2);
        memo.put(n, result);
        return result;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution(10));
    }
}`
      }

      resolve({
        code: solution,
        explanation: `이 풀이는 ${title} 문제를 메모이제이션을 활용한 동적 프로그래밍으로 해결합니다.\n\n핵심 아이디어:\n1. 재귀 호출의 중복 계산을 메모이제이션으로 제거\n2. 기저 조건(n ≤ 1) 처리\n3. O(n) 시간복잡도로 최적화`,
      })
    }, 2000)
  })
}

function AgentPanel({ onClose, onApplyCode }) {
  const draft = useSubmissionStore((s) => s.draft)

  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setError('')
      setResult(null)
      const res = await generateSolution(draft)
      setResult(res)
    } catch (err) {
      setError('풀이 생성 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = () => {
    if (result?.code) {
      onApplyCode(result.code)
      onClose()
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={styles.panelHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.agentIcon}>🤖</span>
            <div>
              <span style={styles.panelTitle}>정답 풀이 에이전트</span>
              <p style={styles.panelSub}>AI가 현재 문제의 모범 답안을 생성합니다</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 문제 요약 */}
        <div style={styles.problemSummary}>
          <span style={styles.summaryLabel}>현재 문제</span>
          <p style={styles.summaryTitle}>{draft.problem_title || '(제목 없음)'}</p>
          {draft.problem_description && (
            <p style={styles.summaryDesc}>{draft.problem_description}</p>
          )}
          <span style={styles.langBadge}>{draft.language || 'python'}</span>
        </div>

        {/* 생성 버튼 */}
        <div style={styles.generateArea}>
          <button
            style={{
              ...styles.generateBtn,
              opacity: isGenerating ? 0.6 : 1,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
            }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span style={styles.spinner} />
                풀이 생성 중...
              </>
            ) : (
              '✨ 정답 풀이 생성'
            )}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* 생성 결과 */}
        {result && (
          <div style={styles.resultArea}>
            {/* 설명 */}
            <div style={styles.explanationBox}>
              <span style={styles.boxLabel}>풀이 설명</span>
              <p style={styles.explanationText}>{result.explanation}</p>
            </div>

            {/* 코드 */}
            <div style={styles.codeBox}>
              <div style={styles.codeHeader}>
                <span style={styles.boxLabel}>생성된 코드</span>
                <button style={styles.applyBtn} onClick={handleApply}>
                  에디터에 적용
                </button>
              </div>
              <pre style={styles.codeBlock}>{result.code}</pre>
            </div>

            <p style={styles.disclaimer}>
              ⚠ AI가 생성한 예시 풀이입니다. 반드시 직접 이해하고 검토하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  panel: {
    width: '520px',
    maxWidth: '90vw',
    backgroundColor: 'var(--color-ide-sidebar)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--color-ide-border)',
    overflow: 'hidden',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  agentIcon: {
    fontSize: '24px',
    lineHeight: 1,
    marginTop: '2px',
  },
  panelTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    fontWeight: '700',
    display: 'block',
  },
  panelSub: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-ide-text-dim)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    lineHeight: 1,
    flexShrink: 0,
  },
  problemSummary: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-ide-border)',
    flexShrink: 0,
  },
  summaryLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryTitle: {
    color: 'var(--color-ide-text)',
    fontSize: '14px',
    fontWeight: '600',
    margin: '4px 0 2px',
  },
  summaryDesc: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '12px',
    margin: '0 0 8px',
    lineHeight: '1.4',
  },
  langBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#2d2d2d',
    border: '1px solid var(--color-ide-border)',
    color: '#4ec9b0',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  generateArea: {
    padding: '12px 16px',
    flexShrink: 0,
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  error: {
    color: '#f44747',
    fontSize: '12px',
    margin: '0 16px',
    flexShrink: 0,
  },
  resultArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  explanationBox: {
    backgroundColor: '#2d2d2d',
    borderRadius: '6px',
    padding: '12px',
    border: '1px solid var(--color-ide-border)',
  },
  boxLabel: {
    color: 'var(--color-ide-text-dim)',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '6px',
  },
  explanationText: {
    color: 'var(--color-ide-text)',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  codeBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: '6px',
    border: '1px solid var(--color-ide-border)',
    overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-ide-border)',
    backgroundColor: '#2d2d2d',
  },
  applyBtn: {
    background: '#0e639c',
    border: 'none',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  codeBlock: {
    margin: 0,
    padding: '12px',
    fontFamily: '"Consolas", "Monaco", monospace',
    fontSize: '12px',
    color: '#d4d4d4',
    overflowX: 'auto',
    lineHeight: '1.5',
    whiteSpace: 'pre',
  },
  disclaimer: {
    color: '#dcdcaa',
    fontSize: '11px',
    margin: 0,
    padding: '8px 12px',
    backgroundColor: '#2d2d2d',
    borderRadius: '4px',
    border: '1px solid #4d4000',
  },
}

export default AgentPanel

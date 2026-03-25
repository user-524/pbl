export const submitAnswersForEvaluation = async ({ submissionId, answers }) => {
    console.log('답변 제출 데이터:', { submissionId, answers })
  
    return new Promise((resolve) => {
      setTimeout(() => {
        const answeredCount = answers.filter(
          (answer) => answer.answer_text.trim() !== ''
        ).length
  
        const totalCount = answers.length || 1
        const answerRate = answeredCount / totalCount
  
        const totalScore = Math.round(50 + answerRate * 40)
        const reportId = Date.now()
  
        const reportData = {
          success: true,
          total_score: totalScore,
          detail_scores: {
            keyword_match: Math.round(20 + answerRate * 20),
            semantic_similarity: Math.round(20 + answerRate * 25),
            time_complexity: Math.round(10 + answerRate * 10),
          },
          weak_keywords:
            answerRate === 1
              ? ['공간복잡도', '예외 케이스']
              : ['재귀 호출 이해', '시간복잡도 설명'],
          ai_feedback:
            answerRate === 1
              ? '모든 질문에 답변했습니다. 이제 답변의 정확도와 설명력을 더 높이면 좋습니다.'
              : '비어 있는 답변이 있거나 설명이 짧을 수 있습니다. 각 질문에 대해 이유까지 포함해서 답하는 연습을 해보세요.',
          recommendations:
            answerRate === 1
              ? ['시간복잡도 비교 문제 풀기', '재귀와 DP 차이 정리하기']
              : ['각 질문에 한 문장 이상 답해보기', '재귀 함수 동작을 손으로 추적해보기'],
        }
  
        sessionStorage.setItem(
          `mock-report-${reportId}`,
          JSON.stringify(reportData)
        )
  
        resolve({
          success: true,
          evaluation_status: 'COMPLETED',
          report_id: reportId,
        })
      }, 1200)
    })
  }
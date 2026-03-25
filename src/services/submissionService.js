export const submitCodeForAnalysis = async (payload) => {
    console.log('제출된 문제/코드:', payload)
  
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          submission_id: 101,
          execution_result: {
            status: 'SUCCESS',
            measured_time_complexity: 'O(2^N)',
          },
          ast_structure: {
            type: 'Function',
            name: 'solution',
            children: [
              {
                type: 'Condition',
                name: 'if n <= 1',
              },
              {
                type: 'Return',
                name: 'return solution(n-1) + solution(n-2)',
              },
            ],
          },
          generated_questions: [
            {
              question_id: 1,
              type: 'ROLE_EXPLANATION',
              text: '재귀 호출 부분의 역할을 설명하세요.',
            },
            {
              question_id: 2,
              type: 'TIME_COMPLEXITY',
              text: '이 코드의 시간복잡도는 무엇인가요?',
            },
          ],
        })
      }, 1500)
    })
  }
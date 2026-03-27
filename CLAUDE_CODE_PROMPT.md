# AI 윤리 기반 학습 평가 시스템 — 프론트엔드 개발 지시서

## 프로젝트 개요

이 프로젝트는 **React 기반 단일 페이지 애플리케이션(SPA)**으로,
학생이 코드를 제출하면 AI가 AST 분석 + 질문 생성 + 이해도 채점까지 수행하는 학습 평가 서비스다.

**현재 상태:** 팀원이 기능 흐름의 골격(skeleton)만 구현해 둔 상태다.
모든 서비스 함수는 `setTimeout`으로 mock 데이터를 반환하며, UI는 기능 중심의 minimal 스타일이다.
**너는 이 프로젝트를 기능적으로 완성하고, UI를 아름답고 일관되게 완성해야 한다.**

---

## 현재 파일 구조

```
src/
├── app/
│   └── router.jsx           # 라우팅 (5개 route 정의됨)
├── components/
│   └── editor/
│       └── CodeEditor.jsx   # Monaco Editor 래퍼 컴포넌트
├── pages/
│   ├── LoginPage.jsx        # 로그인 (실제 API + 시연 모드)
│   ├── InputPage.jsx        # 문제 입력 + Monaco Editor + 테스트케이스 관리
│   ├── AnalysisPage.jsx     # 코드 분석 로딩/결과 + AST를 JSON.stringify로만 표시
│   ├── QASessionPage.jsx    # 좌:코드(<pre>), 우:질문/답변 2패널 레이아웃
│   └── ResultPage.jsx       # 점수/피드백 표시 (숫자만, 차트 없음)
├── services/
│   ├── api.js               # axios 인스턴스 (Bearer 토큰 인터셉터 포함)
│   ├── authService.js       # loginUser() → 실제 API 호출
│   ├── submissionService.js # submitCodeForAnalysis() → mock (setTimeout 1500ms)
│   ├── qaService.js         # submitAnswersForEvaluation() → mock (setTimeout 1200ms)
│   └── reportService.js     # getReportById() → mock (sessionStorage에서 읽기)
└── store/
    └── submissionStore.js   # Zustand store (draft, analysisResult, qaAnswers)
```

---

## 설치된 주요 라이브러리

- `react` v19, `react-router-dom` v7
- `@monaco-editor/react` v4 — 코드 에디터
- `@tanstack/react-query` v5 — 서버 상태 관리 (현재 **사용 안 됨**)
- `recharts` v3 — 차트 (현재 **사용 안 됨**)
- `zustand` v5 — 클라이언트 전역 상태
- `axios` v1 — HTTP 클라이언트

---

## Mock 데이터 구조 (API 응답 스키마)

### submitCodeForAnalysis() 응답
```json
{
  "success": true,
  "submission_id": 101,
  "execution_result": {
    "status": "SUCCESS",
    "measured_time_complexity": "O(2^N)"
  },
  "ast_structure": {
    "type": "Function",
    "name": "solution",
    "children": [
      { "type": "Condition", "name": "if n <= 1" },
      { "type": "Return", "name": "return solution(n-1) + solution(n-2)" }
    ]
  },
  "generated_questions": [
    { "question_id": 1, "type": "ROLE_EXPLANATION", "text": "재귀 호출 부분의 역할을 설명하세요." },
    { "question_id": 2, "type": "TIME_COMPLEXITY", "text": "이 코드의 시간복잡도는 무엇인가요?" }
  ]
}
```

### getReportById() 응답
```json
{
  "total_score": 82,
  "detail_scores": {
    "keyword_match": 30,
    "semantic_similarity": 38,
    "time_complexity": 14
  },
  "weak_keywords": ["공간복잡도", "예외 케이스"],
  "ai_feedback": "모든 질문에 답변했습니다...",
  "recommendations": ["시간복잡도 비교 문제 풀기", "재귀와 DP 차이 정리하기"]
}
```

---

## 페이지 흐름 (user journey)

```
/login → /input → /analysis → /qa/:submissionId → /result/:reportId
```

각 페이지는 순서대로 진행되며, `submissionStore`(Zustand + sessionStorage persist)가 상태를 공유한다.

---

## ✅ 구현해야 할 작업 목록 (우선순위 순)

---

### TASK 1: Protected Route 추가

**파일:** `src/components/auth/ProtectedRoute.jsx` (신규 생성)
**수정:** `src/app/router.jsx`

**요구사항:**
- `localStorage.getItem('access_token')`이 없으면 `/login`으로 redirect
- `/input`, `/analysis`, `/qa/:submissionId`, `/result/:reportId` 4개 route에 적용
- `/login`은 보호 없음

```jsx
// ProtectedRoute.jsx 예시 구조
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}
```

---

### TASK 2: AST 트리 시각화 컴포넌트 (핵심 기능)

**파일:** `src/components/ast/AstTreeViewer.jsx` (신규 생성)
**수정:** `src/pages/AnalysisPage.jsx`

**요구사항:**
- `react-d3-tree` 라이브러리를 사용하지 말 것 (외부 라이브러리 추가 불필요)
- **재귀적 React 컴포넌트**로 순수하게 구현할 것
- AST 노드 구조: `{ type: string, name: string, children?: [...] }`
- 각 노드는 `type`에 따라 다른 색상으로 구분:
  - `"Function"` → 파란색 (`#2563eb`)
  - `"Condition"` → 주황색 (`#f59e0b`)
  - `"Return"` → 초록색 (`#10b981`)
  - 그 외 → 회색 (`#6b7280`)
- 노드 박스에는 `type` (뱃지 형식) 과 `name`을 표시
- 자식 노드는 들여쓰기 + 연결선(세로선, `border-left`)으로 시각화
- AnalysisPage에서 `<pre>{JSON.stringify(...)}</pre>` 블록을 `<AstTreeViewer data={analysisResult.ast_structure} />`로 교체

---

### TASK 3: QASessionPage 코드 패널 Monaco Editor로 교체

**수정:** `src/components/editor/CodeEditor.jsx`, `src/pages/QASessionPage.jsx`

**요구사항:**
- `CodeEditor` 컴포넌트에 `readOnly` prop 추가 (default: `false`)
- `readOnly={true}` 일 때 Monaco Editor 옵션에 `readOnly: true` 적용
- QASessionPage 왼쪽 패널의 `<pre>` 코드 블록을 `<CodeEditor readOnly value={draft.raw_code} language={draft.language} />` 로 교체
- 왼쪽 패널 높이가 오른쪽 패널과 맞도록 `height` 조정 (`min-height: 400px` 이상)

---

### TASK 4: ResultPage 리포트 시각화 (recharts 활용)

**수정:** `src/pages/ResultPage.jsx`

**요구사항:**
- 이미 설치된 `recharts` 라이브러리를 활용
- **레이더 차트(RadarChart)** 를 추가해서 3개 세부 점수를 시각화:
  - `keyword_match`, `semantic_similarity`, `time_complexity`
  - 각 항목의 최대값 기준: `keyword_match` → 40, `semantic_similarity` → 45, `time_complexity` → 20
- 레이더 차트는 세부 점수 섹션 위에 위치, `height: 280px`
- 레이더 fill 색상: `#2563eb`, opacity: `0.2` / stroke: `#2563eb`
- 기존 숫자 카드(detailGrid)는 차트 아래에 유지

---

### TASK 5: 전체 UI/UX 디자인 통일 및 개선

**요구사항:** 아래 원칙에 따라 **모든 페이지(5개)**의 스타일을 개선한다.

#### 5-1. 공통 컴포넌트 분리
다음 파일들을 **신규 생성**하고 각 페이지에서 활용한다:

- `src/components/ui/Button.jsx`
  - props: `variant` (`"primary"` | `"secondary"`), `disabled`, `isLoading`, `onClick`, `children`, `type`
  - primary: 배경 `#2563eb`, 텍스트 흰색
  - secondary: 배경 흰색, 테두리 `#2563eb`, 텍스트 `#2563eb`
  - disabled 시 opacity 0.6, cursor not-allowed
  - isLoading 시 텍스트 앞에 작은 스피너(CSS animation, 16px) 표시

- `src/components/ui/Card.jsx`
  - props: `children`, `style`
  - 흰색 배경, `border-radius: 16px`, `box-shadow: 0 10px 30px rgba(0,0,0,0.08)`, `padding: 32px`

- `src/components/ui/Badge.jsx`
  - props: `color` (`"blue"` | `"orange"` | `"green"` | `"gray"`), `children`
  - 작은 pill 형태의 레이블 컴포넌트

#### 5-2. 공통 색상/폰트 변수
`src/index.css`의 `:root`에 CSS 변수 추가:
```css
:root {
  --color-primary: #2563eb;
  --color-primary-light: #eff6ff;
  --color-surface: #ffffff;
  --color-bg: #f5f7fb;
  --color-border: #e5e7eb;
  --color-text-main: #111827;
  --color-text-sub: #6b7280;
  --color-error: #dc2626;
  --color-success: #10b981;
  --radius-card: 16px;
  --radius-input: 10px;
  --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.08);
}
```

#### 5-3. 로딩 스피너 애니메이션
`src/components/ui/Spinner.jsx` 신규 생성:
- CSS `@keyframes spin`을 활용한 원형 스피너
- props: `size` (px, default 32), `color` (default `#2563eb`)
- AnalysisPage와 ResultPage의 로딩 텍스트를 이 컴포넌트로 교체

#### 5-4. AnalysisPage 로딩 화면 개선
- 현재: 텍스트만 표시
- 변경: Spinner 컴포넌트 + 단계별 진행 메시지를 순서대로 표시
  - 0~0.5초: "코드를 샌드박스에서 실행 중..."
  - 0.5~1초: "AST 구조를 분석 중..."
  - 1초~: "질문을 생성 중..."
  - `setInterval`로 500ms마다 메시지 전환

#### 5-5. 전체 inline style → CSS 변수 활용
모든 페이지에서 하드코딩된 색상값(`#2563eb`, `#f5f7fb` 등)을 CSS 변수 참조로 교체:
```js
// before
backgroundColor: '#2563eb'
// after
backgroundColor: 'var(--color-primary)'
```

---

## 작업 시 준수 사항

1. **기존 코드의 로직(상태관리, API 호출 흐름)은 변경하지 않는다.** 오직 UI와 신규 컴포넌트 추가만 한다.
2. **외부 라이브러리를 새로 설치하지 않는다.** 이미 설치된 것만 사용한다.
3. **각 Task를 독립적으로 완성한 후 다음으로 넘어간다.** 중간에 오류가 발생하면 해당 Task 내에서 해결한다.
4. **TypeScript가 아닌 JSX(.jsx)로 작성한다.** prop-types는 추가하지 않아도 된다.
5. **한국어 텍스트는 그대로 유지한다.**
6. 작업 완료 후 `npm run build`를 실행해서 빌드 오류가 없는지 반드시 확인한다.

---

## 최종 검증 체크리스트

- [ ] `/login` 접근 시 로그인 폼 정상 표시
- [ ] 토큰 없이 `/input` 접근 시 `/login`으로 redirect
- [ ] "백엔드 없이 시연용 시작" 버튼으로 전체 flow 통과 가능
- [ ] AnalysisPage에서 AST 트리가 색상별로 시각화됨
- [ ] QASessionPage 좌측 패널에서 Monaco Editor로 코드가 표시됨 (syntax highlight 포함)
- [ ] ResultPage에서 레이더 차트가 렌더링됨
- [ ] 로딩 상태에서 Spinner 컴포넌트가 표시됨
- [ ] `npm run build` 오류 없음

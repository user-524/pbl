# AI 윤리 기반 학습 평가 시스템 — 프론트엔드 개발 지시서

## 프로젝트 개요

이 프로젝트는 **React 기반 단일 페이지 애플리케이션(SPA)**으로,
학생이 코드를 제출하면 AI가 AST 분석 + 질문 생성 + 이해도 채점까지 수행하는 학습 평가 서비스다.

> **⚠️ 현재 상태 (2025-03 기준)**
>
> 아래 원본 지시서는 skeleton 상태를 기준으로 작성되었다.
> **이미 구현이 완료**되어 있으므로, 변경 전 상태를 참조할 때만 사용한다.
> 현재 실제 파일 구조와 구현 현황은 **[구현 현황 섹션](#구현-현황-2025-03)** 을 확인하라.

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

- [x] `/login` 접근 시 로그인 폼 정상 표시
- [x] 토큰 없이 `/workspace` 접근 시 `/login`으로 redirect
- [x] "백엔드 없이 시연용 시작" 버튼으로 전체 flow 통과 가능 (백엔드 연결 전)
- [x] 코드 입력 시 AST 트리가 우측 패널에서 실시간 시각화됨
- [x] Monaco Editor에서 코드 편집 가능 (syntax highlight + 언어별 지원)
- [x] 결과 패널에서 레이더 차트 렌더링됨
- [x] 로딩 상태에서 Spinner 컴포넌트 표시됨
- [ ] `npm run build` 오류 없음 (백엔드 API 연결 후 최종 확인 필요)

---

---

## 구현 현황 (2025-03)

> 이 섹션은 실제 구현된 내용을 기록한다. 팀원은 이 섹션을 먼저 읽을 것.

---

### 현재 파일 구조

```
src/
├── api/                          ★ 신규 — 실제 백엔드 API 연결 레이어
│   ├── axiosInstance.js          # axios 인스턴스 + 인터셉터 (토큰 자동 주입, 401 리다이렉트)
│   └── services.js               # 8개 named export API 함수
├── hooks/                        ★ 신규
│   └── useApi.js                 # 커스텀 훅 { data, loading, error, refetch }
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx    ★ 신규 — 토큰 없으면 /login 리다이렉트
│   ├── ast/
│   │   └── AstTreeViewer.jsx     ★ 개선 — 다크 테마, 접기/펼치기, 줄번호, 노드 클릭
│   ├── editor/
│   │   └── CodeEditor.jsx        ★ 개선 — readOnly prop, height prop 추가
│   ├── layout/                   ★ 신규 — VSCode 스타일 IDE 레이아웃
│   │   ├── IDELayout.jsx         # 전체 화면 Shell (TitleBar + 중앙 + StatusBar)
│   │   ├── TitleBar.jsx          # 상단 바 (앱명, 로그아웃)
│   │   ├── StatusBar.jsx         # 하단 상태 바 (언어, 워크플로우 상태, 점수)
│   │   ├── Sidebar.jsx           # 좌측 사이드바 (제출 기록 목록, 접기/펼치기)
│   │   ├── EditorArea.jsx        # 코드 에디터 + AST 트리 2분할 (드래그로 비율 조절)
│   │   └── BottomPanel.jsx       # 하단 탭 패널 (드래그로 높이 조절, 최소화)
│   ├── panels/                   ★ 신규 — 하단 패널 탭별 내용
│   │   ├── ProblemInfoPanel.jsx  # 탭1: 문제 제목/설명/언어 입력
│   │   ├── TestCasePanel.jsx     # 탭2: 테스트 케이스 CRUD
│   │   ├── ExecutionResultPanel.jsx  # 탭3: 분석 결과 (상태, 시간복잡도, 질문 목록)
│   │   ├── QAPanel.jsx           # 탭4: 질문 답변 (도트 네비게이션)
│   │   └── ReportPanel.jsx       # 탭5: 레이더 차트 + 점수 + AI 피드백
│   └── ui/                       ★ 신규 — 공통 UI 컴포넌트
│       ├── Button.jsx            # primary / secondary, isLoading, disabled
│       ├── Card.jsx              # 카드 래퍼
│       ├── Badge.jsx             # pill 형태 레이블 (blue/orange/green/gray)
│       └── Spinner.jsx           # CSS 로딩 스피너
├── pages/
│   ├── LoginPage.jsx             ★ 수정 — 로그인 후 /workspace 이동
│   └── WorkspacePage.jsx         ★ 신규 — 단일 IDE 워크스페이스 페이지
│   (InputPage, AnalysisPage, QASessionPage, ResultPage 삭제됨 → 패널 컴포넌트로 대체)
├── services/
│   ├── api.js                    ★ 수정 — axiosInstance re-export (하위 호환)
│   ├── authService.js            ★ 수정 — 실제 API 호출 (login)
│   ├── submissionService.js      ★ 수정 — 실제 API 호출 (submitCode, getSubmissionById)
│   ├── qaService.js              ★ 수정 — 실제 API 호출 (submitAnswers)
│   └── reportService.js          ★ 수정 — 실제 API 호출 (getReport, getReportList)
├── store/
│   ├── submissionStore.js        # 기존 유지 (draft, analysisResult, qaAnswers)
│   └── historyStore.js           ★ 신규 — 제출 기록 (localStorage persist)
└── utils/
    └── simpleAstParser.js        ★ 신규 — 클라이언트 사이드 실시간 AST 파서
```

---

### 주요 변경 사항

#### 1. UI 구조 전면 개편 — VSCode 스타일 IDE 레이아웃

기존 5개 페이지(`/input → /analysis → /qa → /result`) 구조를 **단일 워크스페이스**로 통합했다.

| 기존 | 현재 |
|------|------|
| 5개 라우트, 5개 페이지 파일 | 2개 라우트 (`/login`, `/workspace`) |
| 페이지 이동마다 전체 화면 전환 | 하단 패널 탭 전환으로 처리 |
| 흰 배경 카드 UI | 다크 테마 IDE 레이아웃 |
| AST 트리 분석 후에만 표시 | 코드 입력 즉시 실시간 AST 시각화 |
| 좌측 메뉴 없음 | 제출 기록 사이드바 (localStorage 영구 저장) |

**화면 구성:**
```
┌─────────────────────────────────────────────────────────┐
│  TitleBar: [앱명]                        [사용자] [로그아웃] │
├──────┬──────────────────────────────────────────────────┤
│Sidebar│  EditorArea                                      │
│      │  ┌────────────────┬────────────────────┐         │
│ 나의 │  │  Monaco Editor │  AST Tree Viewer   │         │
│ 기록 │  │  (코드 편집)    │  (실시간 갱신)      │         │
│      │  └────────────────┴────────────────────┘         │
│      │  BottomPanel (드래그로 높이 조절)                  │
│      │  [문제정보][테스트케이스][실행결과][QA][리포트]      │
├──────┴──────────────────────────────────────────────────┤
│  StatusBar: [언어]  [실행 상태]  [점수]                   │
└─────────────────────────────────────────────────────────┘
```

#### 2. 실시간 AST 파서 (`src/utils/simpleAstParser.js`)

외부 라이브러리 없이 정규식 기반으로 구현. 코드 변경 시 300ms debounce 후 즉시 AST 트리 갱신.

- **Python**: 들여쓰기 기반 트리 구조 (`def`, `class`, `if/elif/else`, `for`, `while`, `return`, `try/except`)
- **JavaScript**: 중괄호 깊이 기반 (`function`, `class`, `if/else`, `for`, `while`, `return`, `const/let/var`, 화살표 함수)
- **Java**: 중괄호 깊이 기반 (`class`, 메서드 선언, `if/else`, `for`, `while`, `return`)

지원 노드 타입 및 색상:

| 타입 | 색상 | 설명 |
|------|------|------|
| Function | `#569cd6` (파랑) | 함수/메서드 정의 |
| Class | `#4ec9b0` (청록) | 클래스 선언 |
| Condition | `#ce9178` (주황) | if/elif/else |
| Return | `#6a9955` (초록) | return 문 |
| Loop | `#c586c0` (보라) | for/while 반복문 |
| Variable | `#9cdcfe` (하늘) | 변수 선언 |
| TryCatch | `#dcdcaa` (노랑) | try/except/catch |

#### 3. API 서비스 레이어 (`src/api/`)

기존 mock 서비스(`setTimeout` 반환)를 실제 백엔드 API 호출로 교체했다.

| 함수 | 메서드 | 경로 |
|------|--------|------|
| `login(username, password)` | POST | `/api/auth/login` |
| `getProblems()` | GET | `/api/problems` |
| `getProblemDetail(problemId)` | GET | `/api/problems/{id}` |
| `submitCode(problemId, language, rawCode)` | POST | `/api/submissions` |
| `getSubmissionDetail(submissionId)` | GET | `/api/submissions/{id}` |
| `submitAnswers(submissionId, answers)` | POST | `/api/submissions/{id}/answers` |
| `getReport(reportId)` | GET | `/api/reports/{id}` |
| `getReports()` | GET | `/api/reports` |

**에러 처리 규칙:**
- 모든 함수는 실패 시 `{ success: false, message: "..." }` 반환
- 401 응답 → 토큰 자동 삭제 + `/login` 리다이렉트 (axiosInstance 인터셉터)
- 상태 코드별 메시지: 400, 401, 404, 422, 500+ 구분

#### 4. 제출 기록 스토어 (`src/store/historyStore.js`)

- **저장소**: localStorage (브라우저 종료 후에도 유지)
- 제출 시 자동으로 기록 추가, 분석/QA/결과 완료 시 업데이트
- 사이드바에서 과거 기록 클릭 → submissionStore에 해당 데이터 로드하여 복원

---

### 개발 환경 설정

1. **의존성 설치:**
   ```bash
   npm install
   ```

2. **환경 변수 설정:**
   `.env.example`을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```
   `.env` 내용:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **개발 서버 실행:**
   ```bash
   npm run dev
   ```
   > 백엔드 없이 시연 모드: 로그인 화면에서 "백엔드 없이 시연용 시작" 클릭
   > (단, API 연결 후에는 실제 백엔드 호출만 수행하므로 mock 동작 없음)

4. **빌드:**
   ```bash
   npm run build
   ```

---

### 백엔드 연결 시 주의 사항

- 현재 `submissionService.js`는 `problem_id`가 없으면 기본값 `1`을 사용한다.
  추후 UI에 문제 선택 기능(문제 목록 → 상세 조회)을 추가하면 실제 `problem_id`로 교체할 것.
- 백엔드 BASE URL은 `.env`의 `VITE_API_BASE_URL`로 관리한다.
- CORS 설정이 백엔드에서 `http://localhost:5173` (Vite 기본 포트)을 허용해야 한다.

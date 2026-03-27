# AI 윤리 기반 학습 평가 시스템 — 프론트엔드 팀 공유 문서

## 프로젝트 개요

학생이 코드를 제출하면 AI가 AST 분석 + 질문 생성 + 이해도 채점까지 수행하는 학습 평가 서비스.

- **프레임워크**: React 19 (SPA), Vite 8
- **백엔드**: FastAPI (Python), BASE URL: `http://localhost:8000`
- **인증**: JWT Bearer 토큰 (`localStorage`의 `access_token` 키)

---

## 기술 스택 (설치된 라이브러리)

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| `react`, `react-dom` | v19 | UI 프레임워크 |
| `react-router-dom` | v7 | 클라이언트 라우팅 |
| `zustand` | v5 | 전역 상태 관리 |
| `axios` | v1 | HTTP 클라이언트 |
| `@monaco-editor/react` | v4 | 코드 에디터 |
| `recharts` | v3 | 차트 (RadarChart 사용 중) |
| `@tanstack/react-query` | v5 | 서버 상태 관리 (미사용, 향후 활용 가능) |

---

## 파일 구조

```
src/
├── api/
│   ├── axiosInstance.js      # axios 인스턴스 + 인터셉터
│   └── services.js           # 8개 API 함수 (named export)
├── hooks/
│   └── useApi.js             # 커스텀 훅: { data, loading, error, refetch }
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx        # 토큰 없으면 /login 리다이렉트
│   ├── ast/
│   │   └── AstTreeViewer.jsx         # 재귀 AST 트리 시각화 (다크 테마)
│   ├── editor/
│   │   └── CodeEditor.jsx            # Monaco Editor 래퍼 (readOnly, height prop)
│   ├── layout/
│   │   ├── IDELayout.jsx             # 전체 화면 Shell
│   │   ├── TitleBar.jsx              # 상단 바 (앱명, 로그아웃)
│   │   ├── StatusBar.jsx             # 하단 상태 바 (언어, 상태, 점수)
│   │   ├── Sidebar.jsx               # 좌측 사이드바 (제출 기록)
│   │   ├── EditorArea.jsx            # 코드 에디터 + AST 2분할 패널
│   │   └── BottomPanel.jsx           # 하단 탭 패널 (5개 탭)
│   ├── panels/
│   │   ├── ProblemInfoPanel.jsx      # 탭1: 문제 제목/설명/언어
│   │   ├── TestCasePanel.jsx         # 탭2: 테스트 케이스 CRUD
│   │   ├── ExecutionResultPanel.jsx  # 탭3: 분석 결과 + 생성된 질문
│   │   ├── QAPanel.jsx               # 탭4: 질문 답변
│   │   └── ReportPanel.jsx           # 탭5: 레이더 차트 + 점수 + 피드백
│   └── ui/
│       ├── Button.jsx        # 공통 버튼 (primary/secondary, isLoading)
│       ├── Card.jsx          # 카드 래퍼
│       ├── Badge.jsx         # pill 레이블 (blue/orange/green/gray)
│       └── Spinner.jsx       # CSS 로딩 스피너
├── pages/
│   ├── LoginPage.jsx         # 로그인 (실제 API + 시연 모드)
│   └── WorkspacePage.jsx     # IDE 워크스페이스 (단일 페이지)
├── services/                 # api/ 레이어 위임 래퍼 (하위 호환용)
│   ├── api.js
│   ├── authService.js
│   ├── submissionService.js
│   ├── qaService.js
│   └── reportService.js
├── store/
│   ├── submissionStore.js    # draft, analysisResult, qaAnswers (sessionStorage)
│   └── historyStore.js       # 제출 기록 목록 (localStorage 영구 저장)
└── utils/
    └── simpleAstParser.js    # 클라이언트 사이드 실시간 AST 파서
```

### 라우트 구조

```
/           → /login (리다이렉트)
/login      → LoginPage (공개)
/workspace  → WorkspacePage (ProtectedRoute)
```

---

## CSS 변수

`src/index.css`의 `:root`에 정의. 모든 컴포넌트에서 이 변수를 사용한다.

```css
/* 라이트 테마 (로그인 페이지 등) */
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

/* IDE 다크 테마 (워크스페이스) */
--color-ide-bg: #1e1e1e;
--color-ide-sidebar: #252526;
--color-ide-titlebar: #323233;
--color-ide-statusbar: #007acc;
--color-ide-panel-bg: #1e1e1e;
--color-ide-border: #3e3e42;
--color-ide-text: #cccccc;
--color-ide-text-dim: #858585;
--color-ide-active: #094771;
--color-ide-hover: #2a2d2e;
--color-ide-tab-active: #1e1e1e;
--color-ide-tab-inactive: #2d2d2d;
```

---

## 코드 컨벤션

### 파일 작성 규칙

- 확장자는 `.jsx` (TypeScript 사용 안 함, prop-types 불필요)
- 컴포넌트명은 PascalCase, 파일명도 동일
- 스타일은 파일 하단에 `const styles = { ... }` 인라인 오브젝트로 작성
- 하드코딩 색상값 금지 → CSS 변수 사용 (`var(--color-primary)` 등)

### 상태 관리 원칙

- **서버 상태** (API 응답): `useApi` 훅 또는 `src/api/services.js` 직접 호출
- **워크플로우 상태** (코드 제출 흐름): `submissionStore` (Zustand + sessionStorage)
- **기록/히스토리**: `historyStore` (Zustand + localStorage)
- **로컬 UI 상태**: `useState`

### API 호출 규칙

```js
// 신규 코드는 src/api/services.js 의 함수를 직접 import
import { getProblems, submitCode } from '../api/services.js'

// 반환값 패턴: 실패 시 { success: false, message: '...' }
const result = await submitCode(problemId, language, rawCode)
if (!result.success) {
  setError(result.message)
  return
}
```

### AST 파서 사용법

```js
import { parseCodeToAst } from '../utils/simpleAstParser.js'

// code: 코드 문자열, language: 'python' | 'javascript' | 'java'
const astNode = parseCodeToAst(code, language)
// 반환: { type, name, line, children[] }
```

---

## API 명세 요약

| 함수 | 메서드 | 경로 | 설명 |
|------|--------|------|------|
| `login(username, password)` | POST | `/api/auth/login` | 로그인, access_token 반환 |
| `getProblems()` | GET | `/api/problems` | 문제 목록 |
| `getProblemDetail(id)` | GET | `/api/problems/{id}` | 문제 상세 + 테스트케이스 |
| `submitCode(problemId, lang, code)` | POST | `/api/submissions` | 코드 제출 → AST + 질문 반환 |
| `getSubmissionDetail(id)` | GET | `/api/submissions/{id}` | 제출 상세 복원용 |
| `submitAnswers(submissionId, answers)` | POST | `/api/submissions/{id}/answers` | QA 답변 제출 → report_id 반환 |
| `getReport(reportId)` | GET | `/api/reports/{id}` | 리포트 상세 |
| `getReports()` | GET | `/api/reports` | 내 리포트 목록 (마이페이지) |

**에러 처리**: 모든 API 함수는 실패 시 `{ success: false, message }` 반환.
401 응답은 axiosInstance 인터셉터가 자동으로 토큰 삭제 + `/login` 리다이렉트 처리.

---

## 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.example 복사)
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000

# 3. 개발 서버 실행
npm run dev

# 4. 빌드
npm run build
```

> **백엔드 없이 시연**: 로그인 화면의 "백엔드 없이 시연용 시작" 버튼 클릭
> (단, 현재 API 레이어는 실제 백엔드를 호출하므로 mock 동작 없음. 시연 버튼은 토큰만 세팅함)

---

## 향후 작업 필요 사항

- [ ] 문제 선택 UI 추가: 현재 `submissionService`는 `problem_id` 없으면 기본값 `1` 사용 → 실제 문제 목록(`getProblems`) 연동 필요
- [ ] 마이페이지: `getReports()` 호출로 과거 리포트 목록 표시 기능 미구현
- [ ] 백엔드 CORS 설정: `http://localhost:5173` (Vite 기본 포트) 허용 필요
- [ ] 새로고침 복원: `getSubmissionDetail(submissionId)` 호출로 QA 화면 복원 기능 미구현

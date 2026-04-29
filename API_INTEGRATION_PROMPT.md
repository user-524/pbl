# API 연동 프롬프트 (Frontend ↔ Backend Wire-up)

> 이 문서는 본 레포(`ai-ethics-frontend`, React 19 + Vite + React Query + axios + Zustand)의 프론트엔드에서 백엔드 8개 엔드포인트를 한 번에 연결하기 위해 LLM에 전달하는 **단일 프롬프트**입니다.
> 그대로 복사해서 새 세션의 첫 메시지로 넣으세요.

---

## 📋 프롬프트 (이 아래부터 그대로 복사해서 사용)

당신은 미국 실리콘밸리에서 근무하는 시니어 프론트엔드 엔지니어입니다. 아래 명세에 따라 본 레포의 백엔드 API 8개를 **프로덕션 수준**으로 연동하세요. 단순 fetch 래퍼가 아니라, 타입 안전(JSDoc), 에러/로딩 상태 일관성, 토큰 인터셉터, 캐시 무효화, 낙관적 업데이트(optional)까지 갖춘 **확장 가능한 데이터 레이어**를 구축해야 합니다.

### 0. 기술 스택 / 제약

- React 19, Vite 8, React Router 7
- 데이터 페칭: **`@tanstack/react-query` v5** (이미 `QueryClientProvider`가 `src/main.jsx`에 설정됨)
- HTTP 클라이언트: **`axios` v1**
- 전역 상태: **`zustand` v5** (이미 `src/store/submissionStore.js` 존재 — `sessionStorage`에 persist)
- 코드 에디터: `@monaco-editor/react`
- 차트: `recharts`
- 새 라이브러리 추가 금지. 위 스택 안에서 해결하세요.

### 1. 디렉토리 구조 (반드시 준수)

```
src/
├─ api/
│  ├─ client.js            # axios 인스턴스 + 인터셉터
│  ├─ endpoints.js         # 모든 엔드포인트 경로 상수 (단일 출처)
│  ├─ queryKeys.js         # React Query 키 팩토리 (계층형)
│  ├─ auth.js              # login
│  ├─ problems.js          # list, detail
│  ├─ submissions.js       # create, get, submitAnswers
│  └─ reports.js           # list, detail
├─ hooks/
│  ├─ useAuth.js           # useLogin, useLogout, useAuthToken
│  ├─ useProblems.js       # useProblems, useProblem
│  ├─ useSubmissions.js    # useCreateSubmission, useSubmission, useSubmitAnswers
│  └─ useReports.js        # useReports, useReport
├─ store/
│  ├─ submissionStore.js   # (기존 유지)
│  └─ authStore.js         # 토큰 관리 (zustand + persist localStorage)
└─ lib/
   └─ errors.js            # ApiError 클래스 + normalizeError()
```

### 2. axios 클라이언트 (`src/api/client.js`)

다음 요구사항을 **모두** 충족하세요.

1. `baseURL`은 `import.meta.env.VITE_API_BASE_URL`을 사용. 기본값 `'http://localhost:8000'`. `.env.example`도 함께 작성.
2. `timeout: 15000`, `headers: { 'Content-Type': 'application/json' }`.
3. **요청 인터셉터**: `authStore`의 `accessToken`이 있으면 `Authorization: Bearer ${token}`을 자동 부착. 단, `/api/auth/login`은 제외(allowlist).
4. **응답 인터셉터**:
   - 2xx → `response.data` 그대로 반환 (호출부에서 `.data` 한 번 더 까지 않게).
   - 비-2xx → `lib/errors.js`의 `normalizeError(error)`를 throw. 형태: `{ status, code, message, details }`.
   - **401 처리**: `authStore.clearToken()` 호출 후 `window.location.replace('/login')`. 단, 이미 `/login` 경로면 리다이렉트 생략.
5. 모든 요청은 `AbortController`와 호환 가능해야 함 (React Query가 자동 주입하는 `signal` 그대로 전달).

### 3. 인증 스토어 (`src/store/authStore.js`)

```
state: { accessToken: string | null, username: string | null }
actions: setAuth({ token, username }), clearToken()
persist key: 'auth-storage' (localStorage — sessionStorage 아님)
```

`useAuthToken()` 셀렉터 훅도 함께 export.

### 4. 엔드포인트 상수 (`src/api/endpoints.js`)

```js
export const ENDPOINTS = {
  AUTH: { LOGIN: '/api/auth/login' },
  PROBLEMS: {
    LIST: '/api/problems',
    DETAIL: (id) => `/api/problems/${id}`,
  },
  SUBMISSIONS: {
    CREATE: '/api/submissions',
    DETAIL: (id) => `/api/submissions/${id}`,
    ANSWERS: (id) => `/api/submissions/${id}/answers`,
  },
  REPORTS: {
    LIST: '/api/reports',
    DETAIL: (id) => `/api/reports/${id}`,
  },
};
```

### 5. Query Key Factory (`src/api/queryKeys.js`)

계층형으로 작성하고, 무효화 시 부분 매칭이 가능하도록 하세요.

```js
export const qk = {
  problems: {
    all: ['problems'],
    list: () => [...qk.problems.all, 'list'],
    detail: (id) => [...qk.problems.all, 'detail', id],
  },
  submissions: {
    all: ['submissions'],
    detail: (id) => [...qk.submissions.all, 'detail', id],
  },
  reports: {
    all: ['reports'],
    list: () => [...qk.reports.all, 'list'],
    detail: (id) => [...qk.reports.all, 'detail', id],
  },
};
```

### 6. 8개 엔드포인트 명세 (이대로 구현)

모든 인증 필요 엔드포인트는 `Authorization: Bearer <token>` 자동 부착. 시연용 토큰: `test-admin-token`.

#### 6-1. 로그인 — `POST /api/auth/login` (인증 불필요)
- Request body: `{ username: string, password: string }`
- Response: `{ success: true, message: string, access_token: string }`
- 성공 시: `authStore.setAuth({ token: access_token, username })`
- 상태코드: 200 / 400(필수 누락) / 401(불일치)

#### 6-2. 문제 목록 조회 — `GET /api/problems`
- Response: `{ success, problems: Array<{ problem_id, title, description, difficulty }> }`
- React Query: `staleTime: 60_000`

#### 6-3. 문제 상세 조회 — `GET /api/problems/{problem_id}`
- Response: `{ success, problem_id, title, description, difficulty, test_cases: Array<{input_data, expected_output}>, supported_languages: string[] }`
- 404 → `errors.code === 'NOT_FOUND'`

#### 6-4. 문제/코드 제출 및 분석 — `POST /api/submissions`
- Body: `{ problem_title, problem_description, language, raw_code }`
- Response: `{ success, submission_id, execution_result: {status, measured_time_complexity}, ast_structure, generated_questions[], variant_problem, quality_result }`
- `execution_result.status` ∈ `'SUCCESS' | 'TIMEOUT' | 'ERROR'`
- 성공 시 `submissionStore.setAnalysisResult(data)` + `queryClient.invalidateQueries({ queryKey: qk.submissions.all })`

#### 6-5. 제출 상세 조회 — `GET /api/submissions/{submission_id}`
- 새로고침/재진입 시 화면 복원용
- Response: 6-4와 유사한 구조 (analysisResult 복원에 사용)
- `enabled: !!submissionId` 가드

#### 6-6. 학생 답변 제출 및 평가 — `POST /api/submissions/{submission_id}/answers`
- Body: `{ answers: Array<{ question_id: number, selected_number: number }> }`
- Response: `{ success: true, evaluation_status: 'COMPLETED', report_id: number }`
- 성공 시: 
  - `queryClient.invalidateQueries({ queryKey: qk.reports.all })`
  - 라우터로 `/reports/${report_id}` 이동 (호출부에서 `onSuccess` 콜백으로 처리)

#### 6-7. 리포트 목록 조회 — `GET /api/reports`
- Response: `{ success, reports: Array<{ report_id, problem_title, total_score, created_at(ISO8601 UTC) }> }`
- 목록이 없을 때 `reports: []` 보장

#### 6-8. 종합 리포트 조회 — `GET /api/reports/{report_id}`
- Response: `{ success, total_score, detail_scores: { comprehension, code_quality }, weak_keywords[], bloom_weakness[], ai_feedback, recommendations[], code_quality_tips[], solutions[], quality_criteria{} }`
- `solutions[]` 각 항목: `{ question_id, question_text, bloom_level, is_correct, selected, answer_key, answer_text, explanation, wrong_reason }`

### 7. React Query 훅 작성 규칙

- **쿼리 훅**: 옵션을 받을 수 있게 `(id, options)` 시그니처. 내부에서 `enabled: !!id && (options?.enabled ?? true)` 처리.
- **뮤테이션 훅**: `useMutation` 반환값을 그대로 노출하되, `onSuccess`에서 관련 캐시 무효화. 호출부 `onSuccess`도 chaining 가능하게 `mutate(payload, { onSuccess })`로 전달.
- **에러는 throw**: 컴포넌트에서 `error?.code`, `error?.status`로 분기 가능.
- 모든 훅은 JSDoc으로 매개변수/반환 타입 명시.

### 8. 에러 정규화 (`src/lib/errors.js`)

```js
export class ApiError extends Error {
  constructor({ status, code, message, details }) { ... }
}

export function normalizeError(axiosError) {
  // 네트워크 끊김 → { status: 0, code: 'NETWORK_ERROR' }
  // 4xx/5xx → status별 code 매핑:
  //   400 → 'BAD_REQUEST'
  //   401 → 'UNAUTHORIZED'
  //   404 → 'NOT_FOUND'
  //   500 → 'INTERNAL'
  //   else → 'UNKNOWN'
  // message는 서버 응답의 message 우선, 없으면 axios 기본 메시지
}
```

### 9. 사용 예시 (참고용 — 이대로 한 군데 데모 페이지 작성)

```jsx
// src/pages/ProblemListPage.jsx (예시)
import { useProblems } from '@/hooks/useProblems';

export default function ProblemListPage() {
  const { data, isLoading, error } = useProblems();
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorBanner code={error.code} message={error.message} />;
  return <ProblemList items={data.problems} />;
}
```

### 10. 환경 변수

`.env.example`을 루트에 생성:
```
VITE_API_BASE_URL=http://localhost:8000
```

### 11. 산출물 체크리스트 (모두 완료해야 작업 종료)

- [ ] `src/api/client.js` — axios 인스턴스 + 인터셉터 + 401 핸들링
- [ ] `src/api/endpoints.js`, `src/api/queryKeys.js`
- [ ] `src/api/auth.js`, `problems.js`, `submissions.js`, `reports.js` — 순수 호출 함수
- [ ] `src/hooks/useAuth.js`, `useProblems.js`, `useSubmissions.js`, `useReports.js`
- [ ] `src/store/authStore.js`
- [ ] `src/lib/errors.js`
- [ ] `.env.example`
- [ ] 위 8개 엔드포인트 각각에 대해 **최소 1회 호출 예시**가 들어간 데모 컴포넌트 또는 라우트 1개
- [ ] `npm run lint` 통과
- [ ] 코드에 콘솔 로그/`any` 캐스팅/`// TODO` 잔여물 없음

### 12. 작업 시 지켜야 할 원칙

1. **단일 책임**: 호출 함수(`api/*.js`)는 axios 호출과 응답 반환만. 캐시·라우팅·상태 변경은 훅 또는 호출부에서.
2. **DRY**: 토큰 부착, 에러 변환, 베이스 URL 등 모두 한 곳에서만 처리.
3. **방어적 코딩**: 응답에 `success: false`로 와도 axios는 200을 줄 수 있으므로, 각 호출 함수에서 `if (!data.success) throw new ApiError(...)` 가드.
4. **PathVariable 인코딩**: `encodeURIComponent`로 항상 감싸기.
5. **재시도**: GET만 React Query 기본 재시도(1회). POST는 `retry: false`.
6. **Suspense 미사용**: 본 프로젝트는 명시적 `isLoading`/`error` 분기 사용.

이제 위 명세대로 모든 파일을 한 번에 생성·수정하세요. 작업 후 산출물 체크리스트를 항목별로 보고하세요.

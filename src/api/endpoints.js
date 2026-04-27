export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
  },
  problems: {
    list: '/api/problems',
    detail: (id) => `/api/problems/${id}`,
  },
  submissions: {
    create: '/api/submissions',
    detail: (id) => `/api/submissions/${id}`,
    answers: (id) => `/api/submissions/${id}/answers`,
  },
  reports: {
    list: '/api/reports',
    detail: (id) => `/api/reports/${id}`,
  },
}

export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
  },
  problems: {
    list: '/api/problems',
    detail: (id) => `/api/problems/${id}`,
  },
  execute: '/api/execute',
  exe: '/api/execute',
  submissions: {
    create: '/api/submissions',
    detail: (id) => `/api/submissions/${id}`,
    answers: (id) => `/api/submissions/${id}/answers`,
  },
  reports: {
    list: '/api/reports',
    detail: (id) => `/api/reports/${id}`,
    generate: '/api/reports/generate',
    download: (id) => `/api/reports/${id}/download`,
  },
  learnings: {
    list: '/api/learnings',
    save: '/api/learnings',
  },
}

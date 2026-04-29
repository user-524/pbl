export const queryKeys = {
  problems: {
    all: ['problems'],
    detail: (id) => ['problems', id],
  },
  submissions: {
    all: ['submissions'],
    detail: (id) => ['submissions', id],
  },
  reports: {
    all: ['reports'],
    detail: (id) => ['reports', id],
  },
  learnings: {
    all: ['learnings'],
    list: (anonymousId) => ['learnings', 'list', anonymousId],
  },
}

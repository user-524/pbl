// src/hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useApi(apiFn, ...args)
 *
 * API 함수와 인자를 받아 data / loading / error 상태를 관리한다.
 * refetch()로 수동 재요청 가능.
 *
 * @param {Function} apiFn - src/api/services.js 에서 import한 API 함수
 * @param {...any} args    - apiFn 에 전달할 인자 (변경 시 자동 재요청)
 * @returns {{ data, loading, error, refetch }}
 */
function useApi(apiFn, ...args) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // args 배열을 JSON으로 직렬화해 변경 감지
  const argsKey = JSON.stringify(args)
  const argsRef = useRef(args)
  argsRef.current = args

  const execute = useCallback(async () => {
    if (!apiFn) return
    setLoading(true)
    setError(null)
    try {
      const result = await apiFn(...argsRef.current)
      if (result?.success === false) {
        setError(result.message || '요청에 실패했습니다.')
        setData(null)
      } else {
        setData(result)
      }
    } catch (err) {
      setError(err.message || '알 수 없는 오류가 발생했습니다.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [apiFn]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute()
  }, [execute, argsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute }
}

export default useApi

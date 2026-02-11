import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export function useApi(url, options = {}) {
  const { immediate = true, params = {} } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (requestParams = {}) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(url, {
          params: { ...params, ...requestParams },
        })
        setData(response.data)
        return response.data
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [url, params]
  )

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { data, loading, error, execute, refetch: execute }
}

export function useMutation(method = 'post') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(
    async (url, data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await api[method](url, data)
        return response.data
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [method]
  )

  return { mutate, loading, error }
}

import { createContext, useState, useEffect, useCallback, useRef } from 'react'

export const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerData, setTimerData] = useState(null)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('timerState')
    if (savedTimer) {
      const { isRunning: wasRunning, elapsedTime: savedElapsed, timerData: savedData, startTime } = JSON.parse(savedTimer)
      
      if (wasRunning && startTime) {
        // Calculate elapsed time since last save
        const now = Date.now()
        const additionalTime = Math.floor((now - startTime) / 1000)
        setElapsedTime(savedElapsed + additionalTime)
        setIsRunning(true)
        setTimerData(savedData)
        startTimeRef.current = now - (savedElapsed * 1000)
      } else {
        setElapsedTime(savedElapsed)
        setTimerData(savedData)
      }
    }
  }, [])

  // Save timer state to localStorage
  useEffect(() => {
    const state = {
      isRunning,
      elapsedTime,
      timerData,
      startTime: startTimeRef.current,
    }
    localStorage.setItem('timerState', JSON.stringify(state))
  }, [isRunning, elapsedTime, timerData])

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const startTimer = useCallback((data = null) => {
    setTimerData(data)
    startTimeRef.current = Date.now() - (elapsedTime * 1000)
    setIsRunning(true)
  }, [elapsedTime])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setElapsedTime(0)
    setTimerData(null)
    startTimeRef.current = null
    localStorage.removeItem('timerState')
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resumeTimer = useCallback(() => {
    setIsRunning(true)
  }, [])

  const value = {
    isRunning,
    elapsedTime,
    timerData,
    startTimer,
    stopTimer,
    resetTimer,
    pauseTimer,
    resumeTimer,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

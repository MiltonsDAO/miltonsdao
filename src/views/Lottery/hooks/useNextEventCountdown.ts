import { useEffect, useState, useRef } from 'react'
import { useAppDispatch } from 'state'

const useNextEventCountdown = (nextEventTime: number): number => {
  const dispatch = useAppDispatch()
  const [secondsRemaining, setSecondsRemaining] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    const currentSeconds = Math.floor(Date.now() / 1000)
    const secondsRemainingCalc = nextEventTime - currentSeconds
    setSecondsRemaining(secondsRemainingCalc)

    timer.current = setInterval(() => {
      setSecondsRemaining((prevSecondsRemaining) => {
        // Clear current interval at end of countdown and fetch current lottery to get updated state
        if (prevSecondsRemaining <= 1) {
          clearInterval(timer.current)
        }
        return prevSecondsRemaining - 1
      })
    }, 1000)

    return () => clearInterval(timer.current)
  }, [setSecondsRemaining, nextEventTime, timer, dispatch])

  return secondsRemaining
}

export default useNextEventCountdown

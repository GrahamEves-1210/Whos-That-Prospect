import { useEffect, useRef, useState } from 'react';
import { formatCountdown } from '../game/time';

/** Ticks once a second toward `target` (UTC ms). Fires `onComplete` once when it hits zero. */
export function useCountdown(target: number, onComplete?: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = target - now;

  useEffect(() => {
    completedRef.current = false;
  }, [target]);

  useEffect(() => {
    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [remaining]);

  return { remaining, label: formatCountdown(remaining) };
}

import { useEffect, useState } from 'react';
import { formatCountdown } from '../game/time';
import { ClockIcon } from './icons';

interface Props {
  startedAt: number;
  finishedAt: number | null;
}

/** Elapsed time. Ticks while the game is live, freezes when it ends. */
export function Timer({ startedAt, finishedAt }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (finishedAt != null) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [finishedAt]);

  const elapsed = (finishedAt ?? now) - startedAt;

  return (
    <span className={`timer ${finishedAt != null ? 'timer--stopped' : ''}`} role="timer" aria-label="Elapsed time">
      <ClockIcon />
      {formatCountdown(elapsed)}
    </span>
  );
}

import { useCountdown } from '../hooks/useCountdown';

interface Props {
  target: number;
  onComplete?: () => void;
  className?: string;
}

/** HH:MM:SS until `target` (UTC ms). */
export function Countdown({ target, onComplete, className = '' }: Props) {
  const { label } = useCountdown(target, onComplete);
  return (
    <span className={`countdown ${className}`.trim()} role="timer" aria-live="off">
      {label}
    </span>
  );
}

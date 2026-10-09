import { useEffect, useMemo, useState } from 'react';

interface Props {
  /** Change this value to fire a burst; 0 = idle */
  fire: number;
  count?: number;
}

/* Single-accent palette: pigskin orange, its soft tint, ink and paper */
const COLORS = ['#013369', '#0080c5', '#c5dadf', '#1a1b22', '#fffdf9', '#efe7d6'];

/** Lightweight CSS confetti — no canvas, auto-cleans after the animation. */
export function Confetti({ fire, count = 120 }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!fire) return;
    setActive(fire);
    const t = window.setTimeout(() => setActive(0), 3400);
    return () => window.clearTimeout(t);
  }, [fire]);

  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.1,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      size: 8 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 160,
      shape: i % 3,
    }));
  }, [active, count]);

  if (!active) return null;

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti__piece confetti__piece--${p.shape}`}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: p.size,
            height: p.shape === 1 ? p.size * 0.5 : p.size,
            ['--rot' as string]: `${p.rotate}deg`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

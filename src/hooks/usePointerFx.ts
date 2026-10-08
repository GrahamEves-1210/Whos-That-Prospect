import { useEffect, useRef } from 'react';

/** Only run pointer effects on devices with a real hover-capable pointer, and never under reduced motion. */
function pointerFxEnabled(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/**
 * Magnetic hover: the element drifts toward the cursor while hovered and
 * springs back on leave. Writes CSS variables (--mx, --my) directly on the
 * element via rAF, so React never re-renders during pointer movement.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3, max = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !pointerFxEnabled()) return;
    let rect: DOMRect | null = null;
    let raf = 0;

    const set = (x: number, y: number) => {
      el.style.setProperty('--mx', `${x.toFixed(2)}px`);
      el.style.setProperty('--my', `${y.toFixed(2)}px`);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
      el.classList.add('is-magnet');
    };
    const move = (e: PointerEvent) => {
      if ((el as unknown as HTMLButtonElement).disabled) return;
      if (!rect) rect = el.getBoundingClientRect();
      const x = clamp((e.clientX - (rect.left + rect.width / 2)) * strength, max);
      const y = clamp((e.clientY - (rect.top + rect.height / 2)) * strength, max);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => set(x, y));
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      rect = null;
      el.classList.remove('is-magnet');
      set(0, 0);
    };

    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength, max]);

  return ref;
}


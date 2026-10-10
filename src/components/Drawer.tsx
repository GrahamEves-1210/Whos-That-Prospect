import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface Props {
  closing: boolean;
  /** Phones: the sheet has finished sinking into the nav bar */
  onClosed?: () => void;
  children: ReactNode;
}

/**
 * The menu sheet. Desktop: no animation, it simply appears joined to the nav bar and pushes the game down.
 * Phones: CSS animates it rising out of the bottom nav bar and sinking back on close. The sink travels
 * exactly the visible height, so it ends the instant the sheet's top edge reaches the bar, and the menu
 * unmounts on that same frame (the bar takes its rounded top then, never while the sheet is still moving).
 */
export function Drawer({ closing, onClosed, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    // -2px: the sheet's top border comes to rest exactly on the bar's top line (the drawer overlaps the bar by 2px)
    if (closing && el) el.style.setProperty('--sink', `${el.clientHeight + el.scrollTop - 2}px`);
  }, [closing]);

  return (
    <div ref={ref} className={`drawer ${closing ? 'drawer--closing' : ''}`}>
      <div
        className="drawer__inner"
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) onClosed?.();
        }}
      >
        {children}
      </div>
    </div>
  );
}

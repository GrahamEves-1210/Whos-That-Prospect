import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface Props {
  closing: boolean;
  /** Extra class on the sheet, e.g. to size a particular menu */
  className?: string;
  /** Phones: the sheet has finished sinking into the nav bar */
  onClosed?: () => void;
  children: ReactNode;
}

/**
 * The menu sheet. Desktop: no animation, it simply appears joined to the nav bar and pushes the game down.
 * Phones: CSS animates it rising out of the bottom nav bar; closing plays that exact animation in reverse.
 * Both travel exactly the visible height, and the menu unmounts the frame it lands, so the bar keeps
 * its open shape until then and switches back in one step (as it does when opening).
 */
export function Drawer({ closing, className = '', onClosed, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    // Opening and closing travel the same distance: the visible height. -2px: the sheet's top border sits
    // exactly on the bar's top line (the drawer overlaps the bar by 2px).
    if (el) el.style.setProperty('--sink', `${el.clientHeight + el.scrollTop - 2}px`);
  }, [closing]);

  return (
    <div ref={ref} className={`drawer ${className} ${closing ? 'drawer--closing' : ''}`.replace(/s+/g, ' ').trim()}>
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

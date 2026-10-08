import type { ReactNode } from 'react';

interface Props {
  closing: boolean;
  children: ReactNode;
}

/**
 * The menu sheet. Desktop: no animation, it simply appears joined to the nav bar and pushes the game down.
 * Phones: CSS animates it rising out of the bottom nav bar (and sinking back on close).
 */
export function Drawer({ closing, children }: Props) {
  return (
    <div className={`drawer ${closing ? 'drawer--closing' : ''}`}>
      <div className="drawer__inner">{children}</div>
    </div>
  );
}

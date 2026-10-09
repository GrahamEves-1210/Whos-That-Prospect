import type { ReactNode } from 'react';
import { useMagnetic } from '../hooks/usePointerFx';
import { Countdown } from './Countdown';
import { FilmRoomIcon, HelpIcon, StatsIcon, UserIcon } from './icons';
import { Logo } from './Logo';

export type MenuName = 'help' | 'stats' | 'flashback' | 'profile' | 'request';

interface Props {
  /** The open menu is animating closed */
  menuClosing?: boolean;
  openMenu: MenuName | null;
  onToggle: (menu: MenuName) => void;
  onHome: () => void;
  /** Next midnight Eastern (UTC ms), for the "next prospect" clock */
  nextReset: number;
  onCountdownComplete: () => void;
}

const ITEMS: Array<{ id: MenuName; label: string; Icon: typeof HelpIcon; tone: string }> = [
  { id: 'help', label: 'Help', Icon: HelpIcon, tone: 'orange' },
  { id: 'stats', label: 'Stats', Icon: StatsIcon, tone: 'turf' },
  { id: 'flashback', label: 'Film room', Icon: FilmRoomIcon, tone: 'gold' },
  { id: 'profile', label: 'Profile', Icon: UserIcon, tone: 'red' },
];

function ToolbarItem({ active, tone, onClick, children }: { active: boolean; tone: string; onClick: () => void; children: ReactNode }) {
  const ref = useMagnetic<HTMLButtonElement>(0.25, 6);
  return (
    <button
      ref={ref}
      type="button"
      className="toolbar__item"
      data-tone={tone}
      aria-pressed={active}
      onClick={(e) => {
        onClick();
        // Touch: drop focus so no pressed/focus styling lingers after closing.
        if (e.detail > 0) e.currentTarget.blur();
      }}
    >
      {children}
    </button>
  );
}

export function GameHeader({ openMenu, menuClosing = false, onToggle, onHome, nextReset, onCountdownComplete }: Props) {
  return (
    <header className="header">
      <button type="button" className="header__home" onClick={onHome} aria-label="Back to the start screen">
        <Logo className="header__logo" />
      </button>

      <p className="header__clock">
        <span className="eyebrow">Next prospect in</span>
        <Countdown target={nextReset} onComplete={onCountdownComplete} />
      </p>

      <nav className={`toolbar ${openMenu ? 'toolbar--open' : ''} ${menuClosing ? 'toolbar--closing' : ''}`} aria-label="Menu">
        {ITEMS.map(({ id, label, Icon, tone }) => (
          <ToolbarItem key={id} tone={tone} active={openMenu === id} onClick={() => onToggle(id)}>
            <Icon />
            <span>{label}</span>
          </ToolbarItem>
        ))}
      </nav>
    </header>
  );
}

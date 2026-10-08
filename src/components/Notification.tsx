import { CloseIcon } from './icons';
import { Button } from './Panel';

export interface NotificationMessage {
  id: number;
  text: string;
  tone?: 'success' | 'error' | 'neutral';
  /** Stay until dismissed */
  sticky?: boolean;
  action?: { label: string; onClick: () => void };
}

interface Props {
  notification: NotificationMessage | null;
  onClose: () => void;
}

/** Bottom-center toast. */
export function Notification({ notification, onClose }: Props) {
  const classes = ['notice', notification ? 'notice--visible' : '', notification?.tone ? `notice--${notification.tone}` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite">
      {notification && (
        <>
          <p>{notification.text}</p>
          {notification.action && <Button label={notification.action.label} onClick={notification.action.onClick} />}
          <button type="button" className="notice__close" onClick={onClose} aria-label="Dismiss">
            <CloseIcon />
          </button>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { Prospect } from '../data/types';

interface Props {
  prospect: Prospect;
  /** Full-color photo (game over) */
  revealed: boolean;
  /** While hidden: show the crisp black silhouette instead of the blurred shape */
  silhouette?: boolean;
}

/**
 * The prospect's real headshot. Hidden state renders the transparent PNG with
 * `brightness(0)`, blurred until the player asks for the silhouette hint; on
 * game over the filters animate away to reveal the photo.
 */
export function Headshot({ prospect, revealed, silhouette = false }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [prospect.headshotUrl]);

  if (!prospect.headshotUrl || failed) {
    return (
      <div className="headshot headshot--missing">
        <span className="eyebrow">No photo on file</span>
      </div>
    );
  }

  const cls = revealed ? 'headshot--revealed' : silhouette ? 'headshot--hidden' : 'headshot--hidden headshot--blurred';

  return (
    <img
      className={`headshot ${cls}`}
      src={prospect.headshotUrl}
      alt={revealed ? `${prospect.name} headshot` : silhouette ? 'Mystery prospect silhouette' : 'Mystery prospect, hidden'}
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

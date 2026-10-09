import { useEffect, useState } from 'react';
import { SILHOUETTES } from '../data/silhouettes';
import type { Prospect } from '../data/types';

interface Props {
  prospect: Prospect;
  /** Full-color photo (game over) */
  revealed: boolean;
  /** While hidden: the crisp silhouette instead of the blurred one */
  silhouette?: boolean;
}

/**
 * The prospect's picture. While the game is on, this shows a pre-rendered black silhouette
 * (public/silhouettes, made by `npm run silhouettes`), never the real photo: there's nothing to
 * download early and nothing relies on CSS filters. On game over the real ESPN headshot loads
 * on top of the silhouette and fades in once it has arrived, so the frame is never empty.
 */
export function Headshot({ prospect, revealed, silhouette = false }: Props) {
  const hash = SILHOUETTES[prospect.id];
  const blurSrc = hash ? `/silhouettes/${hash}-blur.png` : undefined;
  const sharpSrc = hash ? `/silhouettes/${hash}.png` : undefined;
  const silhouetteSrc = silhouette ? sharpSrc : blurSrc;

  const [photoLoaded, setPhotoLoaded] = useState(false);
  // True once the photo has finished fading in; only then is the silhouette underneath removed.
  const [photoSettled, setPhotoSettled] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [silhouetteFailed, setSilhouetteFailed] = useState(false);

  useEffect(() => {
    setPhotoLoaded(false);
    setPhotoSettled(false);
    setPhotoFailed(false);
    setSilhouetteFailed(false);
  }, [prospect.id]);

  // Warm the cache for the sharp silhouette so "Show silhouette" swaps instantly.
  useEffect(() => {
    if (!sharpSrc || revealed) return;
    const img = new Image();
    img.src = sharpSrc;
  }, [sharpSrc, revealed]);

  const showPhoto = revealed && !!prospect.headshotUrl && !photoFailed;
  // Keep the silhouette underneath until the photo has loaded and finished fading in.
  const showSilhouette = !!silhouetteSrc && !silhouetteFailed && (!showPhoto || !photoSettled);

  if (!showPhoto && !showSilhouette) {
    return (
      <div className="headshot headshot--missing">
        <span className="eyebrow">No photo on file</span>
      </div>
    );
  }

  return (
    <div className="headshot-stack">
      {showSilhouette && (
        <img
          key={silhouetteSrc}
          className="headshot headshot--silhouette"
          src={silhouetteSrc}
          alt={revealed ? '' : silhouette ? 'Mystery prospect silhouette' : 'Mystery prospect, hidden'}
          aria-hidden={revealed || undefined}
          draggable={false}
          onError={() => setSilhouetteFailed(true)}
        />
      )}
      {showPhoto && (
        <img
          className={`headshot headshot--photo ${photoLoaded ? 'is-loaded' : ''}`}
          src={prospect.headshotUrl}
          alt={`${prospect.name} headshot`}
          referrerPolicy="no-referrer"
          draggable={false}
          onLoad={() => {
            setPhotoLoaded(true);
            // Fallback in case the fade never runs (transitions disabled): settle after it would have ended
            window.setTimeout(() => setPhotoSettled(true), 500);
          }}
          onTransitionEnd={() => setPhotoSettled(true)}
          onError={() => setPhotoFailed(true)}
        />
      )}
    </div>
  );
}

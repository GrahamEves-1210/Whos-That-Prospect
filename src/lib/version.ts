/**
 * Has a newer build gone live since this tab loaded? Compares the main script this page is running with
 * the one the live index.html points to now. A tab left open across a deploy would otherwise keep
 * playing the old schedule. Always false in dev (no hashed bundle) or when the check can't run.
 */
export async function isNewerVersionLive(): Promise<boolean> {
  const current = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]')?.src;
  if (!current) return false;
  try {
    const html = await (await fetch('/', { cache: 'no-store' })).text();
    const live = html.match(/\/assets\/index-[\w-]+\.js/)?.[0];
    return !!live && !current.endsWith(live);
  } catch {
    return false;
  }
}

/** Load the newest build fresh, on today's game (no Film room address). */
export function reloadToLatest(): void {
  window.location.replace('/');
}

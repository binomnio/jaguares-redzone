// Keep the existing Vikingos sentinel compatible with deployed databases.
export const TBD_GAME_DATE = '2999-01-01T00:00:00.000Z';

export type ScheduledGame = {
  game_date?: string | null;
  jornada?: string | null;
  status?: string | null;
};

export function isTbdDate(value?: string | null): boolean {
  return Boolean(value && new Date(value).getUTCFullYear() > 2900);
}

export function formatGameDate(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return { date: '', time: '', isTBD: false };
  if (isTbdDate(value)) return { date: 'Por Definir', time: 'TBD', isTBD: true };
  const date = new Date(value);
  return {
    date: date.toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: 'numeric',
    }).replace('.', ''),
    time: date.toLocaleTimeString('es-MX', {
      timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false,
    }),
    isTBD: false,
  };
}

export function sortGames<T extends ScheduledGame>(games?: readonly T[] | null): T[] {
  return [...(games ?? [])].sort((a, b) => {
    const aTbd = isTbdDate(a.game_date);
    const bTbd = isTbdDate(b.game_date);
    if (aTbd !== bTbd) return aTbd ? 1 : -1;
    if (aTbd) return (a.jornada ?? '').localeCompare(b.jornada ?? '', 'es', { numeric: true });
    const aTime = a.game_date ? Date.parse(a.game_date) : NaN;
    const bTime = b.game_date ? Date.parse(b.game_date) : NaN;
    if (!Number.isFinite(aTime)) return Number.isFinite(bTime) ? 1 : 0;
    if (!Number.isFinite(bTime)) return -1;
    return aTime - bTime;
  });
}

export function getInitialGameIndex(games: readonly ScheduledGame[], now = Date.now()): number {
  // A TBD fixture must not displace a match with a confirmed future date.
  const scheduled = games.findIndex(game => game.status !== 'final' && !isTbdDate(game.game_date)
    && Boolean(game.game_date) && Date.parse(game.game_date!) > now);
  if (scheduled !== -1) return scheduled;
  const tbd = games.findIndex(game => game.status !== 'final' && isTbdDate(game.game_date));
  return tbd !== -1 ? tbd : games.length - 1;
}

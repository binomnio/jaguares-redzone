export type RosterPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: string | number | null;
  position?: string | null;
  photo_url?: string | null;
  height?: string | null;
  weight?: string | null;
  is_featured?: boolean | null;
};

type NumberedPlayer = { jersey_number?: string | number | null };

function jerseyNumber(value: NumberedPlayer['jersey_number']): number {
  if (value == null || String(value).trim() === '') return Infinity;
  const number = Number(value);
  return Number.isFinite(number) ? number : Infinity;
}

export function sortPlayers<T extends NumberedPlayer>(players?: readonly T[] | null): T[] {
  // Stable ties retain the last_name fallback supplied by the public query.
  return [...(players ?? [])].sort((a, b) => {
    const aNumber = jerseyNumber(a.jersey_number);
    const bNumber = jerseyNumber(b.jersey_number);
    return aNumber === bNumber ? 0 : aNumber < bNumber ? -1 : 1;
  });
}

export function getHomePlayers<T extends NumberedPlayer & { is_featured?: boolean | null }>(players?: readonly T[] | null) {
  const sorted = sortPlayers(players);
  return {
    rosterPreview: sorted.slice(0, 10),
    featuredPlayers: sorted.filter(player => player.is_featured).slice(0, 4),
  };
}

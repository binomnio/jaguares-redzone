import type { SupabaseClient } from '@supabase/supabase-js';

export class InputError extends Error {}
export class AccessError extends Error {
  status: 401 | 403;
  constructor(status: 401 | 403) { super(status === 401 ? 'No autorizado' : 'Acceso denegado'); this.status = status; }
}

export function isAdmin(user: { app_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === 'admin';
}

export async function requireAdmin(client: SupabaseClient) {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new AccessError(401);
  if (!isAdmin(user)) throw new AccessError(403);
  return user;
}

export function safeColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

export function validateId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new InputError('ID inválido');
  return id;
}

type Rule = { kind: 'text' | 'url' | 'image' | 'integer' | 'boolean' | 'date' | 'status' | 'color'; required?: boolean; max?: number; min?: number };
const text = (required = false, max = 200): Rule => ({ kind: 'text', required, max });
const integer = (min = 0): Rule => ({ kind: 'integer', min });
const image: Rule = { kind: 'image' };
const schemas: Record<string, Record<string, Rule>> = {
  games: {
    opponent_name: text(true), opponent_logo_url: image, opponent_short_name: text(false, 4), opponent_record: text(false, 30),
    game_date: { kind: 'date', required: true }, location: text(), is_home: { kind: 'boolean' }, status: { kind: 'status' },
    our_score: integer(), opponent_score: integer(), jornada: text(), maps_url: { kind: 'url' }, stream_url: { kind: 'url' },
  },
  players: {
    first_name: text(true), last_name: text(true), jersey_number: text(true, 10), position: text(false, 50), photo_url: image,
    height: text(false, 30), weight: text(false, 30), bio: text(false, 5000), active: { kind: 'boolean' }, is_featured: { kind: 'boolean' },
  },
  standings: {
    position: { ...integer(1), required: true }, team_name: text(true), short_name: text(false, 4), logo_url: image,
    wins: integer(), losses: integer(), ties: integer(), pf: integer(), pc: integer(), dif: integer(-2147483648), stk: text(false, 30),
  },
  team_settings: {
    team_name: text(true), logo_url: image, short_name: text(false, 4), current_record: text(false, 30),
    ...Object.fromEntries(['primary_color', 'secondary_color', 'layout_color', 'bg_color', 'text_color', 'glow_color', 'button_color'].map(k => [k, { kind: 'color' } as Rule])),
  },
};

export function validatePayload(table: string, input: unknown) {
  const schema = schemas[table];
  if (!schema || !input || typeof input !== 'object' || Array.isArray(input)) throw new InputError('Datos inválidos');
  const body = input as Record<string, unknown>;
  const output: Record<string, string | number | boolean | null> = {};
  for (const key of Object.keys(body)) if (!Object.hasOwn(schema, key)) throw new InputError(`Campo no permitido: ${key}`);
  for (const [key, rule] of Object.entries(schema)) {
    const value = body[key];
    if (value === undefined) {
      if (rule.required) throw new InputError(`Campo requerido: ${key}`);
      continue;
    }
    if (value === null || value === '') {
      if (rule.required || ['boolean', 'integer', 'status', 'color'].includes(rule.kind)) throw new InputError(`Campo inválido: ${key}`);
      output[key] = value;
      continue;
    }
    let valid = false;
    switch (rule.kind) {
      case 'text': valid = typeof value === 'string' && value.length <= (rule.max ?? 200) && (!rule.required || value.trim().length > 0); break;
      case 'integer': valid = typeof value === 'number' && Number.isInteger(value) && value >= (rule.min ?? 0) && value <= 2147483647; break;
      case 'boolean': valid = typeof value === 'boolean'; break;
      case 'status': valid = value === 'upcoming' || value === 'final'; break;
      case 'color': valid = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value); break;
      case 'date': valid = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10); break;
      case 'url':
      case 'image':
        if (typeof value === 'string' && value.length <= 2048) {
          try {
            const url = new URL(value);
            valid = ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
            if (rule.kind === 'image') valid = valid && url.protocol === 'https:' && ['bnsports.com.mx', 'images.unsplash.com', 'tuservidor.com'].includes(url.hostname) && !url.port;
          } catch { valid = false; }
        }
        break;
    }
    if (!valid) throw new InputError(`Campo inválido: ${key}`);
    output[key] = value as string | number | boolean;
  }
  return output;
}

export async function mutate(request: Request, client: SupabaseClient, table: string, id?: string) {
  try {
    await requireAdmin(client);
    if (id !== undefined) validateId(id);
    let body: unknown;
    try { body = await request.json(); } catch { throw new InputError('JSON inválido'); }
    const payload = validatePayload(table, body);
    const query = id === undefined ? client.from(table).insert([payload]) : client.from(table).update(payload).eq('id', id);
    const { data, error } = await query.select();
    if (error) return Response.json({ error: 'Error interno' }, { status: 500 });
    if (id !== undefined && !data?.length) return Response.json({ error: 'Registro no encontrado' }, { status: 404 });
    return Response.json(data);
  } catch (error) {
    if (error instanceof AccessError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

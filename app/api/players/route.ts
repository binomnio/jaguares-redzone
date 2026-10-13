import { createClient } from '@/utils/supabase/server';
import { mutate } from '@/utils/security';

export async function POST(request: Request) {
  try {
    const response = await mutate(request, await createClient(), 'players');
    return response;
  } catch {
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

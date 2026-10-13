import { createClient } from '@/utils/supabase/server';
import { mutate } from '@/utils/security';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await mutate(request, await createClient(), 'players', id);
    return response;
  } catch {
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

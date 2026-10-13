import { createClient } from '@/utils/supabase/server';
import { mutate } from '@/utils/security';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const response = await mutate(request, await createClient(), 'standings');
    if (response.ok) { revalidatePath('/'); revalidatePath('/posiciones'); }
    return response;
  } catch {
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}

// app/api/standings/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar sesión (Seguridad)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('standings')
      .insert([
        {
          position: body.position,
          team_name: body.team_name,
          short_name: body.short_name,
          logo_url: body.logo_url,
          wins: body.wins,
          losses: body.losses,
          ties: body.ties,
          pf: body.pf,
          pc: body.pc,
          dif: body.dif,
          stk: body.stk,
        }
      ])
      .select();

    if (error) throw error;

    // Limpiar caché tras una inserción exitosa
    revalidatePath('/');
    revalidatePath('/posiciones');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('ERROR API STANDINGS POST:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
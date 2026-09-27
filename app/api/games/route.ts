// app/api/games/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar sesión por seguridad extra
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          opponent_name: body.opponent_name,
          opponent_logo_url: body.opponent_logo_url,
          // ... otros campos
          opponent_short_name: body.opponent_short_name,
          opponent_record: body.opponent_record,
          game_date: body.game_date,
          location: body.location,
          is_home: body.is_home,
          status: body.status,
          our_score: body.our_score,
          opponent_score: body.opponent_score,
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
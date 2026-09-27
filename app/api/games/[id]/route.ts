// app/api/games/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Actualizar tipo
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params; // <-- Resolver params
    
    // ... (el resto del código queda igual, pero usa resolvedParams.id)
    
    const body = await request.json();
    const gameId = resolvedParams.id; // <-- Usar la variable resuelta

    // ... llamada a supabase.update() ...

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('games')
      .update({
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
        
        // ¡ESTOS 3 DEBEN ESTAR AQUÍ ADENTRO!
        jornada: body.jornada,
        maps_url: body.maps_url,
        stream_url: body.stream_url,
      })
      .eq('id', gameId)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
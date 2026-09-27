// app/api/standings/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const teamId = resolvedParams.id;

    const { data, error } = await supabase
      .from('standings')
      .update({
        position: body.position,
        team_name: body.team_name,
        short_name: body.short_name,
        logo_url: body.logo_url,
        wins: body.wins,
        losses: body.losses,
        ties: body.ties,
        // ... (wins, losses, ties)
        pf: body.pf,
        pc: body.pc,
        dif: body.dif,
        stk: body.stk,
      })
      .eq('id', teamId)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('ERROR API STANDINGS PUT:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
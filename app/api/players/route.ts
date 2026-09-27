// app/api/players/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          first_name: body.first_name,
          last_name: body.last_name,
          jersey_number: body.jersey_number,
          position: body.position,
          photo_url: body.photo_url,
          height: body.height,
          weight: body.weight,
          bio: body.bio,
          active: body.active,
          is_featured: body.is_featured,
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('ERROR API PLAYERS POST:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
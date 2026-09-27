// app/(admin)/admin/players/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import PlayerForm from '@/components/PlayerForm';
import Link from 'next/link';

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !player) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-red-500">Error: Jugador no encontrado</h2>
        <Link href="/admin/players" className="text-blue-400 hover:underline mt-4 inline-block">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/players" className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </Link>
        <h2 className="text-3xl font-black uppercase italic">
          Editar <span className="text-team-primary">Jugador</span>
        </h2>
      </div>
      
      <PlayerForm initialData={player} />
    </div>
  );
}
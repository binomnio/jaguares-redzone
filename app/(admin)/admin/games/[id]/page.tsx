// app/(admin)/admin/games/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import GameForm from '@/components/GameForm';
import Link from 'next/link';

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // En versiones recientes de Next.js, los params de rutas dinámicas deben resolverse asíncronamente
  const resolvedParams = await params;

  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !game) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-red-500">Error: Partido no encontrado</h2>
        <p className="text-gray-400 mt-2 text-sm">{error?.message}</p>
        <Link href="/admin/games" className="text-blue-400 hover:underline mt-4 inline-block">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/games" className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </Link>
        <h2 className="text-3xl font-black uppercase italic">
          Editar <span className="text-team-primary">Partido</span>
        </h2>
      </div>

      <GameForm initialData={game} />
    </div>
  );
}
// app/(admin)/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Consultas rápidas para mostrar estadísticas en el dashboard
  const { count: playersCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  const { count: upcomingGamesCount } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'upcoming');

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-black mb-8">Resumen General</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Roster */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Jugadores Activos</h3>
          <p className="text-5xl font-black text-team-primary">{playersCount || 0}</p>
          <p className="mt-4 text-sm text-gray-500">Administra perfiles, fotos y estadísticas.</p>
        </div>

        {/* Tarjeta de Juegos */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Próximos Partidos</h3>
          <p className="text-5xl font-black text-white">{upcomingGamesCount || 0}</p>
          <p className="mt-4 text-sm text-gray-500">Actualiza marcadores y da de alta nuevas jornadas.</p>
        </div>
      </div>
    </div>
  );
}
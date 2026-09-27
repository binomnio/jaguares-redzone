// app/(admin)/admin/games/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export const revalidate = 0; // No cachear en el admin

export default async function AdminGamesPage() {
  const supabase = await createClient();

  // Traer los juegos ordenados por fecha
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .order('game_date', { ascending: true });

  if (error) {
    console.error('Error fetching games:', error);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase italic">Gestión de Partidos</h2>
        <Link 
          href="/admin/games/new" 
          className="bg-team-primary hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm uppercase"
        >
          + Nuevo Partido
        </Link>
      </div>

      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 border-b border-gray-800">Fecha</th>
              <th className="p-4 border-b border-gray-800">Rival</th>
              <th className="p-4 border-b border-gray-800 text-center">Localía</th>
              <th className="p-4 border-b border-gray-800 text-center">Estatus</th>
              <th className="p-4 border-b border-gray-800 text-center">Marcador (N - R)</th>
              <th className="p-4 border-b border-gray-800">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {games?.map((game) => (
              <tr key={game.id} className="hover:bg-gray-900/50 transition-colors border-b border-gray-800/50">
                <td className="p-4">
                  {new Date(game.game_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4 font-bold">{game.opponent_name}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${game.is_home ? 'bg-team-primary/20 text-team-primary' : 'bg-gray-700 text-gray-300'}`}>
                    {game.is_home ? 'LOCAL' : 'VISITA'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    game.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 
                    game.status === 'final' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {game.status}
                  </span>
                </td>
                <td className="p-4 text-center font-mono font-bold text-lg">
                  {game.status === 'final' ? `${game.our_score} - ${game.opponent_score}` : '-'}
                </td>
                <td className="p-4">
                  <Link href={`/admin/games/${game.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(!games || games.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay partidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

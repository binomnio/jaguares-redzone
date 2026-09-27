// app/(admin)/admin/players/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0;

export default async function AdminPlayersPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('jersey_number', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase italic">
          Gestión de <span className="text-team-primary">Roster</span>
        </h2>
        <Link 
          href="/admin/players/new" 
          className="bg-team-primary hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg uppercase tracking-wider text-sm transition-colors"
        >
          + Agregar Jugador
        </Link>
      </div>

      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Jugador</th>
              <th className="p-4">Posición</th>
              <th className="p-4">Estatura / Peso</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-white">
            {players?.map((player) => (
              <tr key={player.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="p-4 font-black text-team-primary text-lg">{player.jersey_number}</td>
                <td className="p-4 font-bold flex items-center gap-3">
                  <div className="w-10 h-10 relative bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    {player.photo_url ? (
                      <Image src={player.photo_url} alt={player.first_name} fill className="object-cover" />
                    ) : (
                      <span className="text-gray-500 text-xs w-full h-full flex items-center justify-center">Foto</span>
                    )}
                  </div>
                  <div>
                    <span className="block">{player.first_name}</span>
                    <span className="block text-gray-400 uppercase tracking-wider text-xs">{player.last_name}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-300">{player.position}</td>
                <td className="p-4 text-gray-400 text-xs">
                  {player.height || '-'} / {player.weight || '-'}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${player.active ? 'bg-green-900/50 text-green-500' : 'bg-red-900/50 text-red-500'}`}>
                    {player.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link 
                    href={`/admin/players/${player.id}`}
                    className="text-team-primary hover:text-white uppercase text-xs font-bold tracking-widest transition-colors"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(!players || players.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay jugadores registrados en el roster.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
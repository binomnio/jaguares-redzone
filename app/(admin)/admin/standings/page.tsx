// app/(admin)/admin/standings/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0; // Siempre fresco en admin

export default async function AdminStandingsPage() {
  const supabase = await createClient();

  const { data: standings } = await supabase
    .from('standings')
    .select('*')
    .order('position', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase italic">
          Gestión de <span className="text-team-primary">Posiciones</span>
        </h2>
        <Link 
          href="/admin/standings/new" 
          className="bg-team-primary hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg uppercase tracking-wider text-sm transition-colors"
        >
          + Agregar Equipo
        </Link>
      </div>

      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4">Pos</th>
              <th className="p-4">Equipo</th>
              <th className="p-4 text-center">G-E-P</th>
              {/* Nuevas cabeceras */}
              <th className="p-4 text-center">PF</th>
              <th className="p-4 text-center">PC</th>
              <th className="p-4 text-center">DIF</th>
              <th className="p-4 text-center">STK</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-white">
            {standings?.map((team) => (
              <tr key={team.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="p-4 font-black text-team-primary">{team.position}</td>
                <td className="p-4 font-bold flex items-center gap-3">
                  {team.logo_url && <div className="w-8 h-8 relative"><Image src={team.logo_url} alt={team.team_name} fill className="object-contain" /></div>}
                  {team.team_name}
                </td>
                <td className="p-4 text-center font-mono"><span className="text-green-500">{team.wins}</span> - {team.ties} - <span className="text-red-500">{team.losses}</span></td>
                
                {/* Nuevos datos */}
                <td className="p-4 text-center text-gray-400">{team.pf}</td>
                <td className="p-4 text-center text-gray-400">{team.pc}</td>
                <td className="p-4 text-center font-bold">{team.dif > 0 ? `+${team.dif}` : team.dif}</td>
                <td className="p-4 text-center font-bold text-team-primary">{team.stk}</td>
                
                <td className="p-4 text-right">
                  <Link href={`/admin/standings/${team.id}`} className="text-team-primary hover:text-white uppercase text-xs font-bold tracking-widest transition-colors">Editar</Link>
                </td>
              </tr>
            ))}
            {(!standings || standings.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No hay equipos en la tabla de posiciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
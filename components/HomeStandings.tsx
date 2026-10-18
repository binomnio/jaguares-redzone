import Image from 'next/image';

type Standing = {
  id: string; position: number; team_name: string; short_name?: string | null;
  logo_url?: string | null; wins: number; ties: number; losses: number; pf: number; pc: number;
};

export default function HomeStandings({ standings = [], teamName }: { standings?: Standing[] | null; teamName: string }) {
  standings = standings ?? [];
  return (
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-team-text rounded-full"></span> Posiciones
                </h2>
                <div className="glass-panel rounded-2xl overflow-x-auto border border-white/80">
                  <table aria-label="Tabla de posiciones" className="w-full text-left text-sm min-w-[500px]">
                    <thead className="border-b border-gray-200/50 bg-white/40">
                      <tr>
                        <th className="p-3 md:p-4 text-center font-black text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest">Pos</th>
                        <th className="p-3 md:p-4 font-black text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest">Equipo</th>
                        <th className="p-3 md:p-4 text-center font-black text-team-text text-[9px] md:text-[10px] uppercase tracking-widest">G</th>
                        <th className="p-3 md:p-4 text-center font-black text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest">E</th>
                        <th className="p-3 md:p-4 text-center font-black text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest">P</th>
                        <th className="p-3 md:p-4 text-center font-black text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest">PF</th>
                        <th className="p-3 md:p-4 text-center font-black text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest">PC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/30">
                      {standings.map((team) => (
                        <tr key={team.id} className={`transition-colors hover:bg-white/50 ${team.team_name === teamName ? 'bg-team-primary/5' : ''}`}>
                          <td className="p-3 md:p-4 text-center font-black text-gray-400">{team.position}</td>
                          <td className="p-3 md:p-4 font-black text-gray-800 flex items-center gap-2 md:gap-3">
                            {team.logo_url && <div className="w-5 h-5 md:w-6 md:h-6 relative"><Image src={team.logo_url} alt={team.team_name} fill sizes="(min-width: 768px) 24px, 20px" className="object-contain"/></div>}
                            <span className="truncate max-w-[120px]">{team.short_name || team.team_name}</span>
                          </td>
                          <td className="p-3 md:p-4 text-center font-black text-team-text">{team.wins}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-500">{team.ties}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-500">{team.losses}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-400 text-xs">{team.pf}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-400 text-xs">{team.pc}</td>
                        </tr>
                      ))}
                      {standings.length === 0 && (
                        <tr><td colSpan={7} className="p-4 text-center text-gray-500">No hay posiciones registradas.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
  );
}

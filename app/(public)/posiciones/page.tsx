// app/(public)/posiciones/page.tsx
import { createClient } from '@/utils/supabase/server';
import InnerHeader from '@/components/InnerHeader';
import Image from 'next/image';

export const revalidate = 60;

export default async function PosicionesPage() {
  const supabase = await createClient();

  const { data: teamData } = await supabase.from('team_settings').select('*').limit(1).maybeSingle();
  const { data: standings } = await supabase.from('standings').select('*').order('position', { ascending: true });

  const logoUrl = teamData?.logo_url || "https://bnsports.com.mx/logos/halcones.png";
  const bgUrl = teamData?.header_bg_url; 

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20">
      
      <InnerHeader 
        title="Posiciones" 
        subtitle="Clasificación general y estadísticas de la temporada 2026." 
        logoUrl={logoUrl} 
        bgUrl={bgUrl} 
      />

      <div className="max-w-5xl mx-auto px-4 mt-12 relative z-20">
        
        <div className="flex justify-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
            {/* Cambiado a bg-team-text */}
            <span className="w-2 h-8 bg-team-text rounded-full"></span> Tabla General
          </h2>
        </div>

        <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/80 shadow-sm">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px] md:min-w-full">
              <thead className="border-b border-gray-200/50 bg-white/40">
                <tr>
                  <th className="p-3 md:p-5 text-center font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">Pos</th>
                  <th className="p-3 md:p-5 font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">Equipo</th>
                  {/* Cambiado a text-team-text */}
                  <th className="p-3 md:p-5 text-center font-black text-team-text text-[10px] md:text-xs uppercase tracking-widest">G</th>
                  <th className="p-3 md:p-5 text-center font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">E</th>
                  <th className="p-3 md:p-5 text-center font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">P</th>
                  <th className="p-3 md:p-5 text-center font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">PF</th>
                  <th className="p-3 md:p-5 text-center font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">PC</th>
                  <th className="p-3 md:p-5 text-center font-black text-gray-400 text-[10px] md:text-xs uppercase tracking-widest">DIF</th>
                  {/* Cambiado a text-team-text */}
                  <th className="p-3 md:p-5 text-center font-black text-team-text text-[10px] md:text-xs uppercase tracking-widest">STK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30">
                {standings?.map((team) => (
                  <tr key={team.id} className={`transition-colors hover:bg-white/50 ${team.team_name === teamData?.team_name ? 'bg-team-text/5' : ''}`}>
                    <td className="p-3 md:p-5 text-center text-sm md:text-base font-black text-gray-400">{team.position}</td>
                    
                    <td className="p-3 md:p-5 font-black text-gray-800 flex items-center gap-2 md:gap-4">
                      {team.logo_url && (
                        <div className="w-6 h-6 md:w-8 md:h-8 relative flex-shrink-0">
                          <Image src={team.logo_url} alt={team.team_name} fill className="object-contain drop-shadow-sm"/>
                        </div>
                      )}
                      <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-full block md:hidden">{team.short_name || team.team_name}</span>
                      <span className="truncate max-w-[150px] md:max-w-full hidden md:block">{team.team_name}</span>
                    </td>
                    
                    {/* Cambiado a text-team-text */}
                    <td className="p-3 md:p-5 text-center text-sm md:text-base font-black text-team-text">{team.wins}</td>
                    <td className="p-3 md:p-5 text-center text-sm md:text-base font-bold text-gray-500">{team.ties}</td>
                    <td className="p-3 md:p-5 text-center text-sm md:text-base font-bold text-gray-500">{team.losses}</td>
                    
                    <td className="p-3 md:p-5 text-center text-xs md:text-sm font-bold text-gray-500">{team.pf}</td>
                    <td className="p-3 md:p-5 text-center text-xs md:text-sm font-bold text-gray-500">{team.pc}</td>
                    <td className="p-3 md:p-5 text-center text-sm md:text-base font-black text-gray-700">
                      {team.dif > 0 ? `+${team.dif}` : team.dif}
                    </td>
                    {/* Cambiado a text-team-text */}
                    <td className="p-3 md:p-5 text-center text-sm md:text-base font-black text-team-text uppercase">
                      {team.stk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </main>
  );
}
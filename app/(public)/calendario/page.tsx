// app/(public)/calendario/page.tsx
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import InnerHeader from '@/components/InnerHeader';

export const revalidate = 60; // Refrescar caché cada minuto

// Función compartida para la hora correcta de CDMX
function formatGameDate(dateString: string) {
  if (!dateString) return { date: '', time: '' };
  const dateObj = new Date(dateString);
  const date = dateObj.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
  const time = dateObj.toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false });
  return { date, time };
}

export default async function CalendarioPage() {
  const supabase = await createClient();

  // Traer la identidad del equipo
  const { data: teamData } = await supabase
    .from('team_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  const teamName = teamData?.team_name || "Halcones";
  const teamShortName = teamData?.short_name || "HAL";
  const teamLogo = teamData?.logo_url || "https://bnsports.com.mx/logos/halcones.png";
  const bgUrl = teamData?.header_bg_url; 

  const { data: allGames } = await supabase
    .from('games')
    .select('*')
    .order('game_date', { ascending: true });

  return (
    // Fondo homologado con Home y Roster
    <main className="min-h-screen bg-[#f8fafc] text-gray-900 pb-20">
      
      <InnerHeader 
        title="Calendario Oficial" 
        subtitle={`Sigue el camino de ${teamName} durante la temporada 2026. Encuentra resultados, ubicaciones y transmisiones.`}
        logoUrl={teamLogo} 
        bgUrl={bgUrl} 
      />
    
      <div className="max-w-4xl mx-auto px-4 mt-12 relative z-20">
        
        {/* Título de Sección con el estilo del Home */}
        <div className="flex justify-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
            <span className="w-2 h-8 bg-team-text rounded-full"></span> Temporada Regular
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {allGames?.map((game) => {
            const isFinal = game.status === 'final';
            const exactDate = formatGameDate(game.game_date);
            
            const homeLogo = game.is_home ? teamLogo : game.opponent_logo_url;
            const awayLogo = game.is_home ? game.opponent_logo_url : teamLogo;
            const homeShort = game.is_home ? teamShortName : (game.opponent_short_name || 'VIS');
            const awayShort = game.is_home ? (game.opponent_short_name || 'VIS') : teamShortName;

            const isBye = game.opponent_short_name?.toUpperCase() === 'BYE';
            const ourScoreDisplay = isBye ? 1 : (game.our_score || 0);
            const oppScoreDisplay = isBye ? 0 : (game.opponent_score || 0);
            
            const homeScoreDisplay = game.is_home ? ourScoreDisplay : oppScoreDisplay;
            const awayScoreDisplay = game.is_home ? oppScoreDisplay : ourScoreDisplay;

            const homeWon = isFinal && (homeScoreDisplay > awayScoreDisplay);
            const awayWon = isFinal && (awayScoreDisplay > homeScoreDisplay);
            const isTie = isFinal && (homeScoreDisplay === awayScoreDisplay);

            return (
              // Tarjeta estilo Glassmorphism homologada
              <div key={game.id} className="glass-panel rounded-2xl flex flex-col border border-white/80 glow-primary-hover transition-all overflow-hidden group">
                
                {/* Header: Jornada y Status */}
                <div className="w-full bg-gray-50/50 border-b border-gray-200/50 px-5 py-3 flex justify-between items-center">
                  <span className="text-team-text text-xs font-black uppercase tracking-widest">{game.jornada || 'Jornada Libre'}</span>
                  {isFinal ? (
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Finalizado</span>
                  ) : (
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 animate-pulse">Próximo</span>
                  )}
                </div>

                {/* Cuerpo: Equipos y Marcador */}
                <div className="flex w-full items-center justify-between px-5 py-6">
                  
                  {/* Local */}
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-16 h-16 md:w-24 md:h-24 relative mb-2 group-hover:scale-105 transition-transform">
                      <Image src={homeLogo} alt={homeShort} fill className={`object-contain ${isFinal && !homeWon && !isTie ? 'opacity-60 grayscale' : 'drop-shadow-lg'}`} />
                    </div>
                    <span className="text-sm md:text-lg font-black text-gray-800 uppercase tracking-tight">{homeShort}</span>
                  </div>

                  {/* Marcador Central */}
                  <div className="flex flex-col items-center justify-center w-1/3">
                    {isFinal ? (
                      <div className="flex items-center gap-2 md:gap-4 text-3xl md:text-5xl font-black">
                        <span className={homeWon || isTie ? 'text-gray-900 drop-shadow-sm' : 'text-gray-300'}>{homeScoreDisplay}</span>
                        <span className="text-gray-200 text-2xl md:text-3xl">-</span>
                        <span className={awayWon || isTie ? 'text-gray-900 drop-shadow-sm' : 'text-gray-300'}>{awayScoreDisplay}</span>
                      </div>
                    ) : (
                      <span className="text-2xl md:text-4xl font-black text-gray-300 drop-shadow-sm">VS</span>
                    )}
                  </div>

                  {/* Visita */}
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-16 h-16 md:w-24 md:h-24 relative mb-2 group-hover:scale-105 transition-transform">
                      <Image src={awayLogo} alt={awayShort} fill className={`object-contain ${isFinal && !awayWon && !isTie ? 'opacity-60 grayscale' : 'drop-shadow-lg'}`} />
                    </div>
                    <span className="text-sm md:text-lg font-black text-gray-800 uppercase tracking-tight">{awayShort}</span>
                  </div>
                </div>

                {/* Footer: Fecha, Estadio y Botones */}
                <div className="w-full bg-white/40 border-t border-gray-100/50 px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  
                  <div className="flex flex-col text-[10px] md:text-xs uppercase font-bold tracking-widest text-gray-500 text-center md:text-left gap-1.5 w-full md:w-auto">
                    <div className="flex items-center justify-center md:justify-start gap-1.5">
                      <svg className="w-4 h-4 text-team-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{exactDate.date} • {exactDate.time} hrs</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1.5">
                      <svg className="w-4 h-4 text-team-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="truncate max-w-[200px]">{game.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto justify-center">
                    {game.maps_url && (
                      <a href={game.maps_url} target="_blank" rel="noopener noreferrer"
                         className="flex-1 md:flex-none flex items-center justify-center gap-1.5 glass-panel hover:bg-team-text/10 border border-team-text/30 text-team-text px-4 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-colors shadow-sm">
                        Mapa
                      </a>
                    )}
                    {game.stream_url && (
                      <a href={game.stream_url} target="_blank" rel="noopener noreferrer"
                         className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-team-button hover:bg-team-button/90 text-white px-4 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-colors shadow-md shadow-team-button/20">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        {isFinal ? 'Video' : 'Vivo'}
                      </a>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
          
          {(!allGames || allGames.length === 0) && (
            <div className="text-center py-24 glass-panel border border-white/60 rounded-[2rem] shadow-sm">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aún no hay partidos programados</p>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
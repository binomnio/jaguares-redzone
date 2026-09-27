// app/(public)/page.tsx
import NextGameHero from '@/components/NextGameHero';
import PlayerCard from '@/components/PlayerCard'; 
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60; 

// Función auxiliar para forzar la lectura en el horario oficial de México
function formatGameDate(dateString: string) {
  if (!dateString) return { date: '', time: '' };
  
  const dateObj = new Date(dateString);
  const date = dateObj.toLocaleDateString('es-MX', { 
    timeZone: 'America/Mexico_City', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace('.', ''); 

  const time = dateObj.toLocaleTimeString('es-MX', { 
    timeZone: 'America/Mexico_City', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
  
  return { date, time };
}

export default async function HomePage() {
  const supabase = await createClient();

  // Datos del Equipo
  const { data: teamData } = await supabase.from('team_settings').select('*').limit(1).maybeSingle();
  const teamName = teamData?.team_name || "Halcones";
  const teamShortName = teamData?.short_name || "HAL";
  const teamRecord = teamData?.current_record || "0-0";
  const teamLogo = teamData?.logo_url || "https://bnsports.com.mx/logos/halcones.png";
  const heroBackground = teamData?.header_bg_url || "https://images.unsplash.com/photo-1659092375775-4e72014d7818"; 

  // Listas
  const { data: nextGame } = await supabase.from('games').select('*').eq('status', 'upcoming').order('game_date', { ascending: true }).limit(1).maybeSingle();
  const { data: allGames } = await supabase.from('games').select('*').order('game_date', { ascending: true });
  const { data: standings } = await supabase.from('standings').select('*').order('position', { ascending: true });
  
  const { data: allPlayers } = await supabase.from('players').select('*').eq('active', true).order('jersey_number', { ascending: true });
  const featuredPlayers = allPlayers?.filter(p => p.is_featured).slice(0, 4);
  const rosterPreview = allPlayers?.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-800">
      
      {/* 1. HERO CON DEGRADADO DEL COLOR DEL EQUIPO */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={heroBackground} alt="Fondo" fill className="object-cover object-top opacity-40 mix-blend-multiply" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-team-bg/60 to-[#f8fafc] to-75%"></div>
        </div>
        
        <div className="pt-12 pb-12 px-4 text-center max-w-3xl mx-auto relative z-10">
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto relative mb-6">
            <Image src={teamLogo} alt={`Logo ${teamName}`} fill className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" priority />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-md">
            Bienvenido a Territorio <span className="text-gray-100"> Halcón</span>
          </h1>
          
          <p className="text-white/90 text-sm md:text-base font-medium max-w-xl mx-auto drop-shadow-sm mb-6">
            Conoce el camino de nuestra categoría juvenil de otoño y síguenos de cerca en esta aventura hacia la victoria.
          </p>
        </div>
        
        <NextGameHero 
          allGames={allGames || []} 
          teamLogo={teamLogo} 
          teamName={teamName} 
          teamRecord={teamRecord} 
          teamShortName={teamShortName} 
        />
      </section>

      {/* 2. PANTALLA DIVIDIDA: CALENDARIO Y ESTADÍSTICAS/ROSTER */}
      <section className="py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          
         {/* NUEVO BANNER DE TEMPORADA / LIGA */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 mb-12 py-4 border-y border-gray-200">
            {/* Logo oficial de la liga (sin efectos hover) */}
            <div className="w-16 h-16 relative">
              <Image 
                src="https://bnsports.com.mx/logos/fademac.png" 
                alt="Logo Liga Fademac" 
                fill 
                className="object-contain" 
              />
            </div>
            <div className="text-center md:text-left flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-team-text">Liga Fademac</span>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Temporada Juvenil de Otoño 2026</h2>
              {/* Nueva línea para la conferencia */}
              <span className="text-xs md:text-sm font-bold text-gray-500 mt-0.5">Conferencia Aarón Matos Santos I</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* IZQUIERDA: Calendario de Juegos */}
            <div className="flex flex-col w-full">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-team-text rounded-full"></span> Calendario
              </h2>
              
              <div className="flex flex-col gap-5">
                {allGames?.map((game) => {
                  const isFinal = game.status === 'final';
                  const homeLogo = game.is_home ? teamLogo : game.opponent_logo_url;
                  const awayLogo = game.is_home ? game.opponent_logo_url : teamLogo;
                  const homeShort = game.is_home ? teamShortName : (game.opponent_short_name || 'VIS');
                  const awayShort = game.is_home ? (game.opponent_short_name || 'VIS') : teamShortName;
                  const homeRecord = game.is_home ? teamRecord : (game.opponent_record || '0-0');
                  const awayRecord = game.is_home ? (game.opponent_record || '0-0') : teamRecord;

                  const isBye = game.opponent_short_name?.toUpperCase() === 'BYE';
                  const ourScoreDisplay = isBye ? 1 : game.our_score;
                  const oppScoreDisplay = isBye ? 0 : game.opponent_score;
                  
                  const homeWon = isFinal && ((game.is_home && ourScoreDisplay > oppScoreDisplay) || (!game.is_home && oppScoreDisplay > ourScoreDisplay));
                  const awayWon = isFinal && ((!game.is_home && ourScoreDisplay > oppScoreDisplay) || (game.is_home && oppScoreDisplay > ourScoreDisplay));
                  const isTie = isFinal && (ourScoreDisplay === oppScoreDisplay);

                  const exactDate = formatGameDate(game.game_date);

                  return (
                    <div key={game.id} className="glass-panel rounded-2xl flex flex-col border border-white/80 glow-primary-hover transition-all overflow-hidden group">
                      
                      <div className="w-full bg-gray-50/50 border-b border-gray-200/50 px-5 py-2.5 flex justify-between items-center">
                        <span className="text-team-text text-xs font-black uppercase tracking-widest">{game.jornada || 'Jornada'}</span>
                        {isFinal ? (
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Finalizado</span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
                            {exactDate.time} hrs
                          </span>
                        )}
                      </div>  

                      <div className="flex w-full items-center justify-between px-5 py-4 min-h-[110px]">
                        <div className="flex flex-col items-center w-1/3">
                          <div className="w-12 h-12 md:w-16 md:h-16 relative mb-1 group-hover:scale-105 transition-transform"><Image src={homeLogo} alt={homeShort} fill className="object-contain" /></div>
                          <span className="text-sm md:text-base font-black text-gray-800 uppercase tracking-tight">{homeShort}</span>
                          <span className="text-[9px] text-gray-400 font-bold tracking-widest">{homeRecord}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-1/3">
                          {isFinal ? (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-2 md:gap-3 text-2xl md:text-3xl font-black">
                                <span className={homeWon || isTie ? 'text-gray-900' : 'text-gray-300'}>{game.is_home ? ourScoreDisplay : oppScoreDisplay}</span>
                                <span className="text-gray-200">-</span>
                                <span className={awayWon || isTie ? 'text-gray-900' : 'text-gray-300'}>{!game.is_home ? ourScoreDisplay : oppScoreDisplay}</span>
                              </div>
                              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mt-1">Final</span>
                            </div>
                          ) : (
                            <span className="text-xl md:text-2xl font-black text-gray-300">VS</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center w-1/3">
                          <div className="w-12 h-12 md:w-16 md:h-16 relative mb-1 group-hover:scale-105 transition-transform"><Image src={awayLogo} alt={awayShort} fill className="object-contain" /></div>
                          <span className="text-sm md:text-base font-black text-gray-800 uppercase tracking-tight">{awayShort}</span>
                          <span className="text-[9px] text-gray-400 font-bold tracking-widest">{awayRecord}</span>
                        </div>
                      </div>

                      <div className="w-full bg-white/40 border-t border-gray-100/50 px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex flex-col text-[10px] uppercase font-bold tracking-widest text-gray-500 w-full sm:w-auto text-center sm:text-left gap-1">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5">
                            <svg className="w-3.5 h-3.5 text-team-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>{exactDate.date} • {exactDate.time} hrs</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-1.5">
                            <svg className="w-3.5 h-3.5 text-team-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate max-w-[150px]">{game.location}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto justify-center">
                          {game.maps_url && (
                            <a href={game.maps_url} target="_blank" rel="noopener noreferrer"
                               className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-colors border border-gray-200 shadow-sm">
                              Mapa
                            </a>
                          )}
                          {game.stream_url && (
                            <a href={game.stream_url} target="_blank" rel="noopener noreferrer"
                               className="flex items-center justify-center gap-1.5 bg-team-button/10 hover:bg-team-button text-team-button hover:text-white px-3 py-2 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-colors border border-team-button/20">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                              Video
                            </a>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DERECHA: Standings y Lista de Roster */}
            <div className="flex flex-col w-full gap-10">
              
              {/* Tabla de Posiciones */}
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-team-text rounded-full"></span> Posiciones
                </h2>
                <div className="glass-panel rounded-2xl overflow-x-auto border border-white/80">
                  <table className="w-full text-left text-sm min-w-[500px]">
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
                      {standings?.map((team) => (
                        <tr key={team.id} className={`transition-colors hover:bg-white/50 ${team.team_name === teamName ? 'bg-team-primary/5' : ''}`}>
                          <td className="p-3 md:p-4 text-center font-black text-gray-400">{team.position}</td>
                          <td className="p-3 md:p-4 font-black text-gray-800 flex items-center gap-2 md:gap-3">
                            {team.logo_url && <div className="w-5 h-5 md:w-6 md:h-6 relative"><Image src={team.logo_url} alt={team.team_name} fill className="object-contain"/></div>}
                            <span className="truncate max-w-[120px]">{team.short_name || team.team_name}</span>
                          </td>
                          <td className="p-3 md:p-4 text-center font-black text-team-text">{team.wins}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-500">{team.ties}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-500">{team.losses}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-400 text-xs">{team.pf}</td>
                          <td className="p-3 md:p-4 text-center font-bold text-gray-400 text-xs">{team.pc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lista Compacta de Roster */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                    <span className="w-2 h-6 bg-team-text rounded-full"></span> Roster
                  </h2>
                  <Link href="/roster" className="text-team-button text-[10px] font-bold uppercase tracking-widest hover:text-gray-900 transition-colors">
                    Ver Todo →
                  </Link>
                </div>
                
                <div className="flex flex-col gap-3">
                  {rosterPreview?.map((player) => (
                    <div key={player.id} className="glass-panel rounded-2xl p-3 px-4 flex items-center justify-between border border-white/60 hover:bg-white/80 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative border border-gray-200">
                          {player.photo_url ? (
                            <Image src={player.photo_url} alt={player.first_name} fill className="object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-xs font-black text-gray-400">{player.jersey_number}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800 uppercase leading-tight">{player.first_name} {player.last_name}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">#{player.jersey_number} • {player.position}</span>
                        </div>
                      </div>
                      <Link href="/roster" className="opacity-0 group-hover:opacity-100 transition-opacity bg-team-button text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                        Ver Perfil
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. JUGADORES DESTACADOS */}
      {featuredPlayers && featuredPlayers.length > 0 && (
        <section className="py-12 bg-white/50 border-t border-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2 justify-center mb-10">
              <span className="w-2 h-8 bg-team-text rounded-full"></span> Jugadores Destacados
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        </section>
      )}
      
    </main>
  );
}
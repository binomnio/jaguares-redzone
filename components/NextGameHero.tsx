// components/NextGameHero.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Game = {
  id: string;
  opponent_name: string;
  opponent_logo_url: string;
  opponent_short_name?: string;
  opponent_record?: string;
  game_date: string;
  location: string;
  is_home: boolean;
  status: string;
  maps_url?: string;
  stream_url?: string;
  our_score?: number;
  opponent_score?: number;
};

// Función para forzar la lectura en el horario oficial de México
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

export default function NextGameHero({ 
  allGames, 
  teamLogo,
  teamName = "Halcones",
  teamShortName = "HAL",
  teamRecord = "0-0"
}: { 
  allGames: Game[];
  teamLogo: string;
  teamName?: string;
  teamShortName?: string;
  teamRecord?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Al cargar, busca automáticamente cuál es el partido más próximo (upcoming)
  useEffect(() => {
    if (!allGames || allGames.length === 0) return;
    
    const nextGameIndex = allGames.findIndex(g => 
      g.status === 'upcoming' || new Date(g.game_date).getTime() > new Date().getTime()
    );
    
    setCurrentIndex(nextGameIndex !== -1 ? nextGameIndex : allGames.length - 1);
  }, [allGames]);

  const currentGame = allGames[currentIndex];
  
  const isPast = currentGame ? (currentGame.status === 'final' || new Date(currentGame.game_date).getTime() <= new Date().getTime()) : false;

  // Lógica del Reloj
  useEffect(() => {
    if (!currentGame || isPast) return;

    const timer = setInterval(() => {
      const currentDiff = new Date(currentGame.game_date).getTime() - new Date().getTime();
      if (currentDiff > 0) {
        setTimeLeft({
          days: Math.floor(currentDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((currentDiff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((currentDiff / 1000 / 60) % 60),
          seconds: Math.floor((currentDiff / 1000) % 60),
        });
      } else {
          clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentGame, isPast]);

  if (!currentGame) return null;

  const goPrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
  const goNext = () => setCurrentIndex(prev => (prev < allGames.length - 1 ? prev + 1 : prev));

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allGames.length - 1;

  const defaultLogo = "https://bnsports.com.mx/logos/halcones.png"; 
  const homeTeamLogo = (currentGame.is_home ? teamLogo : currentGame.opponent_logo_url) || defaultLogo;
  const awayTeamLogo = (currentGame.is_home ? currentGame.opponent_logo_url : teamLogo) || defaultLogo;
  const homeTeamName = currentGame.is_home ? teamName : (currentGame.opponent_name || 'Rival');
  const awayTeamName = currentGame.is_home ? (currentGame.opponent_name || 'Rival') : teamName;
  const homeRecordDisplay = currentGame.is_home ? teamRecord : (currentGame.opponent_record || '0-0');
  const awayRecordDisplay = currentGame.is_home ? (currentGame.opponent_record || '0-0') : teamRecord;

  const isBye = currentGame.opponent_short_name?.toUpperCase() === 'BYE';
  const ourScoreDisplay = isBye ? 1 : (currentGame.our_score || 0);
  const oppScoreDisplay = isBye ? 0 : (currentGame.opponent_score || 0);
  const homeScoreDisplay = currentGame.is_home ? ourScoreDisplay : oppScoreDisplay;
  const awayScoreDisplay = currentGame.is_home ? oppScoreDisplay : ourScoreDisplay;

  const homeWon = isPast && (homeScoreDisplay > awayScoreDisplay);
  const awayWon = isPast && (awayScoreDisplay > homeScoreDisplay);
  const isTie = isPast && (homeScoreDisplay === awayScoreDisplay);

  const exactDate = formatGameDate(currentGame.game_date);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 relative z-10 pb-12 transition-all duration-500">
      <div className="glass-panel rounded-[2rem] p-6 md:p-10 relative">
        
        {/* NAVEGACIÓN Y ENCABEZADO */}
        <div className="flex items-center justify-between mb-6">
          
          {/* Flecha Izquierda */}
          <button onClick={goPrev} disabled={!hasPrev} className={`p-2 rounded-full transition-all ${hasPrev ? 'text-gray-600 hover:bg-gray-200/50 hover:text-team-text cursor-pointer' : 'text-transparent cursor-default'}`}>
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div className="text-center flex-1">
            {/* Badge dinámico con team-text */}
            <span className={`inline-block px-4 py-1.5 rounded-full bg-team-text/10 text-team-text font-black tracking-widest uppercase text-[10px] mb-3 border border-team-text/20 ${!isPast && 'animate-pulse'}`}>
              {isPast ? 'Partido Finalizado' : 'Siguiente Encuentro'}
            </span>
            <p className="text-gray-800 text-sm md:text-base font-bold uppercase tracking-wider">
                {exactDate.date} • {exactDate.time} hrs
            </p>
            <p className="text-gray-500 text-xs md:text-sm mt-1 font-medium">{currentGame.location}</p>
          </div>

          {/* Flecha Derecha */}
          <button onClick={goNext} disabled={!hasNext} className={`p-2 rounded-full transition-all ${hasNext ? 'text-gray-600 hover:bg-gray-200/50 hover:text-team-text cursor-pointer' : 'text-transparent cursor-default'}`}>
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>

        </div>

        {/* LOGOS Y EQUIPOS */}
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 md:gap-16">
          
          {/* LOCAL */}
          <div className="flex flex-col items-center group w-1/3">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 relative mb-2 md:mb-4 transform transition-transform duration-300 ${!isPast && 'group-hover:scale-105'}`}>
              {homeTeamLogo && (
                <Image src={homeTeamLogo} alt={homeTeamName} fill className={`object-contain drop-shadow-xl ${isPast && !homeWon && !isTie ? 'opacity-60 grayscale' : ''}`} />
              )}
            </div>
            <h3 className="text-[10px] sm:text-xs md:text-lg font-black uppercase tracking-widest text-gray-800 truncate w-full text-center">{homeTeamName}</h3>
            <span className="text-[9px] md:text-xs font-bold text-gray-500 tracking-widest mt-0.5">{homeRecordDisplay}</span>
          </div>

          {/* MARCADOR O VS */}
          <div className="flex flex-col items-center justify-center">
            {isPast ? (
              <div className="flex items-center gap-2 md:gap-4 text-3xl sm:text-4xl md:text-6xl font-black">
                <span className={homeWon || isTie ? 'text-gray-900 drop-shadow-sm' : 'text-gray-400'}>{homeScoreDisplay}</span>
                <span className="text-gray-200 text-2xl md:text-4xl">-</span>
                <span className={awayWon || isTie ? 'text-gray-900 drop-shadow-sm' : 'text-gray-400'}>{awayScoreDisplay}</span>
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-700 drop-shadow-sm">
                VS
              </div>
            )}
          </div>

          {/* VISITA */}
          <div className="flex flex-col items-center group w-1/3">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 relative mb-2 md:mb-4 transform transition-transform duration-300 ${!isPast && 'group-hover:scale-105'}`}>
              {awayTeamLogo && (
                <Image src={awayTeamLogo} alt={awayTeamName} fill className={`object-contain drop-shadow-xl ${isPast && !awayWon && !isTie ? 'opacity-60 grayscale' : ''}`} />
              )}
            </div>
            <h3 className="text-[10px] sm:text-xs md:text-lg font-black uppercase tracking-widest text-gray-800 truncate w-full text-center">{awayTeamName}</h3>
            <span className="text-[9px] md:text-xs font-bold text-gray-500 tracking-widest mt-0.5">{awayRecordDisplay}</span>
          </div>
        </div>

        {/* RELOJ (Solo se muestra si el partido no ha pasado) */}
        {!isPast && (
            <div className="mt-8 flex justify-center gap-2 sm:gap-4 md:gap-6 animate-fade-in">
            {[
                { label: 'Días', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Seg', value: timeLeft.seconds }
            ].map((time, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white/40 rounded-xl w-14 h-16 sm:w-16 sm:h-20 md:w-20 md:h-24 justify-center border border-white/60 shadow-sm">
                {/* Números del reloj con team-text */}
                <span className="text-xl sm:text-2xl md:text-4xl font-black text-team-text">{time.value.toString().padStart(2, '0')}</span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{time.label}</span>
                </div>
            ))}
            </div>
        )}

        {/* BOTONES DE MAPA Y TRANSMISIÓN */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {currentGame.maps_url && (
            <a href={currentGame.maps_url} target="_blank" rel="noopener noreferrer" 
               className="flex items-center justify-center gap-2 glass-panel hover:bg-team-text/10 border border-team-text/30 text-team-text px-6 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all shadow-sm group">
              <svg className="w-4 h-4 text-team-text group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Cómo Llegar
            </a>
          )}
          {currentGame.stream_url && (
            <a href={currentGame.stream_url} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 bg-team-button hover:bg-team-button/90 text-white px-6 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-team-button/30 group">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              {isPast ? 'Ver Repetición' : 'Transmisión'}
            </a>
          )}
        </div>
        
      </div>
    </div>
  );
}
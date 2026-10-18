// components/PlayerCard.tsx
import Image from 'next/image';
import type { RosterPlayer } from '@/utils/roster';

const rosterPhotoSizes = '(min-width: 1280px) 231px, (min-width: 1024px) calc((100vw - 104px) / 4), (min-width: 768px) calc((100vw - 80px) / 3), (min-width: 640px) calc((100vw - 64px) / 3), calc((100vw - 48px) / 2)';

export default function PlayerCard({ player, sizes = rosterPhotoSizes }: { player: RosterPlayer; sizes?: string }) {
  const initials = `${player.first_name?.charAt(0) || ''}${player.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="group glass-panel glow-primary-hover rounded-3xl overflow-hidden transition-all duration-500 flex flex-col h-full relative">

      {/* Parte Superior: Foto y Número Gigante */}
      <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-gray-100/50 to-gray-200/50 overflow-hidden">

        {/* NÚMERO FIJO RESPONSIVO: Se ajusta al tamaño de la pantalla para nunca cortarse */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none px-2">
          <span className="text-[7rem] sm:text-[9rem] lg:text-[11rem] font-black text-team-text/5 tracking-tighter leading-none select-none">
            {player.jersey_number}
          </span>
        </div>

        {player.photo_url ? (
          <Image
            src={player.photo_url}
            alt={`${player.first_name} ${player.last_name}`}
            fill
            sizes={sizes}
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105 relative z-10"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-10">
             <span className="text-6xl font-black text-gray-300">{initials}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/90 to-transparent z-10"></div>

        <div className="absolute top-4 left-4 bg-team-text/90 backdrop-blur-md text-white font-black text-sm px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg border border-white/20 z-20">
          {player.position}
        </div>
      </div>

      {/* Parte Inferior: Datos */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow relative z-20 bg-white/40">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="flex-1">
            {/* break-words: Permite que el nombre pase a una nueva línea si es muy largo, sin cortarse */}
            <h3 className="text-lg sm:text-xl font-black text-gray-800 leading-tight uppercase flex flex-col break-words">
              <span>{player.first_name}</span>
              <span className="text-team-text">{player.last_name}</span>
            </h3>
          </div>
          {/* flex-shrink-0 asegura que este número pequeño siempre mantenga su forma */}
          <span className="text-2xl sm:text-3xl font-black text-gray-300 flex-shrink-0 mt-0.5">#{player.jersey_number}</span>
        </div>

        <div className="flex gap-4 mt-auto pt-4 border-t border-gray-200/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estatura</span>
            <span className="text-sm font-bold text-gray-700">{player.height || '-'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peso</span>
            <span className="text-sm font-bold text-gray-700">{player.weight || '-'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

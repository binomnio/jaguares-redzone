// components/PlayerCard.tsx
import Image from 'next/image';

export default function PlayerCard({ player }: { player: any }) {
  const initials = `${player.first_name?.charAt(0) || ''}${player.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    // Aplicamos glass-panel y glow-primary-hover (que ahora usa team-glow)
    <div className="group glass-panel glow-primary-hover rounded-3xl overflow-hidden transition-all duration-500 flex flex-col h-full relative">
      
      {/* Parte Superior: Foto y Número */}
      <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-gray-100/50 to-gray-200/50 overflow-hidden flex items-end justify-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          {/* Cambiado a text-team-text */}
          <span className="text-[12rem] font-black text-team-text tracking-tighter">{player.jersey_number}</span>
        </div>

        {player.photo_url ? (
          <Image 
            src={player.photo_url} 
            alt={`${player.first_name} ${player.last_name}`} 
            fill 
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center z-10">
             <span className="text-6xl font-black text-gray-300">{initials}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/90 to-transparent"></div>
        
        {/* Cambiado a bg-team-text para la etiqueta de posición */}
        <div className="absolute top-4 left-4 bg-team-text/90 backdrop-blur-md text-white font-black text-sm px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg border border-white/20">
          {player.position}
        </div>
      </div>

      {/* Parte Inferior: Datos en gris oscuro (text-gray-800) */}
      <div className="p-6 flex flex-col flex-grow relative z-20">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-black text-gray-800 leading-tight uppercase">
              {player.first_name} <br/> 
              {/* Cambiado a text-team-text para el apellido */}
              <span className="text-team-text">{player.last_name}</span>
            </h3>
          </div>
          <span className="text-3xl font-black text-gray-300">#{player.jersey_number}</span>
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
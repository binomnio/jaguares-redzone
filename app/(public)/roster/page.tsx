// app/(public)/roster/page.tsx
import { createClient } from '@/utils/supabase/server';
import PlayerCard from '@/components/PlayerCard';
import InnerHeader from '@/components/InnerHeader';

export const revalidate = 60;

export default async function RosterPage() {
  const supabase = await createClient();

  // Traer datos del equipo
  const { data: teamData } = await supabase
    .from('team_settings')
    .select('*') 
    .limit(1)
    .maybeSingle();

  const teamName = teamData?.team_name || "Halcones";
  const logoUrl = teamData?.logo_url || "https://bnsports.com.mx/logos/halcones.png";
  const bgUrl = teamData?.header_bg_url; 

  // Traer a todos los jugadores activos
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('active', true)
    // Ordenamos primero por jersey, que es lo más común en listas de fútbol americano
    .order('jersey_number', { ascending: true })
    .order('last_name', { ascending: true });

  return (
    // Cambiamos el fondo a #f8fafc para que sea idéntico al Home
    <main className="min-h-screen bg-[#f8fafc] text-gray-800 pb-20">
      
      {/* Header Interno Dinámico */}
      <InnerHeader 
        title="Roster Oficial" 
        subtitle={`Conoce a los jugadores que defienden los colores de ${teamName} en la temporada 2026.`}
        logoUrl={logoUrl} 
        bgUrl={bgUrl} 
      />

      <div className="max-w-7xl mx-auto px-4 mt-12 relative z-20">
        
        {/* Título de Sección con el estilo del Home */}
        <div className="flex justify-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
            <span className="w-2 h-8 bg-team-primary rounded-full"></span> Jugadores Activos
          </h2>
        </div>

        {/* Grid de Jugadores */}
        {players && players.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {/* Ajustado a 2 cols móvil, 3 tablet, 4 laptop, 5 en PC grandes */}
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          // Estado Vacío con estilo Glassmorphism
          <div className="text-center py-24 glass-panel border border-white/60 rounded-[2rem] shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aún no hay jugadores activos en el Roster.</p>
          </div>
        )}
      </div>
    </main>
  );
}
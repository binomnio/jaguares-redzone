// app/(admin)/layout.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Verificar si hay una sesión activa
  const { data: { session } } = await supabase.auth.getSession();

  // Traer los colores del equipo (solo los necesitamos para las variables CSS)
  const { data: teamData } = await supabase.from('team_settings').select('*').limit(1).maybeSingle();
  
  const primaryColor = teamData?.primary_color || '#dc2626';
  const secondaryColor = teamData?.secondary_color || '#111827';
  const logoUrl = teamData?.logo_url || '/default-logo.png';

  // 2. Si NO hay sesión, devolvemos solo el contenido (la página de login) sin el Sidebar
  if (!session) {
    return (
      <>
        {/* Mantenemos las variables CSS para que el login pueda usar los colores del equipo */}
        <style 
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-team-primary: ${primaryColor};
                --color-team-secondary: ${secondaryColor};
              }
            `
          }} 
        />
        {children}
      </>
    );
  }

  // 3. Si SÍ hay sesión, devolvemos el Layout completo con el Sidebar
  return (
    <div className="bg-[#0a0a0a] text-white flex min-h-screen">
      
      <style 
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-team-primary: ${primaryColor};
              --color-team-secondary: ${secondaryColor};
            }
          `
        }} 
      />

      <aside className="w-64 bg-black border-r border-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-900 flex flex-col items-center">
          <img src={logoUrl} alt="Logo Admin" className="w-16 h-16 object-contain mb-3" />
          <h1 className="text-xl font-black tracking-tighter uppercase text-white">
            Admin <span className="text-team-primary">Panel</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          
          <Link href="/admin/team" className="px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider text-team-primary border border-gray-800 hover:border-team-primary/50">
            Identidad (Equipo)
          </Link>
          
          <div className="h-px bg-gray-900 my-2"></div>

          <Link href="/admin/games" className="px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider">
            Calendario
          </Link>
          <Link href="/admin/standings" className="px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider">
            Posiciones
          </Link>
          <Link href="/admin/players" className="px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider">
            Roster
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}
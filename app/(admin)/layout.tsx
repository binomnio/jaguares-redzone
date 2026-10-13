import { safeColor, isAdmin } from '@/utils/security';
// app/(admin)/layout.tsx
import { createClient } from '@/utils/supabase/server';
import AdminNavigation from '@/components/AdminNavigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Verificar si hay una sesión activa
  const { data: { user } } = await supabase.auth.getUser();

  // Traer los colores del equipo (solo los necesitamos para las variables CSS)
  const { data: teamData } = await supabase.from('team_settings').select('*').limit(1).maybeSingle();
  
  const primaryColor = safeColor(teamData?.primary_color, '#dc2626');
  const secondaryColor = safeColor(teamData?.secondary_color, '#111827');
  const logoUrl = teamData?.logo_url || '/default-logo.png';

  // 2. Si NO hay sesión, devolvemos solo el contenido (la página de login) sin el Sidebar
  if (!isAdmin(user)) {
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
    <div className="bg-[#0a0a0a] text-white flex flex-col md:flex-row min-h-dvh">
      
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

      <AdminNavigation logoUrl={logoUrl} />

      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
        {children}
      </main>
      
    </div>
  );
}
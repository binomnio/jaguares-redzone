// app/(public)/layout.tsx
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Halcones Rojos | BN Sports RedZone', 
  description: 'Sigue el calendario, roster y posiciones de nuestro equipo.', 
  icons: {
    icon: '/favicon.png',   // <-- Cambiado a .png
    apple: '/favicon.png',  // <-- Cambiado a .png (para dispositivos iOS)
  },
  openGraph: {
    title: 'Halcones Rojos | BN Sports RedZone', 
    description: 'Sigue toda la acción de tu equipo, estadísticas, calendario, roster y posiciones.', 
    images: ['https://bnsports.com.mx/img/og-halcones.jpg'], 
    type: 'website',
  },
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: teamData } = await supabase.from('team_settings').select('*').limit(1).maybeSingle();

  // Colores Base
  const primaryColor = teamData?.primary_color || '#dc2626';
  const secondaryColor = teamData?.secondary_color || '#111827';
  
  // NUEVOS TOKENS SEMÁNTICOS (con fallbacks inteligentes por si están vacíos en BD)
  const layoutColor = teamData?.layout_color || secondaryColor; // Navbar/Footer (Suele ser oscuro)
  const bgColor = teamData?.bg_color || primaryColor;           // Fondos como InnerHeader
  const textColor = teamData?.text_color || primaryColor;       // Countdown, textos resaltados
  const glowColor = teamData?.glow_color || primaryColor;       // Resplandor de tarjetas
  const buttonColor = teamData?.button_color || primaryColor;   // Botones principales

  const logoUrl = teamData?.logo_url || 'https://bnsports.com.mx/logos/halcones.png';
  const teamName = teamData?.team_name || 'Halcones Rojos';

  return (
    <div className="min-h-screen flex flex-col relative bg-[#f8fafc] text-gray-800 pt-16">
      <style 
        precedence="default" 
        href="team-theme" 
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-team-primary: ${primaryColor};
              --color-team-secondary: ${secondaryColor};
              --color-team-layout: ${layoutColor};
              --color-team-bg: ${bgColor};
              --color-team-text: ${textColor};
              --color-team-glow: ${glowColor};
              --color-team-button: ${buttonColor};
            }
          `
        }} 
      />

      <Navbar teamLogo={logoUrl} teamName={teamName} />

      <main className="flex-1">
        {children}
      </main>

      <Footer teamLogo={logoUrl} teamName={teamName} />
      <FloatingWhatsApp />
    </div>
  );
}
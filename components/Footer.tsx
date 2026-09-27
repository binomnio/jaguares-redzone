// components/Footer.tsx
import Image from 'next/image';

export default function Footer({ teamName }: { teamLogo?: string, teamName?: string }) {
  // Logo corporativo de tu agencia
  const agencyLogo = "https://bnsports.com.mx/logos/bnsbinomio.svg";

  return (
    // Cambiado a bg-team-layout
    <footer className="bg-team-layout text-white border-t border-black/10 py-6 mt-auto relative z-20 shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-2">
        
        {/* Logo de la Agencia */}
        <div className="w-48 h-16 relative bg-white/0 rounded-xl p-2 backdrop-blur-sm">
          <Image 
            src={agencyLogo} 
            alt="binomio Technology / BN Sports" 
            fill 
            className="object-contain filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
          />
        </div>
        
        {/* Créditos */}
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
            Plataforma desarrollada por BN Sports y binomio Agency
          </p>
          <p className="text-[10px] font-medium text-white/60">
            © {new Date().getFullYear()} binomio Agency. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}
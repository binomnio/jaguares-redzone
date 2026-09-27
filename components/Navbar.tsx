// components/Navbar.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar({ teamLogo, teamName }: { teamLogo: string, teamName: string }) {
  return (
    // Cambiado a bg-team-layout para obedecer al panel de control
    <nav className="fixed top-0 left-0 right-0 z-50 bg-team-layout shadow-lg border-b border-black/10 transition-all">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 relative">
              <Image src={teamLogo} alt={`Logo ${teamName}`} fill className="object-contain drop-shadow-md" />
            </div>
            <span className="font-black uppercase tracking-widest text-white hidden sm:block drop-shadow-sm">
              {teamName}
            </span>
          </Link>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm font-bold uppercase tracking-wider text-white/90">
            <Link href="/" className="hover:text-white hover:scale-105 transition-all">Inicio</Link>
            <Link href="/roster" className="hover:text-white hover:scale-105 transition-all">Roster</Link>
            <Link href="/calendario" className="hover:text-white hover:scale-105 transition-all">Calendario</Link>
            <Link href="/posiciones" className="hover:text-white hover:scale-105 transition-all">Posiciones</Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
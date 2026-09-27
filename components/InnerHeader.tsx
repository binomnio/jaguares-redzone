// components/InnerHeader.tsx
import Image from 'next/image';

interface InnerHeaderProps {
  title: string;
  subtitle: string;
  logoUrl: string;
  bgUrl?: string;
}

export default function InnerHeader({ title, subtitle, logoUrl, bgUrl }: InnerHeaderProps) {
  const defaultBg = "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=2000&auto=format&fit=crop";

  return (
    // 1. Reducimos la altura y centramos el contenido para acercarlo al Navbar
    <div className="relative w-full min-h-[240px] md:min-h-[280px] flex flex-col items-center justify-center overflow-hidden pt-20 pb-8">
      
      <div className="absolute inset-0 z-0 bg-team-primary">
        {/* 2. Bajamos la opacidad de la imagen al 30% para que el color base domine */}
        <Image 
          src={bgUrl || defaultBg} 
          fill 
          alt="Background" 
          className="object-cover object-top opacity-50 mix-blend-multiply"
          priority
        />
        {/* 3. Degradado: Negro arriba (para contraste del Navbar), Color vibrante en el medio extendido hasta el 75%, y transición al gris abajo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-team-primary/95 to-[#f8fafc] via-35%"></div>
      </div>

      {/* Contenido en primer plano */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-2">
        
        {/* Logo con sombra acentuada */}
        <div className="w-16 h-16 md:w-20 md:h-20 relative mb-3">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            fill 
            className="object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)]" 
            priority
          />
        </div>
        
        {/* Título: Aumentamos la opacidad de la sombra para garantizar lectura */}
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] mb-2">
          {title}
        </h1>
        
        {/* Subtítulo: Cambiado a font-bold, text-white puro y sombra muy oscura */}
        <p className="text-white font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] leading-relaxed">
          {subtitle}
        </p>
        
      </div>
    </div>
  );
}
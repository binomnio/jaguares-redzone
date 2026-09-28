// components/InnerHeader.tsx
import Image from 'next/image';

interface InnerHeaderProps {
  title: string;
  subtitle: string;
  logoUrl: string;
  bgUrl?: string;
}

export default function InnerHeader({ title, subtitle, logoUrl, bgUrl }: InnerHeaderProps) {
  const defaultBg = "https://bnsports.com.mx/img/jaguaresback.jpg?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="relative w-full min-h-[240px] md:min-h-[280px] flex flex-col items-center justify-center overflow-hidden pt-20 pb-8">
      
      {/* Contenedor del fondo con tinte base */}
      <div className="absolute inset-0 z-0 bg-team-primary">
        {/* Bajamos un puntito la opacidad (40%) para que el color se funda mejor con la foto */}
        <Image 
          src={bgUrl || defaultBg} 
          fill 
          alt="Background" 
          className="object-cover object-top opacity-40 mix-blend-multiply"
          priority
        />
        
        {/* 1. Degradado Superior: Cae suavemente para el contraste del Navbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
        
        {/* 2. Degradado Inferior: Sube desde abajo para borrar el borde del componente */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      </div>

      {/* Contenido en primer plano */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-2">
        
        <div className="w-16 h-16 md:w-20 md:h-20 relative mb-3">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            fill 
            className="object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)]" 
            priority
          />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] mb-2">
          {title}
        </h1>
        
        <p className="text-white font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] leading-relaxed">
          {subtitle}
        </p>
        
      </div>
    </div>
  );
}
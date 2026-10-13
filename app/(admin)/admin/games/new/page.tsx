// app/(admin)/admin/games/new/page.tsx
import GameForm from '@/components/GameForm';
import Link from 'next/link';

export default function NewGamePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6 md:mb-8">
        <Link href="/admin/games" className="inline-flex min-h-11 items-center shrink-0 text-gray-400 hover:text-white transition-colors">
          ← Volver
        </Link>
        <h2 className="text-2xl md:text-3xl font-black uppercase italic">
          Agregar <span className="text-team-primary">Partido</span>
        </h2>
      </div>

      {/* Renderizamos el formulario vacío */}
      <GameForm />
    </div>
  );
}
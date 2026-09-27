// app/(admin)/admin/players/new/page.tsx
import PlayerForm from '@/components/PlayerForm';
import Link from 'next/link';

export default function NewPlayerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/players" className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </Link>
        <h2 className="text-3xl font-black uppercase italic">
          Agregar <span className="text-team-primary">Jugador</span>
        </h2>
      </div>
      
      <PlayerForm />
    </div>
  );
}
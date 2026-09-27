// app/(admin)/admin/standings/new/page.tsx
import StandingForm from '@/components/StandingForm';
import Link from 'next/link';

export default function NewStandingPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/standings" className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </Link>
        <h2 className="text-3xl font-black uppercase italic">
          Agregar <span className="text-team-primary">Equipo</span>
        </h2>
      </div>
      
      <StandingForm />
    </div>
  );
}
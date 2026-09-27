// app/(admin)/admin/standings/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import StandingForm from '@/components/StandingForm';
import Link from 'next/link';

export default async function EditStandingPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params; // Resolvemos asíncronamente como en juegos

  const { data: team, error } = await supabase
    .from('standings')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !team) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-bold text-red-500">Error: Equipo no encontrado</h2>
        <Link href="/admin/standings" className="text-blue-400 hover:underline mt-4 inline-block">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/standings" className="text-gray-400 hover:text-white transition-colors">
          ← Volver
        </Link>
        <h2 className="text-3xl font-black uppercase italic">
          Editar <span className="text-team-primary">Equipo</span>
        </h2>
      </div>
      
      <StandingForm initialData={team} />
    </div>
  );
}
// components/StandingForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StandingForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      position: parseInt(formData.get('position') as string) || 99,
      team_name: formData.get('team_name'),
      // NUEVO: Capturar el nombre corto
      short_name: formData.get('short_name'),
      logo_url: formData.get('logo_url'),
      wins: parseInt(formData.get('wins') as string) || 0,
      losses: parseInt(formData.get('losses') as string) || 0,
      ties: parseInt(formData.get('ties') as string) || 0,
      pf: parseInt(formData.get('pf') as string) || 0,
      pc: parseInt(formData.get('pc') as string) || 0,
      dif: parseInt(formData.get('dif') as string) || 0,
      stk: formData.get('stk') || '',
    };

    const actionUrl = initialData.id ? `/api/standings/${initialData.id}` : '/api/standings';
    const method = initialData.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(actionUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/standings');
        router.refresh();
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-black border border-gray-800 rounded-xl p-8 space-y-6">
      
      {/* Ajustamos el Grid para incluir la Posición, Nombre Completo y Nombre Corto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Posición (Ranking)</label>
          <input type="number" name="position" defaultValue={initialData.position || 1} min="1" required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold text-xl" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre del Equipo</label>
          <input type="text" name="team_name" defaultValue={initialData.team_name} required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="Ej. Halcones" />
        </div>

        {/* NUEVO: Input para el Nombre Corto */}
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Abreviatura (Móvil)</label>
          <input type="text" name="short_name" defaultValue={initialData.short_name || ''} maxLength={4} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none uppercase font-bold" placeholder="Ej. HAL" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL del Logo (Opcional)</label>
        <input type="url" name="logo_url" defaultValue={initialData.logo_url} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="https://..." />
      </div>

      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-800">
        <div>
          <label className="block text-xs font-bold text-green-500 uppercase mb-2">Victorias (G)</label>
          <input type="number" name="wins" defaultValue={initialData.wins || 0} min="0" required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Empates (E)</label>
          <input type="number" name="ties" defaultValue={initialData.ties || 0} min="0" required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-red-500 uppercase mb-2">Derrotas (P)</label>
          <input type="number" name="losses" defaultValue={initialData.losses || 0} min="0" required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Puntos a Favor (PF)</label>
          <input type="number" name="pf" defaultValue={initialData.pf || 0} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Puntos en Contra (PC)</label>
          <input type="number" name="pc" defaultValue={initialData.pc || 0} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Diferencia (DIF)</label>
          <input type="number" name="dif" defaultValue={initialData.dif || 0} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Racha (STK)</label>
          <input type="text" name="stk" defaultValue={initialData.stk} placeholder="Ej. G3 o P1" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold uppercase" />
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={loading} className="bg-team-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-colors">
          {loading ? 'Guardando...' : 'Guardar Equipo'}
        </button>
      </div>
    </form>
  );
}
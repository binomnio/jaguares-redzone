// components/PlayerForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayerForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      jersey_number: formData.get('jersey_number'),
      position: formData.get('position'),
      photo_url: formData.get('photo_url'),
      height: formData.get('height'),
      weight: formData.get('weight'),
      bio: formData.get('bio'),
      active: formData.get('active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
    };

    const actionUrl = initialData.id ? `/api/players/${initialData.id}` : '/api/players';
    const method = initialData.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(actionUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/players');
        router.refresh();
      } else {
        alert('Error al guardar el jugador');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-black border border-gray-800 rounded-xl p-8 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre(s)</label>
          <input type="text" name="first_name" defaultValue={initialData.first_name} required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Apellidos</label>
          <input type="text" name="last_name" defaultValue={initialData.last_name} required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-team-primary uppercase mb-2">Número de Jersey</label>
          <input type="text" name="jersey_number" defaultValue={initialData.jersey_number} required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold text-xl" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Posición</label>
          <input type="text" name="position" defaultValue={initialData.position} required placeholder="Ej. QB, WR, LB..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none uppercase font-bold" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL de la Foto (cPanel)</label>
        <input type="url" name="photo_url" defaultValue={initialData.photo_url} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="https://tuservidor.com/...png" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-800">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estatura</label>
          <input type="text" name="height" defaultValue={initialData.height} placeholder="Ej. 1.85m" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Peso</label>
          <input type="text" name="weight" defaultValue={initialData.weight} placeholder="Ej. 95kg" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estado</label>
          <select name="active" defaultValue={initialData.active !== false ? "true" : "false"} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white outline-none">
            <option value="true">Activo</option>
            <option value="false">Inactivo (Lesionado / Baja)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-team-primary uppercase mb-2">¿Mostrar en Inicio?</label>
          <select name="is_featured" defaultValue={initialData.is_featured ? "true" : "false"} className="w-full bg-gray-900 border border-team-primary/50 rounded p-3 text-white outline-none">
            <option value="false">No (Solo Roster)</option>
            <option value="true">Sí (Jugador Destacado)</option>
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-800">
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Biografía o Notas (Opcional)</label>
        <textarea name="bio" defaultValue={initialData.bio} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none resize-none"></textarea>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={loading} className="bg-team-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-colors">
          {loading ? 'Guardando...' : 'Guardar Jugador'}
        </button>
      </div>
    </form>
  );
}
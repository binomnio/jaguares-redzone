// components/GameForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GameForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 1. FORMATEO PERFECTO DE LA FECHA INICIAL
  // Ajustamos el offset para que el input type="datetime-local" muestre la hora exacta
  let formattedDate = '';
  if (initialData?.game_date) {
    const d = new Date(initialData.game_date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Compensación mágica
    formattedDate = d.toISOString().slice(0, 16);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 2. CAPTURA CORRECTA AL GUARDAR
    // Obtenemos el string crudo (ej: "2026-09-25T20:00")
    const rawDate = formData.get('game_date') as string;
    
    // Lo guardamos pasándole directamente el string crudo a Supabase.
    // Al añadir 'Z' al final, le decimos a Supabase: "Guarda esto exactamente como viene, sin hacer cálculos".
    const finalGameDate = rawDate ? new Date(rawDate).toISOString() : null;

    const data = {
      opponent_name: formData.get('opponent_name'),
      opponent_logo_url: formData.get('opponent_logo_url'),
      opponent_short_name: formData.get('opponent_short_name'),
      opponent_record: formData.get('opponent_record'),
      game_date: finalGameDate, // <-- USAMOS NUESTRA NUEVA VARIABLE
      location: formData.get('location'),
      is_home: formData.get('is_home') === 'true',
      status: formData.get('status'),
      our_score: parseInt(formData.get('our_score') as string) || 0,
      opponent_score: parseInt(formData.get('opponent_score') as string) || 0,
      jornada: formData.get('jornada'),
      maps_url: formData.get('maps_url'),
      stream_url: formData.get('stream_url'),
    };

    const actionUrl = initialData.id ? `/api/games/${initialData.id}` : '/api/games';
    const method = initialData.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(actionUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/games');
        router.refresh();
      } else {
        alert('Error al guardar el partido');
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
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre del Rival</label>
          <input type="text" name="opponent_name" defaultValue={initialData.opponent_name} required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="Ej. Pumas CU"/>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL del Logo del Rival (cPanel)</label>
          <input type="url" name="opponent_logo_url" defaultValue={initialData.opponent_logo_url} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="https://tuservidor.com/..."/>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre Corto Rival (Max 3-4 letras)</label>
          <input type="text" name="opponent_short_name" defaultValue={initialData.opponent_short_name} placeholder="Ej. VIS" maxLength={4} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none uppercase font-bold" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Récord del Rival</label>
          <input type="text" name="opponent_record" defaultValue={initialData.opponent_record} placeholder="Ej. 2-1" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fecha y Hora</label>
          <input 
            type="datetime-local" 
            name="game_date" 
            defaultValue={formattedDate} /* <-- AQUI USAMOS LA FECHA FORMATEADA */
            required 
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none uppercase font-bold" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estadio / Lugar</label>
          <input type="text" name="location" defaultValue={initialData.location} required className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="Ej. Estadio Olímpico"/>
        </div>

        {/* NUEVOS INPUTS: Jornada, Google Maps y Stream */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Jornada / Semana</label>
          <input type="text" name="jornada" defaultValue={initialData.jornada} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="Ej. Semana 1 o Jornada 3"/>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL de Google Maps (Cómo llegar)</label>
          <input type="url" name="maps_url" defaultValue={initialData.maps_url} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="https://maps.google.com/..."/>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL de Transmisión / Video (Stream)</label>
          <input type="url" name="stream_url" defaultValue={initialData.stream_url} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none" placeholder="https://youtube.com/live/... o Facebook Video"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-800">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Localía</label>
          <select name="is_home" defaultValue={initialData.is_home?.toString() || "true"} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white outline-none">
            <option value="true">Somos Local</option>
            <option value="false">Somos Visita</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estatus del Partido</label>
          <select name="status" defaultValue={initialData.status || "upcoming"} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white outline-none">
            <option value="upcoming">Próximo (Upcoming)</option>
            <option value="final">Finalizado (Final)</option>
          </select>
        </div>
      </div>

      {/* Marcador */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
        <div>
          <label className="block text-xs font-bold text-team-primary uppercase mb-2">Puntos (Nosotros)</label>
          <input type="number" name="our_score" defaultValue={initialData.our_score || 0} min="0" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none text-xl font-bold"/>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Puntos (Rival)</label>
          <input type="number" name="opponent_score" defaultValue={initialData.opponent_score || 0} min="0" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none text-xl font-bold"/>
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" disabled={loading} className="bg-team-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-colors">
          {loading ? 'Guardando...' : 'Guardar Partido'}
        </button>
      </div>
    </form>
  );
}
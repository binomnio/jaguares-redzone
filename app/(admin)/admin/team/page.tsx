// app/(admin)/settings/page.tsx
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function TeamSettingsPage() {
  const supabase = await createClient();

  // 1. Usamos maybeSingle() para prevenir errores cuando la tabla está vacía
  const { data: settings } = await supabase
    .from('team_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  // 2. Guardamos el ID en una variable segura antes del Server Action
  const settingsId = settings?.id;

  async function updateSettings(formData: FormData) {
    'use server';
    const supabaseServer = await createClient();
    
    // Captura de datos básicos
    const team_name = formData.get('team_name') as string;
    const logo_url = formData.get('logo_url') as string;
    const primary_color = formData.get('primary_color') as string;
    const secondary_color = formData.get('secondary_color') as string;
    const short_name = formData.get('short_name') as string;
    const current_record = formData.get('current_record') as string;
    
    // CAPTURA DE NUEVOS TOKENS DE COLOR
    const layout_color = formData.get('layout_color') as string;
    const bg_color = formData.get('bg_color') as string;
    const text_color = formData.get('text_color') as string;
    const glow_color = formData.get('glow_color') as string;
    const button_color = formData.get('button_color') as string;

    const dataToSave = {
      team_name, 
      logo_url, 
      primary_color, 
      secondary_color, 
      short_name, 
      current_record,
      layout_color,
      bg_color,
      text_color,
      glow_color,
      button_color
    };

    if (settingsId) {
      await supabaseServer.from('team_settings').update(dataToSave).eq('id', settingsId);
    } else {
      await supabaseServer.from('team_settings').insert([dataToSave]);
    }

    revalidatePath('/', 'layout');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-black uppercase mb-8">Identidad del <span className="text-team-primary">Equipo</span></h2>

      <form action={updateSettings} className="bg-black border border-gray-800 rounded-xl p-8 space-y-8">
        
        {/* SECCIÓN 1: DATOS BÁSICOS */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre del Equipo</label>
              <input type="text" name="team_name" defaultValue={settings?.team_name || 'Halcones'} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL del Logo (cPanel)</label>
              <input type="url" name="logo_url" defaultValue={settings?.logo_url || ''} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white outline-none" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre Corto del Equipo</label>
              <input type="text" name="short_name" defaultValue={settings?.short_name || 'HAL'} placeholder="Ej. HAL" maxLength={4} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none uppercase font-bold" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Récord Actual</label>
              <input type="text" name="current_record" defaultValue={settings?.current_record || '0-0'} placeholder="Ej. 2-0" className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-team-primary outline-none font-bold" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PALETA DE COLORES MAESTRA */}
        <div className="space-y-6 pt-6 border-t border-gray-800">
          <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Paleta de Colores Maestra</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Color Principal (Base)</label>
              <div className="flex items-center gap-4">
                <input type="color" name="primary_color" defaultValue={settings?.primary_color || '#dc2626'} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-sm text-gray-400 font-mono">{settings?.primary_color || '#dc2626'}</span>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Color Secundario (Oscuro)</label>
              <div className="flex items-center gap-4">
                <input type="color" name="secondary_color" defaultValue={settings?.secondary_color || '#111827'} className="w-12 h-12 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-sm text-gray-400 font-mono">{settings?.secondary_color || '#111827'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: TOKENS DE DISEÑO SEMÁNTICO */}
        <div className="space-y-6 pt-6 border-t border-gray-800">
          <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-2">Tokens de Diseño (Avanzado)</h3>
          <p className="text-xs text-gray-500 mb-4">Configura los colores específicos para cada área de la plataforma. Si dejas uno igual al color principal, el sistema se adaptará automáticamente.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Navbar y Footer (Layout)</label>
              <div className="flex items-center gap-3">
                <input type="color" name="layout_color" defaultValue={settings?.layout_color || settings?.secondary_color || '#111827'} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Fondos (Hero/Headers)</label>
              <div className="flex items-center gap-3">
                <input type="color" name="bg_color" defaultValue={settings?.bg_color || settings?.primary_color || '#dc2626'} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Textos Destacados</label>
              <div className="flex items-center gap-3">
                <input type="color" name="text_color" defaultValue={settings?.text_color || settings?.primary_color || '#dc2626'} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Resplandor (Tarjetas)</label>
              <div className="flex items-center gap-3">
                <input type="color" name="glow_color" defaultValue={settings?.glow_color || settings?.primary_color || '#dc2626'} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Botones Principales</label>
              <div className="flex items-center gap-3">
                <input type="color" name="button_color" defaultValue={settings?.button_color || settings?.primary_color || '#dc2626'} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              </div>
            </div>

          </div>
        </div>

        <div className="pt-8">
          <button type="submit" className="w-full md:w-auto bg-team-primary hover:bg-red-700 text-white font-bold py-4 px-10 rounded-lg uppercase tracking-wider transition-colors">
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
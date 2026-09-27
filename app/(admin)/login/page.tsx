import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  // Server Action para procesar el login
// Dentro de app/(admin)/login/page.tsx

  const signIn = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // AGREGAR AWAIT AQUÍ:
    const supabase = await createClient(); 

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect('/login?message=Credenciales incorrectas');
    }

    return redirect('/admin/dashboard');
  };

  return (
    <main className="min-h-screen bg-team-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a2332] rounded-xl border border-gray-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white uppercase italic">
            Panel <span className="text-team-primary">Admin</span>
          </h1>
          <p className="text-team-accent text-sm mt-2">Acceso exclusivo para el staff del equipo</p>
        </div>

        <form action={signIn} className="flex flex-col gap-4">
          <div>
            <label className="block text-team-accent text-xs font-bold uppercase mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@equipo.com"
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-team-primary focus:ring-1 focus:ring-team-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-team-accent text-xs font-bold uppercase mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-team-primary focus:ring-1 focus:ring-team-primary transition-colors"
            />
          </div>

          {searchParams?.message && (
            <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded">
              {searchParams.message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-team-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-colors mt-4"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </main>
  );
}
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminNavigation({ logoUrl }: { logoUrl: string }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <aside
      className="w-full shrink-0 bg-black border-b border-gray-900 md:w-64 md:border-b-0 md:border-r md:sticky md:top-0 md:h-dvh md:overflow-y-auto flex flex-col"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          if (toggle.current?.getClientRects().length) toggle.current.focus();
        }
      }}
    >
      <div className="p-4 md:p-6 border-b border-gray-900 flex items-center justify-between md:flex-col">
        <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3 md:flex-col md:gap-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-team-primary">
          <Image src={logoUrl} alt="Logo Admin" width={64} height={64} unoptimized className="w-12 h-12 md:w-16 md:h-16 object-contain md:mb-3 shrink-0" />
          <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase text-white">
            Admin <span className="text-team-primary">Panel</span>
          </h1>
        </Link>
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls="admin-navigation"
          aria-label={open ? 'Cerrar menú administrativo' : 'Abrir menú administrativo'}
          onClick={() => setOpen(!open)}
          className="md:hidden min-h-11 px-4 rounded-lg border border-gray-700 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-team-primary"
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      <nav id="admin-navigation" aria-label="Navegación administrativa" className={`${open ? 'flex' : 'hidden'} md:flex flex-1 p-4 flex-col gap-2`}>
        <Link href="/admin/team" onClick={() => setOpen(false)} className="min-h-11 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider text-team-primary border border-gray-800 hover:border-team-primary/50">
          Identidad (Equipo)
        </Link>
        <div className="h-px bg-gray-900 my-2" />
        <Link href="/admin/games" onClick={() => setOpen(false)} className="min-h-11 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider">
          Calendario
        </Link>
        <Link href="/admin/standings" onClick={() => setOpen(false)} className="min-h-11 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider">
          Posiciones
        </Link>
        <Link href="/admin/players" onClick={() => setOpen(false)} className="min-h-11 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold uppercase tracking-wider">
          Roster
        </Link>
      </nav>
    </aside>
  );
}

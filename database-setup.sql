-- ==============================================================
-- SCRIPT MAESTRO DE BASE DE DATOS 
-- Estructura, Seguridad (RLS) y Datos Iniciales
-- ==============================================================

-- 1. EXTENSIONES REQUERIDAS (Para generar IDs automáticos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREACIÓN DE TABLAS (Extraídas de tu proyecto original)
CREATE TABLE IF NOT EXISTS public.team_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_name text NOT NULL,
  primary_color text,
  secondary_color text,
  accent_color text,
  logo_url text,
  updated_at timestamp with time zone DEFAULT now(),
  header_bg_url text,
  short_name text DEFAULT 'HAL'::text,
  current_record text DEFAULT '0-0'::text,
  layout_color text,
  bg_color text,
  text_color text,
  glow_color text,
  button_color text,
  CONSTRAINT team_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.games (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  opponent_name text NOT NULL,
  opponent_logo_url text,
  game_date timestamp with time zone NOT NULL,
  location text,
  is_home boolean DEFAULT true,
  status text DEFAULT 'upcoming'::text,
  our_score integer DEFAULT 0,
  opponent_score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  jornada text,
  maps_url text,
  stream_url text,
  opponent_short_name text,
  opponent_record text,
  CONSTRAINT games_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.standings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position integer NOT NULL,
  team_name text NOT NULL,
  logo_url text,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  ties integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  pf integer DEFAULT 0,
  pc integer DEFAULT 0,
  dif integer DEFAULT 0,
  stk text,
  short_name text,
  CONSTRAINT standings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.players (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  jersey_number text NOT NULL,
  position text NOT NULL,
  photo_url text,
  height text,
  weight text,
  bio text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  is_featured boolean DEFAULT false,
  CONSTRAINT players_pkey PRIMARY KEY (id)
);

-- 3. HABILITAR SEGURIDAD (RLS)
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE LECTURA (Cualquiera que visite la web puede ver los datos)
CREATE POLICY "Lectura publica team_settings" ON public.team_settings FOR SELECT USING (true);
CREATE POLICY "Lectura publica games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Lectura publica standings" ON public.standings FOR SELECT USING (true);
CREATE POLICY "Lectura publica players" ON public.players FOR SELECT USING (true);

-- 5. POLÍTICAS DE ESCRITURA (Solo tú o tu cliente desde el panel admin)
-- Para team_settings
CREATE POLICY "Escribir team_settings" ON public.team_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualizar team_settings" ON public.team_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Borrar team_settings" ON public.team_settings FOR DELETE TO authenticated USING (true);

-- Para games
CREATE POLICY "Escribir games" ON public.games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualizar games" ON public.games FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Borrar games" ON public.games FOR DELETE TO authenticated USING (true);

-- Para standings
CREATE POLICY "Escribir standings" ON public.standings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualizar standings" ON public.standings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Borrar standings" ON public.standings FOR DELETE TO authenticated USING (true);

-- Para players
CREATE POLICY "Escribir players" ON public.players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Actualizar players" ON public.players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Borrar players" ON public.players FOR DELETE TO authenticated USING (true);

-- 6. REGISTRO SEMILLA (Previene el error de actualización la primera vez)
INSERT INTO public.team_settings (team_name, short_name, primary_color, secondary_color) 
VALUES ('Nuevo Equipo', 'NEQ', '#2563eb', '#1e293b');
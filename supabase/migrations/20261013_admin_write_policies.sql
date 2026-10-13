-- Run only after assigning app_metadata.role = admin to existing staff.
-- Restrictive policies also constrain any additional permissive write policies.
BEGIN;
DROP POLICY IF EXISTS "Admin only insert team_settings" ON public.team_settings;
CREATE POLICY "Admin only insert team_settings" ON public.team_settings AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only update team_settings" ON public.team_settings;
CREATE POLICY "Admin only update team_settings" ON public.team_settings AS RESTRICTIVE FOR UPDATE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only delete team_settings" ON public.team_settings;
CREATE POLICY "Admin only delete team_settings" ON public.team_settings AS RESTRICTIVE FOR DELETE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only insert games" ON public.games;
CREATE POLICY "Admin only insert games" ON public.games AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only update games" ON public.games;
CREATE POLICY "Admin only update games" ON public.games AS RESTRICTIVE FOR UPDATE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only delete games" ON public.games;
CREATE POLICY "Admin only delete games" ON public.games AS RESTRICTIVE FOR DELETE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only insert standings" ON public.standings;
CREATE POLICY "Admin only insert standings" ON public.standings AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only update standings" ON public.standings;
CREATE POLICY "Admin only update standings" ON public.standings AS RESTRICTIVE FOR UPDATE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only delete standings" ON public.standings;
CREATE POLICY "Admin only delete standings" ON public.standings AS RESTRICTIVE FOR DELETE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only insert players" ON public.players;
CREATE POLICY "Admin only insert players" ON public.players AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only update players" ON public.players;
CREATE POLICY "Admin only update players" ON public.players AS RESTRICTIVE FOR UPDATE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "Admin only delete players" ON public.players;
CREATE POLICY "Admin only delete players" ON public.players AS RESTRICTIVE FOR DELETE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
COMMIT;

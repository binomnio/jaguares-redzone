import type { SupabaseClient } from '@supabase/supabase-js';

// Only fields rendered by the public pages or used by their interactive carousel.
export const GAME_FIELDS = 'id,opponent_name,opponent_logo_url,opponent_short_name,opponent_record,game_date,location,is_home,status,our_score,opponent_score,jornada,maps_url,stream_url';
export const PLAYER_FIELDS = 'id,first_name,last_name,jersey_number,position,photo_url,height,weight,is_featured';
export const STANDING_FIELDS = 'id,position,team_name,short_name,logo_url,wins,losses,ties,pf,pc,dif,stk';

export function loadHomeData(client: SupabaseClient) {
  // These reads do not depend on one another. Keep the existing session and
  // cache behavior; Promise.all only changes scheduling within this request.
  return Promise.all([
    client.from('team_settings').select('*').limit(1).maybeSingle(),
    client.from('games').select(GAME_FIELDS).order('game_date', { ascending: true }),
    client.from('standings').select(STANDING_FIELDS).order('position', { ascending: true }),
    client.from('players').select(PLAYER_FIELDS).eq('active', true).order('jersey_number', { ascending: true }),
  ]);
}

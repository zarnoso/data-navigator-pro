import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
export const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Cliente con privilegios totales (worker / webhook / lecturas internas). */
export const adminClient = (): SupabaseClient =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

/** Cliente atado al JWT del usuario (RLS aplicado). */
export const userClient = (authHeader: string): SupabaseClient =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

export interface AuthedUser {
  id: string;
  email?: string;
  authHeader: string;
}

/** Verifica JWT en el header y devuelve el usuario. Lanza Response 401 si falla. */
export const requireUser = async (req: Request): Promise<AuthedUser> => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "missing_auth" }), { status: 401 });
  }
  const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data.user) {
    throw new Response(JSON.stringify({ error: "invalid_token" }), { status: 401 });
  }
  return { id: data.user.id, email: data.user.email ?? undefined, authHeader };
};

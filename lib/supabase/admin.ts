import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ⚠️ Este cliente usa la service_role key y se salta RLS completamente.
// SOLO se debe importar dentro de archivos en app/api/, nunca en
// componentes que se ejecuten en el navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

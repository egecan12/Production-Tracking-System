import { createClient } from '@supabase/supabase-js';

// Supabase Admin client - service_role key kullanır, bu güçlü bir yetki sağlar
// SADECE güvenli, sunucu tarafı işlemlerinde kullanın, asla client tarafında kullanmayın
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export { supabaseAdmin }; 
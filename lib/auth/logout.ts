import { createSupabaseBrowser } from "@/lib/supabase/client"

export async function logout() {
  const supabase = createSupabaseBrowser()
  await supabase.auth.signOut()
}

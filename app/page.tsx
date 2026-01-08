import { createSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FinanceDashboard } from "@/components/finance-dashboard"

export default async function HomePage() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase.auth.getUser()

  if (!data.user) redirect("/auth/login")

  return <FinanceDashboard />
}

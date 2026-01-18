import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

async function requireUser(supabase: any) {
  const { data, error } = await supabase.auth.getUser()
  if (error) return { user: null as any, error: error.message }
  if (!data?.user) return { user: null as any, error: "unauthorized" }
  return { user: data.user, error: null as string | null }
}

export async function GET() {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const { data, error } = await supabase
    .from("transactions")
    .select("amount,type")
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let totalIncomeAll = 0
  let totalExpensesAll = 0

  for (const t of data ?? []) {
    const amt = Number((t as any).amount) || 0
    if ((t as any).type === "income") totalIncomeAll += amt
    else totalExpensesAll += amt
  }

  return NextResponse.json({
    totalIncomeAll,
    totalExpensesAll,
    balanceAll: totalIncomeAll - totalExpensesAll,
  })
}

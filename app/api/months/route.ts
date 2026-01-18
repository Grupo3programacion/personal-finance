//app/api/months/route.ts

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

  // Traer solo la columna date del usuario
  const { data, error } = await supabase
    .from("transactions")
    .select("date")
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const set = new Set<string>()

  for (const row of data ?? []) {
    const iso = row.date as string // YYYY-MM-DD
    const [yyyy, mm] = iso.split("-")
    if (mm && yyyy) set.add(`${mm}-${yyyy}`) // MM-YYYY
  }

  const months = Array.from(set).sort((a, b) => {
    const [ma, ya] = a.split("-")
    const [mb, yb] = b.split("-")
    return `${yb}-${mb}`.localeCompare(`${ya}-${ma}`) // desc
  })

  return NextResponse.json(months)
}

import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

async function requireUser(supabase: any) {
  const { data, error } = await supabase.auth.getUser()
  if (error) return { user: null as any, error: error.message }
  if (!data?.user) return { user: null as any, error: "unauthorized" }
  return { user: data.user, error: null as string | null }
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") // income|expense|null

  let query = supabase
    .from("categories")
    .select("name,type")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  if (type) query = query.eq("type", type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json((data ?? []).map((c: any) => c.name))
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const body = await req.json()
  const name = String(body.name ?? "").trim()
  const type = body.type as "income" | "expense"

  if (!name || (type !== "income" && type !== "expense")) {
    return NextResponse.json({ error: "name/type invalid" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("categories")
    .upsert(
      { user_id: user.id, name, type },
      { onConflict: "user_id,name,type" }
    )
    .select("id,name,type")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

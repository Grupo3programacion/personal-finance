import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

function devUserId() {
  return process.env.DEV_USER_ID!
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServer()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") // income|expense|null

  const query = supabase
    .from("categories")
    .select("id,name,type")
    .eq("user_id", devUserId())
    .order("name", { ascending: true })

  const { data, error } = type ? await query.eq("type", type) : await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const names = (data ?? []).map((c) => c.name)
  return NextResponse.json(names)
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const body = await req.json()

  const name = String(body.name ?? "").trim()
  const type = body.type as "income" | "expense"
  if (!name || (type !== "income" && type !== "expense")) {
    return NextResponse.json({ error: "name/type invalid" }, { status: 400 })
  }

  // upsert por unique(user_id,name,type)
  const { data, error } = await supabase
    .from("categories")
    .upsert(
      { user_id: devUserId(), name, type },
      { onConflict: "user_id,name,type" }
    )
    .select("id,name,type")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

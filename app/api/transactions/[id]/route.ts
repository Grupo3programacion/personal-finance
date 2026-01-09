import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

async function requireUser(supabase: any) {
  const { data, error } = await supabase.auth.getUser()
  if (error) return { user: null as any, error: error.message }
  if (!data?.user) return { user: null as any, error: "unauthorized" }
  return { user: data.user, error: null as string | null }
}

// helper: soporta params normal o params Promise (Next nuevo)
async function getIdFromParams(ctx: any) {
  const p = await Promise.resolve(ctx?.params)
  return p?.id as string | undefined
}

export async function DELETE(_req: Request, ctx: any) {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const id = await getIdFromParams(ctx)
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, ctx: any) {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const id = await getIdFromParams(ctx)
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const body = await req.json()

  const date = body.date ? String(body.date) : undefined // YYYY-MM-DD
  const description = body.description !== undefined ? String(body.description).trim() : undefined
  const amount = body.amount !== undefined ? Number(body.amount) : undefined
  const type = body.type as ("income" | "expense" | undefined)
  const categoryName = body.categoryName !== undefined ? String(body.categoryName).trim() : undefined

  // si mandan type + categoryName, resolvemos category_id
  let category_id: string | undefined
  if (type && categoryName) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .upsert(
        { user_id: user.id, name: categoryName, type },
        { onConflict: "user_id,name,type" }
      )
      .select("id")
      .single()

    if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 })
    category_id = cat.id
  }

  const updateData: Record<string, any> = {}
  if (date) updateData.date = date
  if (description !== undefined) updateData.description = description
  if (amount !== undefined && Number.isFinite(amount)) updateData.amount = amount
  if (type) updateData.type = type
  if (category_id) updateData.category_id = category_id

  const { data, error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,date,description,amount,type")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

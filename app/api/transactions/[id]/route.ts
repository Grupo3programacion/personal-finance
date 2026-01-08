import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

function devUserId() {
  return process.env.DEV_USER_ID!
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServer()
  const { id } = await ctx.params
  const body = await req.json()

  // body puede traer: { date:"YYYY-MM-DD", description, amount, type, categoryName }
  const date = body.date ? String(body.date) : undefined
  const description = body.description !== undefined ? String(body.description).trim() : undefined
  const amount = body.amount !== undefined ? Number(body.amount) : undefined
  const type = body.type as ("income" | "expense" | undefined)
  const categoryName = body.categoryName !== undefined ? String(body.categoryName).trim() : undefined

  // si cambian type o categoryName, resolvemos category_id
  let category_id: string | undefined = undefined

  if (type && categoryName) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .upsert(
        { user_id: devUserId(), name: categoryName, type },
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
    .eq("user_id", devUserId())
    .select("id,date,description,amount,type")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServer()
  const { id } = await ctx.params

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", devUserId())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

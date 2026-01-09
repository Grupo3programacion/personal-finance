import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

async function requireUser(supabase: any) {
  const { data, error } = await supabase.auth.getUser()
  if (error) return { user: null as any, error: error.message }
  if (!data?.user) return { user: null as any, error: "unauthorized" }
  return { user: data.user, error: null as string | null }
}

function monthRange(monthKey: string) {
  const [mmStr, yyyyStr] = monthKey.split("-")
  const mm = Number(mmStr)
  const yyyy = Number(yyyyStr)
  const start = new Date(yyyy, mm - 1, 1)
  const end = new Date(yyyy, mm, 1)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

function formatDDMMYYYY(isoDate: string) {
  const [y, m, d] = isoDate.split("-")
  return `${d}/${m}/${y}`
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")
  const type = searchParams.get("type")

  if (!month) return NextResponse.json({ error: "month required" }, { status: 400 })

  const { start, end } = monthRange(month)

  let q = supabase
    .from("transactions")
    .select("id,date,description,amount,type,category:categories(name)")
    .eq("user_id", user.id)
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: false })

  if (type) q = q.eq("type", type)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = (data ?? []).map((t: any) => {
    // category puede venir como objeto o array según tipado
    const catName =
      Array.isArray(t.category) ? t.category?.[0]?.name :
      t.category?.name

    return {
      id: t.id,
      date: formatDDMMYYYY(t.date),
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: catName ?? "Sin categoría",
    }
  })

  return NextResponse.json(mapped)
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const { user, error: authErr } = await requireUser(supabase)
  if (authErr) return NextResponse.json({ error: authErr }, { status: 401 })

  const body = await req.json()

  const date = String(body.date ?? "")
  const description = String(body.description ?? "").trim()
  const amount = Number(body.amount)
  const type = body.type as "income" | "expense"
  const categoryName = String(body.categoryName ?? "").trim()

  if (!date || !description || !categoryName || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  }

  // 1) upsert category para este usuario
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .upsert(
      { user_id: user.id, name: categoryName, type },
      { onConflict: "user_id,name,type" }
    )
    .select("id")
    .single()

  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 })

  // 2) insert transaction
  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      date,
      description,
      amount,
      type,
      category_id: cat.id,
    })
    .select("id,date,description,amount,type")
    .single()

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

  return NextResponse.json(
    {
      id: tx.id,
      date: formatDDMMYYYY(tx.date),
      description: tx.description,
      amount: Number(tx.amount),
      type: tx.type,
      category: categoryName,
    },
    { status: 201 }
  )
}

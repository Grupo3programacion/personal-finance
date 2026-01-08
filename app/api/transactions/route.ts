//app/api/transactions/route.ts

import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

function devUserId() {
  return process.env.DEV_USER_ID!
}

function monthRange(monthKey: string) {
  // "MM-YYYY"
  const [mmStr, yyyyStr] = monthKey.split("-")
  const mm = Number(mmStr)
  const yyyy = Number(yyyyStr)
  const start = new Date(yyyy, mm - 1, 1)
  const end = new Date(yyyy, mm, 1)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) } // YYYY-MM-DD
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServer()
  const { searchParams } = new URL(req.url)

  const month = searchParams.get("month") // "MM-YYYY"
  const type = searchParams.get("type") // income|expense|null

  if (!month) return NextResponse.json({ error: "month required" }, { status: 400 })

  const { start, end } = monthRange(month)

  let q = supabase
    .from("transactions")
    .select("id,date,description,amount,type,category:categories(id,name,type)")
    .eq("user_id", devUserId())
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: false })

  if (type) q = q.eq("type", type)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // map para tu UI: category name directo
  const mapped = (data ?? []).map((t: any) => ({
    id: t.id,
    date: formatDDMMYYYY(t.date), // guardas en UI dd/mm/yyyy
    description: t.description,
    amount: Number(t.amount),
    type: t.type,
    category: t.category?.name ?? "Sin categoría",
  }))

  return NextResponse.json(mapped)
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer()
  const body = await req.json()
  // body: { date:"YYYY-MM-DD", description, amount, type, categoryName }

  const date = String(body.date ?? "")
  const description = String(body.description ?? "").trim()
  const amount = Number(body.amount)
  const type = body.type as "income" | "expense"
  const categoryName = String(body.categoryName ?? "").trim()

  if (!date || !description || !categoryName || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  }

  // 1) upsert category
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .upsert(
      { user_id: devUserId(), name: categoryName, type },
      { onConflict: "user_id,name,type" }
    )
    .select("id,name,type")
    .single()

  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 })

  // 2) insert transaction
  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      user_id: devUserId(),
      date, // YYYY-MM-DD
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

function formatDDMMYYYY(isoDate: string) {
  // "YYYY-MM-DD"
  const [y, m, d] = isoDate.split("-")
  return `${d}/${m}/${y}`
}

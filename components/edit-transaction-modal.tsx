"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/data"
import { BANKS } from "@/lib/banks"

function toISODate(ddmmyyyy: string) {
  const [dd, mm, yyyy] = ddmmyyyy.split("/")
  return `${yyyy}-${mm}-${dd}`
}

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  categories,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  transaction: Transaction
  categories: { income: string[]; expense: string[] }
  onSaved: () => Promise<void> | void
}) {
  const [type, setType] = useState<"income" | "expense">(transaction.type)
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(String(transaction.amount))
  const [date, setDate] = useState(toISODate(transaction.date)) // input date necesita YYYY-MM-DD
  const [category, setCategory] = useState(transaction.category)

  const [paymentType, setPaymentType] = useState<"cash" | "bank">(transaction.paymentType ?? "cash")
  const [bank, setBank] = useState(transaction.bank ?? "")

  const [saving, setSaving] = useState(false)

  const list = useMemo(() => (type === "expense" ? categories.expense : categories.income), [type, categories])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !date || !category) return
    if (paymentType === "bank" && !bank) return

    setSaving(true)
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date, // YYYY-MM-DD
          description,
          amount: Number(amount),
          type,
          categoryName: category,
          paymentType,
          bank: paymentType === "bank" ? bank : null,
        }),
      })
      if (!res.ok) {
        console.error(await res.json())
        return
      }
      await onSaved()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Editar transacción</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Monto</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
              <SelectContent>
                {list.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de pago</Label>
            <Select
              value={paymentType}
              onValueChange={(v) => {
                const next = v as "cash" | "bank"
                setPaymentType(next)
                if (next === "cash") setBank("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="bank">Bancarizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ✅ NUEVO: Banco condicional */}
          {paymentType === "bank" && (
            <div className="space-y-2">
              <Label>Banco</Label>
              <Select value={bank} onValueChange={setBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!bank && (
                <p className="text-xs text-muted-foreground">Selecciona un banco para pagos bancarizados.</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

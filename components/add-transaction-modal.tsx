//components/add-transaction-modal.tsx

"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Transaction } from "@/lib/data"

interface AddTransactionModalProps {
  onAdd: (transaction: Omit<Transaction, "id">) => void
  categories: { income: string[]; expense: string[] }
  onAddCategory: (type: "income" | "expense", name: string) => void
}

export function AddTransactionModal({ onAdd, categories, onAddCategory }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState("")

  // nueva categoría
  const [addingCat, setAddingCat] = useState(false)
  const [newCat, setNewCat] = useState("")

  const list = useMemo(
    () => (type === "expense" ? categories.expense : categories.income),
    [type, categories]
  )

  const handleCreateCategory = async () => {
  const trimmed = newCat.trim()
  if (!trimmed) return

  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmed, type }),
  })

  if (!res.ok) {
    console.error(await res.json())
    return
  }

  //también actualiza UI local (pero lo importante es refrescar categorías)
  onAddCategory(type, trimmed)

  setCategory(trimmed)
  setNewCat("")
  setAddingCat(false)
}

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!description || !amount || !category) return

  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date, // YYYY-MM-DD
      description,
      amount: Number(amount),
      type,
      categoryName: category,
    }),
  })

  if (!res.ok) {
    // aquí puedes usar toast si quieres
    console.error(await res.json())
    return
  }

  // mantener onAdd para refrescar UI rápido:
  const created = await res.json()
  onAdd({
    date: created.date, // ya viene dd/mm/yyyy desde el API
    description: created.description,
    amount: created.amount,
    type: created.type,
    category: created.category,
  })

  // Reset form
  setDescription("")
  setAmount("")
  setCategory("")
  setDate(new Date().toISOString().split("T")[0])
  setAddingCat(false)
  setNewCat("")
  setOpen(false)
}


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Nueva Transacción
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Transacción</DialogTitle>
          <DialogDescription>Registra un nuevo ingreso o egreso en tu historial financiero</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej: Compra supermercado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Categoría</Label>
              <Button
                type="button"
                variant="ghost"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => setAddingCat((v) => !v)}
              >
                {addingCat ? "Cerrar" : "Nueva categoría"}
              </Button>
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {list.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {addingCat && (
              <div className="flex gap-2">
                <Input
                  placeholder={type === "income" ? "Ej: Intereses" : "Ej: Mascotas"}
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                />
                <Button type="button" onClick={handleCreateCategory}>
                  Crear
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Agregar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

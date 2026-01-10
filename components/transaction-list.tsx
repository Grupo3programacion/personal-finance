//src/components/transaction-list.tsx
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, MoreHorizontal } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/data"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { EditTransactionModal } from "@/components/edit-transaction-modal"

export type TypeFilter = "all" | "income" | "expense"

interface TransactionListProps {
  selectedMonth: string
  transactions: Transaction[]
  categories: { income: string[]; expense: string[] }
  onChanged: () => Promise<any> | any

  typeFilter: TypeFilter
  onTypeFilterChange: (v: TypeFilter) => void
  
}

export function TransactionList({
  selectedMonth,
  transactions,
  categories,
  onChanged,
  typeFilter,
  onTypeFilterChange,
}: TransactionListProps) {
  

  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  

  const monthTransactions = useMemo(
    () => getTransactions(selectedMonth, transactions),
    [selectedMonth, transactions]
  )

  const filtered = useMemo(() => {
    if (typeFilter === "all") return monthTransactions
    return monthTransactions.filter((t) => t.type === typeFilter)
  }, [monthTransactions, typeFilter])

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>Todas las transacciones del mes seleccionado</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button variant={typeFilter === "all" ? "default" : "outline"} onClick={() => onTypeFilterChange("all")}>
              Todas
            </Button>
            <Button variant={typeFilter === "income" ? "default" : "outline"} onClick={() => onTypeFilterChange("income")}>
              Ingresos
            </Button>
            <Button variant={typeFilter === "expense" ? "default" : "outline"} onClick={() => onTypeFilterChange("expense")}>
              Egresos
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {filtered.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-lg p-2 ${
                    transaction.type === "income" ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpCircle className="size-5 text-success" />
                  ) : (
                    <ArrowDownCircle className="size-5 text-destructive" />
                  )}
                </div>

                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                    {transaction.paymentType === "bank" ? `Bancarizado${transaction.bank ? ` • ${transaction.bank}` : ""}` : "Efectivo"}
                  </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p
                  className={`text-lg font-semibold ${
                    transaction.type === "income" ? "text-success" : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-ES")}
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(transaction)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(transaction)}>
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No hay transacciones para este filtro en el mes seleccionado.
            </div>
          )}

          {/* Modales deben ir fuera del map, pero dentro del CardContent */}
          {editing && (
            <EditTransactionModal
              key={editing.id}
              open={!!editing}
              onOpenChange={(v) => !v && setEditing(null)}
              transaction={editing}
              categories={categories}
              onSaved={onChanged}
            />
          )}

          <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleting(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!deleting) return
                    const res = await fetch(`/api/transactions/${deleting.id}`, { method: "DELETE" })
                    if (!res.ok) {
                      const text = await res.text()
                      console.error("DELETE failed:", res.status, text)
                      return
                    }
                    setDeleting(null)
                    await onChanged()
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
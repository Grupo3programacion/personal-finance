//src/components/transaction-list.tsx
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/data"

interface TransactionListProps {
  selectedMonth: string
  transactions: Transaction[]
}

type TypeFilter = "all" | "income" | "expense"

export function TransactionList({ selectedMonth, transactions }: TransactionListProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")

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
            <Button variant={typeFilter === "all" ? "default" : "outline"} onClick={() => setTypeFilter("all")}>
              Todas
            </Button>
            <Button variant={typeFilter === "income" ? "default" : "outline"} onClick={() => setTypeFilter("income")}>
              Ingresos
            </Button>
            <Button variant={typeFilter === "expense" ? "default" : "outline"} onClick={() => setTypeFilter("expense")}>
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
                <div className={`rounded-lg p-2 ${transaction.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
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
                  </div>
                </div>
              </div>

              <p className={`text-lg font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}>
                {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-ES")}
              </p>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No hay transacciones para este filtro en el mes seleccionado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

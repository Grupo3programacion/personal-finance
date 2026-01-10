//src/components/metric-cards.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { getMonthData, type Transaction } from "@/lib/data"
import type { TypeFilter } from "@/components/transaction-list"

interface MetricCardsProps {
  selectedMonth: string
  transactions: Transaction[]
  onNavigate: (filter: TypeFilter) => void 
}

export function MetricCards({ selectedMonth, transactions, onNavigate }: MetricCardsProps) {
  const data = getMonthData(selectedMonth, transactions)

  const metrics = [
    {
      title: "Balance Total",
      value: data.balance,
      icon: Wallet,
      color: data.balance >= 0 ? "text-success" : "text-destructive",
      bgColor: data.balance >= 0 ? "bg-success/10" : "bg-destructive/10",
      filter: null as TypeFilter | null,
    },
    {
      title: "Ingresos del Mes",
      value: data.totalIncome,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      filter: "income" as TypeFilter,
    },
    {
      title: "Egresos del Mes",
      value: data.totalExpenses,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      filter: "expense" as TypeFilter,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const clickable = !!metric.filter
        return (
          <Card
            key={index}
            className={clickable ? "cursor-pointer transition hover:shadow-sm" : ""}
            onClick={clickable ? () => onNavigate(metric.filter!) : undefined}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>

              <div className="flex items-center gap-2">
                {clickable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate(metric.filter!)
                    }}
                  >
                    Ver
                  </Button>
                )}

                <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                  <metric.icon className={`size-4 ${metric.color}`} />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>${metric.value.toLocaleString("es-ES")}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.value >= 0 ? "+" : ""}
                {data.totalIncome > 0 ? ((metric.value / data.totalIncome) * 100).toFixed(1) : "0.0"}% del total
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { getMonthData, type Transaction } from "@/lib/data"

interface MetricCardsProps {
  selectedMonth: string
  transactions: Transaction[]
}

export function MetricCards({ selectedMonth, transactions }: MetricCardsProps) {
  const data = getMonthData(selectedMonth, transactions)

  const metrics = [
    {
      title: "Balance Total",
      value: data.balance,
      icon: Wallet,
      color: data.balance >= 0 ? "text-success" : "text-destructive",
      bgColor: data.balance >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "Ingresos del Mes",
      value: data.totalIncome,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Egresos del Mes",
      value: data.totalExpenses,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    /* {
      title: "Ahorro Estimado",
      value: data.savings,
      icon: PiggyBank,
      color: "text-accent",
      bgColor: "bg-accent/10",
    }, */
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <div className={`rounded-lg p-2 ${metric.bgColor}`}>
              <metric.icon className={`size-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>${metric.value.toLocaleString("es-ES")}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric.value >= 0 ? "+" : ""}
              {((metric.value / data.totalIncome) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

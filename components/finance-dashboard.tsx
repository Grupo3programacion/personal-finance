//src/components/finance-dashboard.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCards } from "@/components/metric-cards"
import { TransactionList } from "@/components/transaction-list"
import { ChartSection } from "@/components/chart-section"
import { MonthSelector } from "@/components/month-selector"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { DollarSign } from "lucide-react"
import { initialTransactions, type Transaction } from "@/lib/data"

export function FinanceDashboard() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(
  `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`
)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    }
  
    setTransactions((prev) => [transaction, ...prev])
  
    const [, mm, yyyy] = transaction.date.split("/") // "dd/mm/yyyy"
    if (mm && yyyy) setSelectedMonth(`${mm}-${yyyy}`)
  }

  const initialCategories = {
    expense: ["Alimentación","Vivienda","Transporte","Servicios","Salud","Ocio","Compras","Educación","Otros"],
    income: ["Salario","Freelance","Inversiones","Bonus","Otros"],
  }
  
  const [categories, setCategories] = useState(initialCategories)
  
  const handleAddCategory = (type: "income" | "expense", name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
  
    setCategories((prev) => {
      const list = prev[type]
      if (list.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev
      return { ...prev, [type]: [trimmed, ...list] }
    })
  }


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <DollarSign className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">Control Financiero</h1>
                <p className="text-sm text-muted-foreground">Gestiona tus ingresos y egresos</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <AddTransactionModal
              onAdd={handleAddTransaction}
              categories={categories}
              onAddCategory={handleAddCategory}
            />
              <MonthSelector value={selectedMonth} onChange={setSelectedMonth} transactions={transactions} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <MetricCards selectedMonth={selectedMonth} transactions={transactions} />

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <ChartSection selectedMonth={selectedMonth} transactions={transactions} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionList selectedMonth={selectedMonth} transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

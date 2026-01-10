//src/components/finance-dashboard.tsx
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCards } from "@/components/metric-cards"
import { TransactionList, type TypeFilter } from "@/components/transaction-list"
import { ChartSection } from "@/components/chart-section"
import { MonthSelector } from "@/components/month-selector"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { DollarSign } from "lucide-react"
import useSWR from "swr"
import type { Transaction } from "@/lib/data"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth/logout"
import { LogOut } from "lucide-react"
import { Button } from "./ui/button"


const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function FinanceDashboard() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(
  `${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`
)
  
  const { data: transactions = [], mutate } = useSWR<Transaction[]>(
    `/api/transactions?month=${selectedMonth}`,
    fetcher
  )

   // tab controlado + filtro global
  const [tab, setTab] = useState<"overview" | "transactions">("overview")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")

  const { data: expenseCats = [], mutate: mutateExpenseCats } = useSWR<string[]>(
  "/api/categories?type=expense",
  fetcher
)

const { data: incomeCats = [], mutate: mutateIncomeCats } = useSWR<string[]>(
  "/api/categories?type=income",
  fetcher
)

  const categories = {
  expense: expenseCats,
  income: incomeCats,
}

const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push("/auth/login")
}

  const onAddCategory = async (type: "income" | "expense", _name: string) => {
  // revalida el tipo correspondiente para que aparezca en el próximo modal
  if (type === "income") await mutateIncomeCats()
  else await mutateExpenseCats()
}

  

  //
  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id">) => {
    const [, mm, yyyy] = newTransaction.date.split("/")
    if (mm && yyyy) setSelectedMonth(`${mm}-${yyyy}`)

    // refresca lista desde BD
    await mutate()
  }

  // navegar desde cards -> tab transacciones + filtro
  const handleMetricNavigate = (next: TypeFilter) => {
    setTab("transactions")
    setTypeFilter(next)
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
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <AddTransactionModal
              onAdd={handleAddTransaction}
              categories={categories}
              onAddCategory={onAddCategory}
            />
              <MonthSelector value={selectedMonth} onChange={setSelectedMonth} transactions={transactions} />
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-red-600 text-white hover:bg-red-700">
                <LogOut className="size-4" />
                Salir
            </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <MetricCards
          selectedMonth={selectedMonth}
          transactions={transactions}
          onNavigate={handleMetricNavigate}
        />

       <Tabs value={tab} onValueChange={(v) => setTab(v as "overview" | "transactions")} className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <ChartSection selectedMonth={selectedMonth} transactions={transactions} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionList
              selectedMonth={selectedMonth}
              transactions={transactions}
              categories={categories}
              onChanged={async () => {
              await mutate() 
            }}
            typeFilter={typeFilter}                
            onTypeFilterChange={setTypeFilter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

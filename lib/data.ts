//src/lib/data.ts

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  paymentType?: "cash" | "bank"
  bank?: string | null
}


export const initialTransactions: Transaction[] = [
  // Diciembre 2024
  { id: "1", date: "01/12/2024", description: "Salario", amount: 4500, type: "income", category: "Salario" },
  { id: "2", date: "02/12/2024", description: "Supermercado", amount: 280, type: "expense", category: "Alimentación" },
  {
    id: "3",
    date: "03/12/2024",
    description: "Freelance proyecto web",
    amount: 800,
    type: "income",
    category: "Freelance",
  },
  { id: "4", date: "05/12/2024", description: "Alquiler", amount: 1200, type: "expense", category: "Vivienda" },
  { id: "5", date: "07/12/2024", description: "Gasolina", amount: 120, type: "expense", category: "Transporte" },
  { id: "6", date: "10/12/2024", description: "Restaurante", amount: 85, type: "expense", category: "Ocio" },
  { id: "7", date: "12/12/2024", description: "Consultoría", amount: 600, type: "income", category: "Freelance" },
  { id: "8", date: "14/12/2024", description: "Electricidad", amount: 95, type: "expense", category: "Servicios" },
  { id: "9", date: "15/12/2024", description: "Supermercado", amount: 210, type: "expense", category: "Alimentación" },
  { id: "10", date: "18/12/2024", description: "Internet", amount: 60, type: "expense", category: "Servicios" },
  { id: "11", date: "20/12/2024", description: "Gimnasio", amount: 45, type: "expense", category: "Salud" },
  { id: "12", date: "22/12/2024", description: "Compras navidad", amount: 350, type: "expense", category: "Compras" },
  { id: "13", date: "25/12/2024", description: "Bono navidad", amount: 500, type: "income", category: "Bonus" },
  { id: "14", date: "28/12/2024", description: "Cena familiar", amount: 120, type: "expense", category: "Ocio" },

  // Noviembre 2024
  { id: "15", date: "01/11/2024", description: "Salario", amount: 4500, type: "income", category: "Salario" },
  { id: "16", date: "03/11/2024", description: "Supermercado", amount: 250, type: "expense", category: "Alimentación" },
  { id: "17", date: "05/11/2024", description: "Alquiler", amount: 1200, type: "expense", category: "Vivienda" },
  { id: "18", date: "08/11/2024", description: "Freelance", amount: 700, type: "income", category: "Freelance" },
  { id: "19", date: "12/11/2024", description: "Gasolina", amount: 110, type: "expense", category: "Transporte" },
]

export function getTransactions(month: string, transactions: Transaction[]): Transaction[] {
  const [monthNum, year] = month.split("-")
  return transactions
    .filter((t) => {
      const [day, tMonth, tYear] = t.date.split("/")
      return tMonth === monthNum && tYear === year
    })
    .sort((a, b) => {
      const [dayA] = a.date.split("/")
      const [dayB] = b.date.split("/")
      return Number.parseInt(dayB) - Number.parseInt(dayA)
    })
}

export function getMonthData(month: string, transactions: Transaction[]) {
  const monthTransactions = getTransactions(month, transactions)

  const totalIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses
  const savings = balance * 0.3 // 30% de ahorro sugerido

  return {
    totalIncome,
    totalExpenses,
    balance,
    savings,
  }
}

export function getDailyData(month: string, transactions: Transaction[]) {
  const monthTransactions = getTransactions(month, transactions)
  const dailyMap = new Map<number, { ingresos: number; egresos: number }>()

  monthTransactions.forEach((t) => {
    const day = Number.parseInt(t.date.split("/")[0])
    const current = dailyMap.get(day) || { ingresos: 0, egresos: 0 }

    if (t.type === "income") {
      current.ingresos += t.amount
    } else {
      current.egresos += t.amount
    }

    dailyMap.set(day, current)
  })

  // Crear datos para todos los días del mes
  const daysInMonth = 30
  const result = []

  for (let i = 1; i <= daysInMonth; i += 2) {
    const data = dailyMap.get(i) || { ingresos: 0, egresos: 0 }
    result.push({
      day: i.toString(),
      ingresos: data.ingresos,
      egresos: data.egresos,
    })
  }

  return result
}

export function getCategoryData(month: string, transactions: Transaction[]) {
  const monthTransactions = getTransactions(month, transactions).filter((t) => t.type === "expense")
  const categoryMap = new Map<string, number>()

  monthTransactions.forEach((t) => {
    const current = categoryMap.get(t.category) || 0
    categoryMap.set(t.category, current + t.amount)
  })

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getComparisonData(transactions: Transaction[]) {
  const monthsData = new Map<string, { ingresos: number; egresos: number }>()

  transactions.forEach((t) => {
    const [, month, year] = t.date.split("/")
    const key = `${month}/${year}`

    const current = monthsData.get(key) || { ingresos: 0, egresos: 0 }

    if (t.type === "income") {
      current.ingresos += t.amount
    } else {
      current.egresos += t.amount
    }

    monthsData.set(key, current)
  })

  // Obtener últimos 5 meses
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const result = Array.from(monthsData.entries())
    .map(([key, data]) => {
      const [month, year] = key.split("/")
      return {
        month: monthNames[Number.parseInt(month) - 1],
        ingresos: data.ingresos,
        egresos: data.egresos,
        sortKey: `${year}-${month}`,
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-5)
    .map(({ month, ingresos, egresos }) => ({ month, ingresos, egresos }))

  return result.length > 0 ? result : [{ month: "Actual", ingresos: 0, egresos: 0 }]
}

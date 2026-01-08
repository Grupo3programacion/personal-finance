"use client"

import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/lib/data"

interface MonthSelectorProps {
  value: string // "MM-YYYY"
  onChange: (value: string) => void
  transactions?: Transaction[] // <-- opcional para armar lista desde data (recomendado)
}

function labelFromKey(key: string) {
  const [mm, yyyy] = key.split("-")
  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  const m = Number.parseInt(mm, 10)
  const name = monthNames[m - 1] ?? mm
  return `${name} ${yyyy}`
}

function monthKeyFromDate(dateStr: string) {
  // date "dd/mm/yyyy"
  const [, mm, yyyy] = dateStr.split("/")
  return `${mm}-${yyyy}`
}

export function MonthSelector({ value, onChange, transactions = [] }: MonthSelectorProps) {
  const months = useMemo(() => {
    const set = new Set<string>()

    // meses de transacciones
    for (const t of transactions) {
      const key = monthKeyFromDate(t.date)
      if (key) set.add(key)
    }

    // asegura que el seleccionado siempre exista
    if (value) set.add(value)

    // ordenar asc por año/mes
    return Array.from(set).sort((a, b) => {
      const [ma, ya] = a.split("-")
      const [mb, yb] = b.split("-")
      const ka = `${ya}-${ma}`
      const kb = `${yb}-${mb}`
      return ka.localeCompare(kb)
    })
  }, [transactions, value])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Mes" />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m} value={m}>
            {labelFromKey(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

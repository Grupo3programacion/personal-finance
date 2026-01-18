//components/month-selector.tsx

"use client"

import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthSelectorProps {
  value: string // "MM-YYYY"
  onChange: (value: string) => void
  months: string[] // lista desde /api/months
}

function labelFromKey(key: string) {
  const [mm, yyyy] = key.split("-")
  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  const m = Number.parseInt(mm, 10)
  const name = monthNames[m - 1] ?? mm
  return `${name} ${yyyy}`
}

export function MonthSelector({ value, onChange, months }: MonthSelectorProps) {
  const options = useMemo(() => {
    const set = new Set(months ?? [])
    if (value) set.add(value) 
    return Array.from(set)
  }, [months, value])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Mes" />
      </SelectTrigger>
      <SelectContent>
        {options.map((m) => (
          <SelectItem key={m} value={m}>
            {labelFromKey(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

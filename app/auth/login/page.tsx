"use client"

import { useState } from "react"
import { createSupabaseBrowser } from "@/lib/supabase/client"
import { usernameToEmail } from "@/lib/auth/username"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const email = usernameToEmail(username)
      const supabase = createSupabaseBrowser()

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      router.push("/")
    } catch (err: any) {
      setError(err?.message ?? "Error iniciando sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold">Iniciar sesión</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input className="w-full rounded border p-2" placeholder="usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded bg-black p-2 text-white" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}

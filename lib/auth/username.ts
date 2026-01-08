export function usernameToEmail(username: string) {
  const u = username.trim().toLowerCase()

  // reglas simples para evitar problemas
  if (!/^[a-z0-9._-]{3,20}$/.test(u)) {
    throw new Error("Usuario inválido (usa 3-20 chars: letras, números, . _ -)")
  }

  return `${u}@finanzas.local`
}

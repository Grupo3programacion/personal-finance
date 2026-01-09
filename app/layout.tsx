import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Control Financiero | Gestiona tus Finanzas",
  description:
    "Aplicación para gestionar ingresos y egresos, visualizar métricas financieras y controlar tu presupuesto mensual",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/finanzaApp.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/finanzaApp.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/finanzaApp.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/finanzaApp.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

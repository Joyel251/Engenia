import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import NotificationProvider from "@/components/NotificationProvider"
import "./globals.css"
import { validateEnv } from "@/lib/validateEnv"

// Validate environment early (server only). This will no-op after first call.
if (typeof window === 'undefined') {
  validateEnv()
}

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Engenia2k25",
  description: "Join us for the most vibrant cultural festival of the year",
//  { icons: {
  //  icon: "/favicon.png",
    //shortcut: "/favicon.png",
    //apple: "/favicon.png",
  //},
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${spaceGrotesk.variable} ${dmSans.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Analytics />
        </Suspense>
        <NotificationProvider />
        <Toaster 
          theme="dark" 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(24, 24, 27)',
              border: '1px solid rgb(63, 63, 70)',
              color: 'rgb(244, 244, 245)'
            }
          }}
        />
      </body>
    </html>
  )
}

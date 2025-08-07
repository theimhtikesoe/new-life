import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ClientInitializer } from "@/components/client-initializer"
import "./globals.css"

export const metadata: Metadata = {
  title: "New Life POS System",
  description: "A modern point of sale system for New Life business",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1">
              {children}
            </main>
          </SidebarProvider>
          <Toaster />
          <ClientInitializer />
        </ThemeProvider>
      </body>
    </html>
  )
}

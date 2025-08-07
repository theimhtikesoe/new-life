"use client"

import { useEffect } from "react"
import { initializeDefaultData } from "@/lib/supabase"

export function ClientInitializer() {
  useEffect(() => {
    // Initialize default data on app start
    initializeDefaultData()
  }, [])

  return null
}

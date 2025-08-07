"use client"

import { useEffect } from 'react'
import { initializeDefaultData } from '@/lib/supabase'

export function ClientInitializer() {
  useEffect(() => {
    initializeDefaultData()
  }, [])

  return null
}

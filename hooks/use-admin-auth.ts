"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminAuthStore {
  isAuthenticated: boolean
  authenticate: (password: string) => boolean
  logout: () => void
  checkAuth: () => boolean
}

const ADMIN_PASSWORD = "newlife"

export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      
      authenticate: (password: string) => {
        const isValid = password === ADMIN_PASSWORD
        if (isValid) {
          set({ isAuthenticated: true })
        }
        return isValid
      },
      
      logout: () => {
        set({ isAuthenticated: false })
      },
      
      checkAuth: () => {
        return get().isAuthenticated
      }
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)

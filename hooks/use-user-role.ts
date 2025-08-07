"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserRole = 'admin' | 'cashier' | 'viewer'

interface UserRoleStore {
  role: UserRole
  setRole: (role: UserRole) => void
}

export const useUserRole = create<UserRoleStore>()(
  persist(
    (set) => ({
      role: 'admin',
      setRole: (role) => set({ role }),
    }),
    {
      name: 'user-role-storage',
    }
  )
)

"use client"

import { create } from 'zustand'
import { getSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase'
import { useEffect } from 'react'

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  isDefault: boolean
}

interface CategoriesStore {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  subscribeToChanges: () => () => void
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const categories = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        createdAt: item.created_at,
        isDefault: item.is_default
      }))

      set({ categories, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addCategory: async (categoryData) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          is_default: categoryData.isDefault
        })
        .select()
        .single()

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        const newCategory = {
          id: Date.now().toString(),
          name: categoryData.name,
          description: categoryData.description,
          createdAt: new Date().toISOString(),
          isDefault: categoryData.isDefault
        }
        set(state => ({
          categories: [...state.categories, newCategory]
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          description: updates.description || null,
          is_default: updates.isDefault
        })
        .eq('id', id)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          categories: state.categories.map(cat => 
            cat.id === id ? { ...cat, ...updates } : cat
          )
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteCategory: async (id) => {
    try {
      const category = get().categories.find(c => c.id === id)
      if (category?.isDefault) {
        throw new Error('Cannot delete default categories')
      }

      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          categories: state.categories.filter(cat => cat.id !== id)
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  getCategoryById: (id) => {
    const { categories } = get()
    return categories.find(category => category.id === id)
  },

  subscribeToChanges: () => {
    if (!hasSupabaseCredentials) {
      return () => {} // No-op for mock mode
    }

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          get().fetchCategories()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))

// Hook to initialize and subscribe to changes
export const useCategoriesSync = () => {
  const store = useCategoriesStore()

  useEffect(() => {
    // Initial fetch
    store.fetchCategories()

    // Subscribe to real-time changes only if using real Supabase
    if (hasSupabaseCredentials) {
      const unsubscribe = store.subscribeToChanges()
      return unsubscribe
    }
  }, [])

  return store
}

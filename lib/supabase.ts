import { createClient } from '@supabase/supabase-js'

// Fallback values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have real Supabase credentials
export const hasSupabaseCredentials = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'

export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

// Local storage keys
const STORAGE_KEYS = {
  products: 'newlife-pos-products',
  orders: 'newlife-pos-orders',
  categories: 'newlife-pos-categories',
  card_types: 'newlife-pos-card-types'
}

// Local storage utilities
const getFromStorage = (key: string, defaultValue: any[] = []) => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

const saveToStorage = (key: string, data: any[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Mock Supabase client with localStorage persistence
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      order: (column: string, options?: any) => ({
        then: (callback: (result: any) => void) => {
          const storageKey = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS]
          const defaultData = getDefaultData(table)
          const data = getFromStorage(storageKey, defaultData)
          callback({ data, error: null })
          return Promise.resolve({ data, error: null })
        }
      }),
      single: () => ({
        then: (callback: (result: any) => void) => {
          const storageKey = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS]
          const defaultData = getDefaultData(table)
          const data = getFromStorage(storageKey, defaultData)
          const singleItem = data[0] || null
          callback({ data: singleItem, error: null })
          return Promise.resolve({ data: singleItem, error: null })
        }
      })
    }),
    insert: (newData: any) => ({
      select: () => ({
        single: () => ({
          then: (callback: (result: any) => void) => {
            const storageKey = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS]
            const defaultData = getDefaultData(table)
            const existingData = getFromStorage(storageKey, defaultData)
            
            const newItem = {
              ...newData,
              id: newData.id || Date.now().toString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            const updatedData = [...existingData, newItem]
            saveToStorage(storageKey, updatedData)
            
            callback({ data: newItem, error: null })
            return Promise.resolve({ data: newItem, error: null })
          }
        })
      })
    }),
    update: (updateData: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: (result: any) => void) => {
          const storageKey = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS]
          const defaultData = getDefaultData(table)
          const existingData = getFromStorage(storageKey, defaultData)
          
          const updatedData = existingData.map((item: any) =>
            item[column] === value
              ? { ...item, ...updateData, updated_at: new Date().toISOString() }
              : item
          )
          
          saveToStorage(storageKey, updatedData)
          callback({ data: null, error: null })
          return Promise.resolve({ data: null, error: null })
        }
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: (callback: (result: any) => void) => {
          const storageKey = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS]
          const defaultData = getDefaultData(table)
          const existingData = getFromStorage(storageKey, defaultData)
          
          const filteredData = existingData.filter((item: any) => item[column] !== value)
          saveToStorage(storageKey, filteredData)
          
          callback({ data: null, error: null })
          return Promise.resolve({ data: null, error: null })
        }
      })
    })
  }),
  channel: (name: string) => ({
    on: (event: string, options: any, callback: any) => ({
      subscribe: () => ({})
    })
  }),
  removeChannel: (channel: any) => {}
}

// Get the appropriate client
export const getSupabaseClient = () => {
  return hasSupabaseCredentials ? supabase : mockSupabase
}

// Default data for initialization
function getDefaultData(table: string) {
  switch (table) {
    case 'categories':
      return [
        { id: 'small', name: 'Small', description: 'Small sized water bottles', is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 'medium', name: 'Medium', description: 'Medium sized water bottles', is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: 'large', name: 'Large', description: 'Large sized water bottles', is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
      ]
    case 'card_types':
      return [
        { id: '100', label: '100-pack', quantity: 100, is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: '200', label: '200-pack', quantity: 200, is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: '400', label: '400-pack', quantity: 400, is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
        { id: '500', label: '500-pack', quantity: 500, is_default: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
      ]
    case 'products':
      return [] // Empty as requested
    case 'orders':
      return [] // Empty as requested
    default:
      return []
  }
}

// Initialize default data if not exists
export const initializeDefaultData = () => {
  if (typeof window === 'undefined') return
  
  // Initialize categories if not exists
  const categories = getFromStorage(STORAGE_KEYS.categories)
  if (categories.length === 0) {
    saveToStorage(STORAGE_KEYS.categories, getDefaultData('categories'))
  }
  
  // Initialize card types if not exists
  const cardTypes = getFromStorage(STORAGE_KEYS.card_types)
  if (cardTypes.length === 0) {
    saveToStorage(STORAGE_KEYS.card_types, getDefaultData('card_types'))
  }
  
  // Initialize empty arrays for products and orders
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    saveToStorage(STORAGE_KEYS.products, [])
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    saveToStorage(STORAGE_KEYS.orders, [])
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          bottle_size: string
          bottle_price: number
          category: string
          stock: number
          variants: any[]
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bottle_size: string
          bottle_price: number
          category: string
          stock: number
          variants: any[]
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bottle_size?: string
          bottle_price?: number
          category?: string
          stock?: number
          variants?: any[]
          image?: string | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          items: any[]
          total: number
          customer_name: string
          date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          items: any[]
          total: number
          customer_name: string
          date: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          items?: any[]
          total?: number
          customer_name?: string
          date?: string
          status?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          updated_at?: string
        }
      }
      card_types: {
        Row: {
          id: string
          label: string
          quantity: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          quantity: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          quantity?: number
          is_default?: boolean
          updated_at?: string
        }
      }
    }
  }
}

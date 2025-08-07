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

// Mock Supabase client for development
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      order: (column: string, options?: any) => ({
        then: (callback: (result: any) => void) => {
          // Return mock data based on table
          const mockData = getMockData(table)
          callback({ data: mockData, error: null })
          return Promise.resolve({ data: mockData, error: null })
        }
      }),
      single: () => ({
        then: (callback: (result: any) => void) => {
          const mockData = getMockData(table)[0] || null
          callback({ data: mockData, error: null })
          return Promise.resolve({ data: mockData, error: null })
        }
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => ({
          then: (callback: (result: any) => void) => {
            const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }
            callback({ data: newItem, error: null })
            return Promise.resolve({ data: newItem, error: null })
          }
        })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: (result: any) => void) => {
          callback({ data: null, error: null })
          return Promise.resolve({ data: null, error: null })
        }
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: (callback: (result: any) => void) => {
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

// Mock data for development - Empty arrays as requested
function getMockData(table: string) {
  switch (table) {
    case 'categories':
      return [
        { id: 'small', name: 'Small', description: 'Small sized water bottles', is_default: true, created_at: '2024-01-01T00:00:00Z' },
        { id: 'medium', name: 'Medium', description: 'Medium sized water bottles', is_default: true, created_at: '2024-01-01T00:00:00Z' },
        { id: 'large', name: 'Large', description: 'Large sized water bottles', is_default: true, created_at: '2024-01-01T00:00:00Z' }
      ]
    case 'card_types':
      return [
        { id: '100', label: '100-pack', quantity: 100, is_default: true, created_at: '2024-01-01T00:00:00Z' },
        { id: '200', label: '200-pack', quantity: 200, is_default: true, created_at: '2024-01-01T00:00:00Z' },
        { id: '400', label: '400-pack', quantity: 400, is_default: true, created_at: '2024-01-01T00:00:00Z' },
        { id: '500', label: '500-pack', quantity: 500, is_default: true, created_at: '2024-01-01T00:00:00Z' }
      ]
    case 'products':
      // Return empty array - no pre-populated products
      return []
    case 'orders':
      // Return empty array - no pre-populated orders
      return []
    default:
      return []
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

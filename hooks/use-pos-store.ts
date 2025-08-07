"use client"

import { create } from 'zustand'
import { getSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase'
import { useEffect } from 'react'

export interface ProductVariant {
  id: string
  cardType: string
  quantity: number
  totalPrice: number
}

export interface Product {
  id: string
  name: string
  bottleSize: string
  bottlePrice: number
  category: string
  variants: ProductVariant[]
  stock: number
  image?: string
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  name: string
  bottleSize: string
  cardType: string
  quantity: number
  bottlesPerCard: number
  pricePerCard: number
  totalPrice: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  customerName: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
}

interface POSStore {
  products: Product[]
  cart: CartItem[]
  orders: Order[]
  loading: boolean
  error: string | null
  
  // Product methods
  fetchProducts: () => Promise<void>
  addProduct: (product: Product) => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  
  // Stock tracking methods
  updateStock: (productId: string, quantity: number) => Promise<void>
  checkStockAvailability: (productId: string, variantId: string, requestedQuantity: number) => boolean
  
  // Order methods
  fetchOrders: () => Promise<void>
  checkout: (customerName: string) => Promise<void>
  deleteOrder: (orderId: string) => Promise<void>
  
  // Cart methods (local only)
  addToCart: (product: Product, variant: ProductVariant) => void
  removeFromCart: (cartItemId: string) => void
  updateCartQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  
  // Subscription methods
  subscribeToChanges: () => () => void
}

export const usePOSStore = create<POSStore>((set, get) => ({
  products: [],
  cart: [],
  orders: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      const products = data.map(item => ({
        id: item.id,
        name: item.name,
        bottleSize: item.bottle_size,
        bottlePrice: item.bottle_price,
        category: item.category,
        variants: item.variants || [],
        stock: item.stock,
        image: item.image || undefined
      }))

      set({ products, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addProduct: async (product) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('products')
        .insert({
          id: product.id,
          name: product.name,
          bottle_size: product.bottleSize,
          bottle_price: product.bottlePrice,
          category: product.category,
          variants: product.variants,
          stock: product.stock,
          image: product.image || null
        })
        .select()
        .single()

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          products: [...state.products, product]
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          bottle_size: updates.bottleSize,
          bottle_price: updates.bottlePrice,
          category: updates.category,
          variants: updates.variants,
          stock: updates.stock,
          image: updates.image || null
        })
        .eq('id', id)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteProduct: async (id) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          products: state.products.filter(p => p.id !== id)
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  // Stock tracking methods
  updateStock: async (productId, quantity) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('products')
        .update({ stock: quantity })
        .eq('id', productId)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          products: state.products.map(p => 
            p.id === productId ? { ...p, stock: quantity } : p
          )
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  checkStockAvailability: (productId, variantId, requestedQuantity) => {
    const { products } = get()
    const product = products.find(p => p.id === productId)
    if (!product) return false
    
    const variant = product.variants.find(v => v.id === variantId)
    if (!variant) return false
    
    // Calculate total bottles needed
    const totalBottlesNeeded = requestedQuantity * variant.quantity
    return product.stock >= totalBottlesNeeded
  },

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const orders = data.map(item => ({
        id: item.id,
        items: item.items || [],
        total: item.total,
        customerName: item.customer_name,
        date: item.date,
        status: item.status as 'completed' | 'pending' | 'cancelled'
      }))

      set({ orders, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  checkout: async (customerName) => {
    try {
      const { cart, products } = get()
      const total = get().getCartTotal()
      
      // Check stock availability for all items
      for (const item of cart) {
        const isAvailable = get().checkStockAvailability(item.productId, item.variantId, item.quantity)
        if (!isAvailable) {
          throw new Error(`Insufficient stock for ${item.name}`)
        }
      }
      
      const orderData = {
        items: cart,
        total,
        customer_name: customerName,
        date: new Date().toISOString(),
        status: 'completed'
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error

      // Update stock for each item
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          const newStock = product.stock - (item.quantity * item.bottlesPerCard)
          await get().updateStock(item.productId, Math.max(0, newStock))
        }
      }

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        const newOrder: Order = {
          id: Date.now().toString(),
          items: cart,
          total,
          customerName,
          date: new Date().toISOString(),
          status: 'completed'
        }
        set(state => ({
          orders: [newOrder, ...state.orders]
        }))
      }

      // Clear cart after successful checkout
      set({ cart: [] })
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          orders: state.orders.filter(o => o.id !== orderId)
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  // Cart methods (local only - no need to sync cart across users)
  addToCart: (product, variant) =>
    set((state) => {
      const cartItemId = `${product.id}-${variant.id}`
      const existingItem = state.cart.find((item) => item.id === cartItemId)
      
      // Check stock availability
      const requestedQuantity = existingItem ? existingItem.quantity + 1 : 1
      const isAvailable = get().checkStockAvailability(product.id, variant.id, requestedQuantity)
      
      if (!isAvailable) {
        throw new Error(`Insufficient stock for ${product.name}`)
      }
      
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.pricePerCard }
              : item
          ),
        }
      }
      
      const newCartItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        variantId: variant.id,
        name: `${product.name} - ${product.bottleSize}`,
        bottleSize: product.bottleSize,
        cardType: variant.cardType,
        quantity: 1,
        bottlesPerCard: variant.quantity,
        pricePerCard: variant.totalPrice,
        totalPrice: variant.totalPrice
      }
      
      return {
        cart: [...state.cart, newCartItem],
      }
    }),

  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId),
    })),

  updateCartQuantity: (cartItemId, quantity) =>
    set((state) => {
      const item = state.cart.find((i) => i.id === cartItemId)
      if (item) {
        // Check stock availability
        const isAvailable = get().checkStockAvailability(item.productId, item.variantId, quantity)
        if (!isAvailable) {
          throw new Error(`Insufficient stock for ${item.name}`)
        }
        
        return {
          cart: state.cart.map((i) =>
            i.id === cartItemId
              ? { ...i, quantity, totalPrice: quantity * item.pricePerCard }
              : i
          ),
        }
      }
      return { cart: state.cart }
    }),

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    const { cart } = get()
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  },

  subscribeToChanges: () => {
    if (!hasSupabaseCredentials) {
      return () => {} // No-op for mock mode
    }

    const supabase = getSupabaseClient()
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        () => {
          get().fetchProducts()
        }
      )
      .subscribe()

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          get().fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(productsChannel)
      supabase.removeChannel(ordersChannel)
    }
  }
}))

// Hook to initialize and subscribe to changes
export const usePOSSync = () => {
  const store = usePOSStore()

  useEffect(() => {
    // Initial fetch
    store.fetchProducts()
    store.fetchOrders()

    // Subscribe to real-time changes only if using real Supabase
    if (hasSupabaseCredentials) {
      const unsubscribe = store.subscribeToChanges()
      return unsubscribe
    }
  }, [])

  return store
}

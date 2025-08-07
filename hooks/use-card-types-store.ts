"use client"

import { create } from 'zustand'
import { getSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase'
import { useEffect } from 'react'

export interface CardType {
  id: string
  label: string
  quantity: number
  createdAt: string
  isDefault: boolean
}

interface CardTypesStore {
  cardTypes: CardType[]
  loading: boolean
  error: string | null
  fetchCardTypes: () => Promise<void>
  addCardType: (cardType: Omit<CardType, 'id' | 'createdAt'>) => Promise<void>
  updateCardType: (id: string, updates: Partial<CardType>) => Promise<void>
  deleteCardType: (id: string) => Promise<void>
  getCardTypeById: (id: string) => CardType | undefined
  subscribeToChanges: () => () => void
}

export const useCardTypesStore = create<CardTypesStore>((set, get) => ({
  cardTypes: [],
  loading: false,
  error: null,

  fetchCardTypes: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('card_types')
        .select('*')
        .order('quantity', { ascending: true })

      if (error) throw error

      const cardTypes = data.map(item => ({
        id: item.id,
        label: item.label,
        quantity: item.quantity,
        createdAt: item.created_at,
        isDefault: item.is_default
      }))

      set({ cardTypes, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addCardType: async (cardTypeData) => {
    try {
      // Check if quantity already exists
      const existing = get().cardTypes.find(ct => ct.quantity === cardTypeData.quantity)
      if (existing) {
        throw new Error(`A card type with ${cardTypeData.quantity} bottles already exists`)
      }

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('card_types')
        .insert({
          label: cardTypeData.label,
          quantity: cardTypeData.quantity,
          is_default: cardTypeData.isDefault
        })
        .select()
        .single()

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        const newCardType = {
          id: Date.now().toString(),
          label: cardTypeData.label,
          quantity: cardTypeData.quantity,
          createdAt: new Date().toISOString(),
          isDefault: cardTypeData.isDefault
        }
        set(state => ({
          cardTypes: [...state.cardTypes, newCardType].sort((a, b) => a.quantity - b.quantity)
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateCardType: async (id, updates) => {
    try {
      // Check for duplicate quantities if updating quantity
      if (updates.quantity) {
        const existing = get().cardTypes.find(ct => ct.quantity === updates.quantity && ct.id !== id)
        if (existing) {
          throw new Error(`A card type with ${updates.quantity} bottles already exists`)
        }
      }

      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('card_types')
        .update({
          label: updates.label,
          quantity: updates.quantity,
          is_default: updates.isDefault
        })
        .eq('id', id)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          cardTypes: state.cardTypes.map(ct => 
            ct.id === id ? { ...ct, ...updates } : ct
          ).sort((a, b) => a.quantity - b.quantity)
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteCardType: async (id) => {
    try {
      const cardType = get().cardTypes.find(ct => ct.id === id)
      if (cardType?.isDefault) {
        throw new Error('Cannot delete default card types')
      }

      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('card_types')
        .delete()
        .eq('id', id)

      if (error) throw error

      // If not using real Supabase, manually update the store
      if (!hasSupabaseCredentials) {
        set(state => ({
          cardTypes: state.cardTypes.filter(ct => ct.id !== id)
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  getCardTypeById: (id) => {
    const { cardTypes } = get()
    return cardTypes.find(cardType => cardType.id === id)
  },

  subscribeToChanges: () => {
    if (!hasSupabaseCredentials) {
      return () => {} // No-op for mock mode
    }

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('card-types-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'card_types' },
        () => {
          get().fetchCardTypes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))

// Hook to initialize and subscribe to changes
export const useCardTypesSync = () => {
  const store = useCardTypesStore()

  useEffect(() => {
    // Initial fetch
    store.fetchCardTypes()

    // Subscribe to real-time changes only if using real Supabase
    if (hasSupabaseCredentials) {
      const unsubscribe = store.subscribeToChanges()
      return unsubscribe
    }
  }, [])

  return store
}

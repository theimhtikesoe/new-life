"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCardTypesStore, type CardType } from "@/hooks/use-card-types-store"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

interface CardTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardType?: CardType | null
}

export function CardTypeDialog({ open, onOpenChange, cardType }: CardTypeDialogProps) {
  const { addCardType, updateCardType, loading } = useCardTypesStore()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    quantity: "",
    label: "",
  })

  useEffect(() => {
    if (cardType) {
      setFormData({
        quantity: cardType.quantity.toString(),
        label: cardType.label,
      })
    } else {
      setFormData({
        quantity: "",
        label: "",
      })
    }
  }, [cardType, open])

  // Auto-generate label when quantity changes
  useEffect(() => {
    if (!cardType && formData.quantity) {
      const quantity = parseInt(formData.quantity)
      if (quantity > 0) {
        setFormData(prev => ({
          ...prev,
          label: `${quantity}-pack`
        }))
      }
    }
  }, [formData.quantity, cardType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const quantity = parseInt(formData.quantity)
    
    if (!quantity || quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive"
      })
      return
    }

    if (!formData.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a label for the card type",
        variant: "destructive"
      })
      return
    }

    try {
      if (cardType) {
        await updateCardType(cardType.id, {
          quantity,
          label: formData.label.trim(),
        })
        toast({
          title: "Card Type Updated",
          description: `${formData.label} has been updated successfully`,
        })
      } else {
        await addCardType({
          quantity,
          label: formData.label.trim(),
          isDefault: false,
        })
        toast({
          title: "Card Type Added",
          description: `${formData.label} has been added successfully`,
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{cardType ? "Edit Card Type" : "Add New Card Type"}</DialogTitle>
          <DialogDescription>
            {cardType ? "Update the card type information below." : "Enter the details for the new card type."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="col-span-3"
                placeholder="Enter number of bottles"
                min="1"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label *
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="col-span-3"
                placeholder="e.g., 300-pack"
                disabled={loading}
              />
            </div>
            <div className="text-sm text-muted-foreground px-4">
              <p>The label will be displayed in product selection. It's automatically generated based on quantity but can be customized.</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cardType ? "Update" : "Add"} Card Type
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

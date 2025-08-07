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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePOSStore, type Product } from "@/hooks/use-pos-store"
import { useCategoriesSync } from "@/hooks/use-categories-store"
import { useCardTypesSync } from "@/hooks/use-card-types-store"
import { useToast } from "@/hooks/use-toast"
import { formatMMK } from "@/utils/format"
import { Plus, X, Check, Edit, Trash2, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { addProduct, updateProduct, loading } = usePOSStore()
  const { categories } = useCategoriesSync()
  const { cardTypes, addCardType, updateCardType, deleteCardType } = useCardTypesSync()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    bottleSize: "",
    bottlePrice: "",
    category: "Small",
    stock: "",
    variants: [] as { cardType: string; quantity: number; totalPrice: number }[]
  })

  const [selectedCardTypes, setSelectedCardTypes] = useState<string[]>([])
  const [showAddCardType, setShowAddCardType] = useState(false)
  const [editingCardType, setEditingCardType] = useState<string | null>(null)
  const [newCardType, setNewCardType] = useState({
    quantity: "",
    label: ""
  })

  const calculateVariants = () => {
    const bottlePrice = parseFloat(formData.bottlePrice) || 0
    return selectedCardTypes.map(cardTypeId => {
      const cardType = cardTypes.find(ct => ct.id === cardTypeId)
      return {
        cardType: cardType?.label || '',
        quantity: cardType?.quantity || 0,
        totalPrice: bottlePrice * (cardType?.quantity || 0)
      }
    })
  }

  // Auto-generate label when quantity changes for new card type
  useEffect(() => {
    if (newCardType.quantity && !editingCardType) {
      const quantity = parseInt(newCardType.quantity)
      if (quantity > 0) {
        setNewCardType(prev => ({
          ...prev,
          label: `${quantity}-pack`
        }))
      }
    }
  }, [newCardType.quantity, editingCardType])

  const handleAddNewCardType = async () => {
    const quantity = parseInt(newCardType.quantity)
    
    if (!quantity || quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid number greater than 0",
        variant: "destructive"
      })
      return
    }

    if (!newCardType.label.trim()) {
      toast({
        title: "Invalid Label",
        description: "Please enter a label for the card type",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingCardType) {
        // Update existing card type
        await updateCardType(editingCardType, {
          quantity,
          label: newCardType.label.trim(),
        })
        
        toast({
          title: "Card Type Updated",
          description: `${newCardType.label} has been updated successfully`,
        })
      } else {
        // Add new card type
        await addCardType({
          quantity,
          label: newCardType.label.trim(),
          isDefault: false,
        })

        // Find the newly added card type and select it
        setTimeout(() => {
          const addedCardType = cardTypes.find(ct => ct.quantity === quantity && ct.label === newCardType.label.trim())
          if (addedCardType) {
            setSelectedCardTypes([...selectedCardTypes, addedCardType.id])
          }
        }, 100)

        toast({
          title: "Card Type Added",
          description: `${newCardType.label} has been added and selected`,
        })
      }

      // Reset form and hide
      setNewCardType({ quantity: "", label: "" })
      setShowAddCardType(false)
      setEditingCardType(null)
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const handleEditCardType = (cardType: any) => {
    setNewCardType({
      quantity: cardType.quantity.toString(),
      label: cardType.label
    })
    setEditingCardType(cardType.id)
    setShowAddCardType(true)
  }

  const handleDeleteCardType = async (cardType: any) => {
    if (cardType.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default card types cannot be deleted",
        variant: "destructive"
      })
      return
    }

    try {
      // Remove from selected if it was selected
      setSelectedCardTypes(selectedCardTypes.filter(id => id !== cardType.id))
      
      await deleteCardType(cardType.id)
      toast({
        title: "Card Type Deleted",
        description: `${cardType.label} has been deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const cancelAddCardType = () => {
    setNewCardType({ quantity: "", label: "" })
    setShowAddCardType(false)
    setEditingCardType(null)
  }

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        bottleSize: product.bottleSize || "",
        bottlePrice: product.bottlePrice ? product.bottlePrice.toString() : "",
        category: product.category,
        stock: product.stock.toString(),
        variants: product.variants || []
      })
      
      setSelectedCardTypes(product.variants?.map(variant => {
        const cardType = cardTypes.find(ct => ct.label === variant.cardType)
        return cardType?.id
      }).filter(Boolean) || [])
    } else {
      setFormData({
        name: "",
        bottleSize: "",
        bottlePrice: "",
        category: categories.length > 0 ? categories[0].name : "Small",
        stock: "",
        variants: []
      })
      setSelectedCardTypes([])
    }
    
    // Reset add card type form when dialog opens/closes
    setShowAddCardType(false)
    setNewCardType({ quantity: "", label: "" })
    setEditingCardType(null)
  }, [product, open, categories, cardTypes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.bottlePrice || !formData.stock || selectedCardTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and select at least one card type",
        variant: "destructive"
      })
      return
    }

    const productData = {
      name: formData.name,
      bottleSize: formData.bottleSize,
      bottlePrice: parseFloat(formData.bottlePrice),
      category: formData.category,
      stock: parseInt(formData.stock),
      variants: calculateVariants()
    }

    try {
      if (product) {
        await updateProduct(product.id, productData)
        toast({
          title: "Product Updated",
          description: `${productData.name} has been updated successfully`,
        })
      } else {
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData,
        }
        await addProduct(newProduct)
        toast({
          title: "Product Added",
          description: `${productData.name} has been added successfully`,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product information below." : "Enter the details for the new product."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter product name"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bottleSize" className="text-right">
                Bottle Size
              </Label>
              <Input
                id="bottleSize"
                placeholder="300ml"
                value={formData.bottleSize}
                onChange={(e) => setFormData({ ...formData, bottleSize: e.target.value })}
                className="col-span-3"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bottlePrice" className="text-right">
                Price per Bottle (MMK)
              </Label>
              <Input
                id="bottlePrice"
                type="number"
                placeholder="200"
                value={formData.bottlePrice}
                onChange={(e) => setFormData({ ...formData, bottlePrice: e.target.value })}
                className="col-span-3"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="col-span-3"
                placeholder="Enter stock quantity"
                disabled={loading}
              />
            </div>
            
            {/* Card Types Selection */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Card Types</Label>
              <div className="col-span-3 space-y-3">
                {/* Add New Card Type Section */}
                {!showAddCardType ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCardType(true)}
                    className="w-full"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Card Type
                  </Button>
                ) : (
                  <div className="border rounded-lg p-3 space-y-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {editingCardType ? "Edit Card Type" : "Create New Card Type"}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={cancelAddCardType}
                        className="h-6 w-6 p-0"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="newQuantity" className="text-xs">Quantity</Label>
                        <Input
                          id="newQuantity"
                          type="number"
                          placeholder="e.g., 300"
                          value={newCardType.quantity}
                          onChange={(e) => setNewCardType({ ...newCardType, quantity: e.target.value })}
                          className="h-8"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newLabel" className="text-xs">Label</Label>
                        <Input
                          id="newLabel"
                          placeholder="e.g., 300-pack"
                          value={newCardType.label}
                          onChange={(e) => setNewCardType({ ...newCardType, label: e.target.value })}
                          className="h-8"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddNewCardType}
                        disabled={!newCardType.quantity || !newCardType.label || loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        {editingCardType ? "Update" : "Add & Select"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelAddCardType}
                        className="flex-1"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Existing Card Types */}
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                  <Label className="text-xs text-muted-foreground">Select from existing card types:</Label>
                  {cardTypes.map(cardType => (
                    <div key={cardType.id} className="flex items-center space-x-2 group">
                      <input
                        type="checkbox"
                        id={cardType.id}
                        checked={selectedCardTypes.includes(cardType.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCardTypes([...selectedCardTypes, cardType.id])
                          } else {
                            setSelectedCardTypes(selectedCardTypes.filter(ct => ct !== cardType.id))
                          }
                        }}
                        className="shrink-0"
                        disabled={loading}
                      />
                      <label htmlFor={cardType.id} className="flex-1 text-sm cursor-pointer">
                        {cardType.label} ({cardType.quantity} bottles)
                        {!cardType.isDefault && (
                          <span className="ml-2 text-xs text-blue-600">(Custom)</span>
                        )}
                      </label>
                      
                      {/* Edit and Delete buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCardType(cardType)}
                          className="h-6 w-6 p-0"
                          title="Edit card type"
                          disabled={loading}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {!cardType.isDefault && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                title="Delete card type"
                                disabled={loading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Card Type</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{cardType.label}"? This action cannot be undone.
                                  Products using this card type will need to be updated.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCardType(cardType)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Price Preview */}
            {formData.bottlePrice && selectedCardTypes.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Price Preview</Label>
                <div className="col-span-3 space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2 bg-muted/30">
                  {calculateVariants().map((variant, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>{variant.cardType}:</span>
                      <span className="font-medium">{formatMMK(variant.totalPrice)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Total variants: {calculateVariants().length}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

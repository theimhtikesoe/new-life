"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Trash2, ShoppingCart, Search, Package } from 'lucide-react'
import { usePOSStore } from "@/hooks/use-pos-store"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMMK } from "@/utils/format"

export default function POSPage() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    checkout, 
    getCartTotal 
  } = usePOSStore()
  
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const categories = ["All", "Small", "Medium", "Large"]
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to cart before checkout",
        variant: "destructive"
      })
      return
    }
    
    if (!customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter customer name",
        variant: "destructive"
      })
      return
    }

    checkout(customerName)
    setCustomerName("")
    toast({
      title: "Order completed!",
      description: `Order for ${customerName} has been processed successfully`,
    })
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">POS Checkout</h1>
      </header>
      
      <div className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                        {product.stock}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.bottleSize} • {formatMMK(product.bottlePrice)}/bottle
                    </p>
                    
                    <div className="space-y-2">
                      <Select
                        value={selectedVariants[product.id] || ''}
                        onValueChange={(value) => setSelectedVariants({
                          ...selectedVariants,
                          [product.id]: value
                        })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map(variant => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.cardType} - {formatMMK(variant.totalPrice)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedVariants[product.id] && (
                        <div className="text-xs text-muted-foreground">
                          {(() => {
                            const variant = product.variants.find(v => v.id === selectedVariants[product.id])
                            return variant ? `${variant.quantity} bottles • ${formatMMK(variant.totalPrice)}` : ''
                          })()}
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          const variantId = selectedVariants[product.id]
                          const variant = product.variants.find(v => v.id === variantId)
                          if (variant) {
                            addToCart(product, variant)
                          } else {
                            toast({
                              title: "Please select a card type",
                              description: "Choose a card type before adding to cart",
                              variant: "destructive"
                            })
                          }
                        }}
                        disabled={product.stock === 0 || !selectedVariants[product.id]}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.cardType} • {item.bottlesPerCard} bottles
                            </p>
                            <p className="text-sm font-medium">
                              {formatMMK(item.pricePerCard)} per card
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatMMK(getCartTotal())}</span>
                      </div>
                      
                      <Input
                        placeholder="Customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearCart}
                          className="flex-1"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleCheckout}
                          className="flex-1"
                        >
                          Checkout
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}

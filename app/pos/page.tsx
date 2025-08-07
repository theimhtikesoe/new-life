"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ShoppingCart, Search, Package, AlertTriangle } from 'lucide-react'
import { usePOSSync } from "@/hooks/use-pos-store"
import { useToast } from "@/hooks/use-toast"
import { formatMMK } from "@/utils/format"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function POSPage() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    getCartTotal, 
    checkout,
    checkStockAvailability,
    loading 
  } = usePOSSync()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const categories = ["All", "Small", "Medium", "Large"]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (product, variant) => {
    try {
      // Check stock availability before adding
      const isAvailable = checkStockAvailability(product.id, variant.id, 1)
      if (!isAvailable) {
        toast({
          title: "Insufficient Stock",
          description: `Not enough stock available for ${product.name}`,
          variant: "destructive"
        })
        return
      }
      
      addToCart(product, variant)
      toast({
        title: "Added to Cart",
        description: `${product.name} - ${variant.cardType} added to cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeFromCart(cartItemId)
        return
      }
      updateCartQuantity(cartItemId, newQuantity)
    } catch (error) {
      toast({
        title: "Stock Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter a customer name",
        variant: "destructive"
      })
      return
    }

    try {
      await checkout(customerName)
      toast({
        title: "Checkout Successful",
        description: `Order completed for ${customerName}`,
      })
      setCustomerName("")
      setCheckoutDialogOpen(false)
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const getStockStatus = (product) => {
    if (product.stock <= 0) return { status: "Out of Stock", variant: "destructive" as const }
    if (product.stock <= 10) return { status: "Low Stock", variant: "secondary" as const }
    return { status: "In Stock", variant: "default" as const }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Point of Sale</h1>
      </header>
      
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Products</h2>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No products found</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  return (
                    <Card key={product.id} className={product.stock <= 0 ? "opacity-60" : ""}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {product.bottleSize} • {formatMMK(product.bottlePrice)}/bottle
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {product.variants.map((variant) => {
                          const isAvailable = checkStockAvailability(product.id, variant.id, 1)
                          return (
                            <div key={variant.id} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <span className="font-medium">{variant.cardType}</span>
                                <p className="text-sm text-muted-foreground">
                                  {variant.quantity} bottles • {formatMMK(variant.totalPrice)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(product, variant)}
                                disabled={!isAvailable || loading}
                              >
                                {!isAvailable && <AlertTriangle className="h-3 w-3 mr-1" />}
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )
                })
              )}
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
                  <p className="text-muted-foreground text-center py-4">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {item.cardType} • {formatMMK(item.pricePerCard)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatMMK(getCartTotal())}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={clearCart} className="flex-1">
                          Clear
                        </Button>
                        <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="flex-1" disabled={loading}>
                              Checkout
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Complete Order</DialogTitle>
                              <DialogDescription>
                                Enter customer information to complete the order.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input
                                  id="customerName"
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  placeholder="Enter customer name"
                                />
                              </div>
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center font-bold">
                                  <span>Total Amount:</span>
                                  <span>{formatMMK(getCartTotal())}</span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCheckout} disabled={loading}>
                                Complete Order
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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

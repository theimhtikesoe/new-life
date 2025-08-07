"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Package, Loader2, Lock } from 'lucide-react'
import { usePOSSync } from "@/hooks/use-pos-store"
import { useUserRole } from "@/hooks/use-user-role"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { ProductDialog } from "@/components/product-dialog"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatMMK } from "@/utils/format"

export default function ProductsPage() {
  const { products, deleteProduct, loading, error } = usePOSSync()
  const { role } = useUserRole()
  const { isAuthenticated, logout } = useAdminAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [pendingAction, setPendingAction] = useState<'add' | 'edit' | null>(null)

  const categories = ["All", "Small", "Medium", "Large"]
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const requireAuth = (action: 'add' | 'edit', product?: any) => {
    if (role !== "admin") return
    
    if (isAuthenticated) {
      if (action === 'add') {
        handleAdd()
      } else if (action === 'edit') {
        handleEdit(product)
      }
    } else {
      setPendingAction(action)
      setEditingProduct(product)
      setAuthDialogOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    if (pendingAction === 'add') {
      handleAdd()
    } else if (pendingAction === 'edit') {
      handleEdit(editingProduct)
    }
    setPendingAction(null)
    setEditingProduct(null)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleDelete = async (product) => {
    if (role !== "admin" || !isAuthenticated) {
      requireAuth('edit', product)
      return
    }
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id)
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const canEdit = role === "admin"

  if (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Products</h1>
        </header>
        <div className="flex-1 p-4">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading products: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Products</h1>
        {canEdit && isAuthenticated && (
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-green-600">
              <Lock className="h-3 w-3 mr-1" />
              Admin Authenticated
            </Badge>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </header>
      
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          {canEdit && (
            <Button onClick={() => requireAuth('add')} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              {!isAuthenticated && <Lock className="mr-2 h-4 w-4" />}
              Add Product
            </Button>
          )}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Inventory ({filteredProducts.length})
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && products.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No products found</p>
                {canEdit && (
                  <Button 
                    onClick={() => requireAuth('add')} 
                    className="mt-4"
                    disabled={loading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    {canEdit && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.bottleSize} • {formatMMK(product.bottlePrice)}/bottle
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.variants.map(variant => (
                            <div key={variant.id} className="text-sm">
                              {variant.cardType}: {formatMMK(variant.totalPrice)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                          {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requireAuth('edit', product)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                              {!isAuthenticated && <Lock className="ml-1 h-3 w-3" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
        />

        <AdminAuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </SidebarInset>
  )
}

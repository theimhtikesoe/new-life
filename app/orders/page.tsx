"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Download, Eye, Trash2, Lock, AlertTriangle } from 'lucide-react'
import { usePOSSync } from "@/hooks/use-pos-store"
import { useUserRole } from "@/hooks/use-user-role"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatMMK } from "@/utils/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function OrdersPage() {
  const { orders, deleteOrder, loading } = usePOSSync()
  const { role } = useUserRole()
  const { isAuthenticated, logout } = useAdminAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState<string | null>(null)

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.includes(searchTerm)
  )

  const exportToCSV = () => {
    const csvContent = [
      ["Order ID", "Customer", "Items", "Total", "Status", "Date"],
      ...filteredOrders.map(order => [
        order.id,
        order.customerName,
        order.items.length,
        order.total.toFixed(2),
        order.status,
        new Date(order.date).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    a.click()
  }

  const requireAuth = (orderId: string) => {
    if (role !== "admin") return
    
    if (isAuthenticated) {
      handleDeleteOrder(orderId)
    } else {
      setPendingDeleteOrder(orderId)
      setAuthDialogOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    if (pendingDeleteOrder) {
      handleDeleteOrder(pendingDeleteOrder)
      setPendingDeleteOrder(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId)
      toast({
        title: "Order Deleted",
        description: "The order has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
  }

  const canDelete = role === "admin"

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Orders</h1>
        {canDelete && isAuthenticated && (
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
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order History ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{formatMMK(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details - #{order.id.slice(-6)}</DialogTitle>
                                <DialogDescription>
                                  Order placed on {new Date(order.date).toLocaleDateString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Customer Information</h4>
                                  <p>{order.customerName}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Items Ordered</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <div>
                                              <div>{item.name}</div>
                                              <div className="text-sm text-muted-foreground">
                                                {item.cardType} • {item.bottlesPerCard} bottles
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{formatMMK(item.pricePerCard)}</TableCell>
                                          <TableCell>{formatMMK(item.totalPrice)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t">
                                  <span className="font-semibold">Total Amount:</span>
                                  <span className="text-lg font-bold">{formatMMK(order.total)}</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {!isAuthenticated && <Lock className="ml-1 h-3 w-3" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Delete Order
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete order #{order.id.slice(-6)} for {order.customerName}? 
                                    This action cannot be undone and will permanently remove the order from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => requireAuth(order.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AdminAuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </SidebarInset>
  )
}

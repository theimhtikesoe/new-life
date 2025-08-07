"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Package, Loader2 } from 'lucide-react'
import { useCardTypesSync } from "@/hooks/use-card-types-store"
import { CardTypeDialog } from "@/components/card-type-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export function CardTypesManagement() {
  const { cardTypes, loading, error, deleteCardType } = useCardTypesSync()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCardType, setEditingCardType] = useState(null)

  const filteredCardTypes = cardTypes.filter(cardType =>
    cardType.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cardType.quantity.toString().includes(searchTerm)
  )

  const handleEdit = (cardType) => {
    setEditingCardType(cardType)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCardType(null)
    setDialogOpen(true)
  }

  const handleDelete = async (cardType) => {
    if (cardType.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default card types cannot be deleted",
        variant: "destructive"
      })
      return
    }

    try {
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

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading card types: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Card Type Management</h3>
        <Button onClick={handleAdd} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Card Type
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search card types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Card Types ({filteredCardTypes.length})
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && cardTypes.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading card types...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCardTypes.map((cardType) => (
                  <TableRow key={cardType.id}>
                    <TableCell className="font-medium">{cardType.label}</TableCell>
                    <TableCell>{cardType.quantity} bottles</TableCell>
                    <TableCell>
                      <Badge variant={cardType.isDefault ? "default" : "secondary"}>
                        {cardType.isDefault ? "Default" : "Custom"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(cardType.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cardType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!cardType.isDefault && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
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
                                  onClick={() => handleDelete(cardType)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
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

      <CardTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cardType={editingCardType}
      />
    </div>
  )
}

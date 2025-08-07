"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Store, Bell, Shield, Globe, Database, Tag, Lock } from 'lucide-react'
import { CategoriesManagement } from "@/components/categories-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CardTypesManagement } from "@/components/card-types-management"
import { useUserRole } from "@/hooks/use-user-role"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { AdminAuthDialog } from "@/components/admin-auth-dialog"

export default function SettingsPage() {
  const { role } = useUserRole()
  const { isAuthenticated, logout } = useAdminAuth()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  const requireAuth = (tab: string) => {
    if (role !== "admin") return
    
    if (isAuthenticated) {
      setActiveTab(tab)
    } else {
      setPendingTab(tab)
      setAuthDialogOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    if (pendingTab) {
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
  }

  const canAccess = role === "admin"

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Settings</h1>
        {canAccess && isAuthenticated && (
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
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>

        {!canAccess ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground text-center">
                Settings can only be accessed by administrators. Please switch to admin role to continue.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => {
            if (value === "categories" || value === "cardtypes") {
              requireAuth(value)
            } else {
              setActiveTab(value)
            }
          }} className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                Categories
                {!isAuthenticated && <Lock className="h-3 w-3" />}
              </TabsTrigger>
              <TabsTrigger value="cardtypes" className="flex items-center gap-2">
                Card Types
                {!isAuthenticated && <Lock className="h-3 w-3" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input id="store-name" defaultValue="New Life Store" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-phone">Phone Number</Label>
                      <Input id="store-phone" defaultValue="+95 9 123 456 789" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Address</Label>
                    <Input id="store-address" defaultValue="Yangon, Myanmar" />
                  </div>
                  <Button>Save Store Information</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Localization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Default Language</Label>
                      <p className="text-sm text-muted-foreground">
                        Set the default language for the POS system
                      </p>
                    </div>
                    <Button variant="outline">
                      English (US)
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Myanmar Language Support</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable Myanmar language toggle (မြန်မာ)
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Currency Format</Label>
                      <p className="text-sm text-muted-foreground">
                        Display format for prices
                      </p>
                    </div>
                    <Button variant="outline">
                      MMK (Ks)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when products are running low
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Sales Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily sales summary
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Sync Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications when data syncs across devices
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admin Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require password for admin operations
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-logout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically logout after inactivity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" type="number" defaultValue="30" className="w-32" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data & Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Data Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable real-time synchronization across all devices
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup data daily
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Export Data</Button>
                    <Button variant="outline">Import Data</Button>
                    <Button variant="outline">Reset System</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              {isAuthenticated ? (
                <CategoriesManagement />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Please authenticate to access category management.
                    </p>
                    <Button onClick={() => requireAuth("categories")}>
                      <Lock className="mr-2 h-4 w-4" />
                      Authenticate
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="cardtypes" className="space-y-4">
              {isAuthenticated ? (
                <CardTypesManagement />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Please authenticate to access card type management.
                    </p>
                    <Button onClick={() => requireAuth("cardtypes")}>
                      <Lock className="mr-2 h-4 w-4" />
                      Authenticate
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        <AdminAuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </SidebarInset>
  )
}

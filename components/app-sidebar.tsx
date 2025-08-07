"use client"

import * as React from "react"
import { BarChart3, Home, Package, ShoppingCart, Users, FileText, Settings, Store, Globe, LogOut } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUserRole } from "@/hooks/use-user-role"
import { useAdminAuth } from "@/hooks/use-admin-auth"

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["admin", "cashier", "viewer"]
  },
  {
    title: "POS Checkout",
    url: "/pos",
    icon: ShoppingCart,
    roles: ["admin", "cashier"]
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    roles: ["admin", "viewer"]
  },
  {
    title: "Orders",
    url: "/orders",
    icon: FileText,
    roles: ["admin", "cashier", "viewer"]
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    roles: ["admin", "viewer"]
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    roles: ["admin"]
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["admin"]
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { role, setRole } = useUserRole()
  const { isAuthenticated, logout } = useAdminAuth()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(role)
  )

  const handleRoleChange = (newRole: "admin" | "cashier") => {
    if (newRole !== role) {
      // Logout admin when switching roles
      if (isAuthenticated) {
        logout()
      }
      setRole(newRole)
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">New Life POS</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Smart Retail System
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-3 p-2">
              {/* Role and Auth Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Role:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {role}
                  </Badge>
                  {role === "admin" && isAuthenticated && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Role Switcher */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={role === "admin" ? "default" : "outline"}
                  onClick={() => handleRoleChange("admin")}
                  className="flex-1 text-xs"
                >
                  Admin
                </Button>
                <Button
                  size="sm"
                  variant={role === "cashier" ? "default" : "outline"}
                  onClick={() => handleRoleChange("cashier")}
                  className="flex-1 text-xs"
                >
                  Cashier
                </Button>
              </div>

              {/* Admin Logout */}
              {role === "admin" && isAuthenticated && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start text-xs text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-3 w-3" />
                  Logout Admin
                </Button>
              )}
              
              {/* Language Toggle */}
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start text-xs"
              >
                <Globe className="mr-2 h-3 w-3" />
                English
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}

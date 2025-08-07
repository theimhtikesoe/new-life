"use client"

import * as React from "react"
import { BarChart3, Home, Package, ShoppingCart, Users, FileText, Settings, Store, Globe } from 'lucide-react'

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

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(role)
  )

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
            <div className="flex flex-col gap-2 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Role:</span>
                <Badge variant="outline" className="text-xs">
                  {role}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={role === "admin" ? "default" : "outline"}
                  onClick={() => setRole("admin")}
                  className="flex-1 text-xs"
                >
                  Admin
                </Button>
                <Button
                  size="sm"
                  variant={role === "cashier" ? "default" : "outline"}
                  onClick={() => setRole("cashier")}
                  className="flex-1 text-xs"
                >
                  Cashier
                </Button>
              </div>
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

"use client"

import {
  BarChart3,
  FileText,
  Users,
  Settings,
  Shield,
  User,
  Clock,
  CheckCircle,
  UserPlus,
  MessageSquare,

} from "lucide-react"
import Link from "next/link"

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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Navigation items for agents
const navigationItems = [
  {
    title: "Dashboard",
    url: "/agent",
    icon: BarChart3,
  },
  {
    title: "Pending Claims",
    url: "/agent/pending",
    icon: Clock,
    badge: "3",
  },
  {
    title: "All Claims",
    url: "/agent/claims",
    icon: FileText,
  },
  {
    title: "Processed Claims",
    url: "/agent/processed",
    icon: CheckCircle,
  },
]

const userManagementItems = [
  {
    title: "Profile",
    url: "/agent/profile",
    icon: User,
  },

]



export function AgentSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">SecureGuard</h2>
            <p className="text-xs text-muted-foreground">Agent Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Claims Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4 mr-2" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>User Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />

      </SidebarContent>
    </Sidebar>
  )
}

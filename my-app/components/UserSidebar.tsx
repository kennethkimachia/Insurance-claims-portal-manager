"use client"

import { FileText, HelpCircle, MessageCircle, Shield, User } from "lucide-react"
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

// Navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Shield,
  },
  {
    title: "All Claims",
    url: "/all-claims",
    icon: FileText,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: HelpCircle,
  },
  {
    title: "Contact Us",
    url: "/contact-us",
    icon: MessageCircle,
  },
]

export function UserSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">SecureGuard</h2>
            <p className="text-xs text-muted-foreground">Insurance Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                New Claim
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">

      </SidebarFooter>
    </Sidebar>
  )
}

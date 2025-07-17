import type React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AgentSidebar } from "@/components/AgentSidebar"
import Navbar from "@/components/Navbar"


export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AgentSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Insurance Claims Management</span>
          </div>
          <div>
            <Navbar />
          </div>
          
        </header>
                  {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

import {UserSidebar} from "@/components/UserSidebar";
import { SidebarProvider, SidebarTrigger,SidebarInset, } from "@/components/ui/sidebar"
import Navbar from "@/components/Navbar";



export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>User Portal - Insurance Claims Management</span>
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

import UserSidebar from "@/components/UserSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Navbar from "@/components/Navbar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SidebarProvider>
        <UserSidebar />
                <SidebarTrigger />

        <main className="w-full">
          <Navbar />


        <div>
          {children}

        </div>
        
      </main>

      </SidebarProvider>
        


        
    </>
  )
}

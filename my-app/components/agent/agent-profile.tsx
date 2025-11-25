import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Mail, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default async function AgentProfilePage() {
  const user = await currentUser();
  const { userId: clerkId } = await auth();

  if (!clerkId || !user) redirect("/sign-in");

  // Fetch Agent data + count of claims processed by this agent
  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    include: {
        processedClaims: {
            select: { status: true }
        }
    }
  });

  if (!dbUser || (dbUser.role !== "AGENT" && dbUser.role !== "ADMIN")) {
      return <div>Unauthorized.</div>;
  }

  const processedCount = dbUser.processedClaims.length;
  const approvedCount = dbUser.processedClaims.filter(c => c.status === "APPROVED").length;
  const rejectedCount = dbUser.processedClaims.filter(c => c.status === "REJECTED").length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Agent Profile</h1>
      
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
            <AvatarFallback className="text-2xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <Badge className="bg-blue-600 hover:bg-blue-700 uppercase text-[10px] tracking-wider">
                    {dbUser.role}
                </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>Claims Department</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Processed</CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{processedCount}</div>
                <p className="text-xs text-muted-foreground">Lifetime claims handled</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Claims approved</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                <Clock className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{rejectedCount}</div>
                <p className="text-xs text-muted-foreground">Claims rejected</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
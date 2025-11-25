import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Car, Home, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function UserProfilePage() {
  const user = await currentUser();
  const { userId: clerkId } = await auth();

  if (!clerkId || !user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      policies: true,
      _count: {
        select: { claims: true }
      }
    }
  });

  if (!dbUser) return <div>User not found in database.</div>;

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
            <AvatarFallback className="text-2xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">Policyholder</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.primaryEmailAddress?.emailAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(dbUser.createdAt), "MMMM yyyy")}</span>
            </div>
          </div>

          <div className="flex gap-4 text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-border">
             <div>
                <p className="text-2xl font-bold">{dbUser.policies.length}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Policies</p>
             </div>
             <div>
                <p className="text-2xl font-bold">{dbUser._count.claims}</p>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Claims</p>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Grid */}
      <div className="grid gap-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Active Policies
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dbUser.policies.map((policy) => (
                <Card key={policy.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${policy.type === 'MOTOR' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <Badge variant="outline" className="mb-2 w-fit">
                                {policy.type} INSURANCE
                            </Badge>
                            {policy.type === 'MOTOR' ? <Car className="w-5 h-5 text-blue-500" /> : <Home className="w-5 h-5 text-orange-500" />}
                        </div>
                        <CardTitle className="text-lg tracking-tight">{policy.policy_number}</CardTitle>
                        <CardDescription>Valid until {format(new Date(policy.end_date), "MMM d, yyyy")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex justify-between items-center mt-2 pt-2 border-t">
                             <span>Status</span>
                             <span className="text-green-600 font-medium flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-green-600 inline-block" />
                                Active
                             </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
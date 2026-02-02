import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClaimActionCell } from "@/components/agent/claim-action-cell";
import { AgentProgressManager } from "@/components/agent/agent-progress-manager"; // Imported the new component
import { format } from "date-fns";

// Helper for status badges
function getStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>
      );
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    case "CLOSED":
      return <Badge variant="outline">Closed</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

export default async function AgentDashboard() {
  // 1. Fetch Pending Claims
  const pendingClaims = await prisma.claim.findMany({
    where: { status: "PENDING" },
    include: {
      policy: true,
      motor_claim: true,
      burglary_claim: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch Processed Claims (Approved or Rejected)
  const processedClaims = await prisma.claim.findMany({
    where: {
      status: {
        in: ["APPROVED", "REJECTED", "CLOSED"],
      },
    },
    include: {
      policy: true,
      motor_claim: true,
      burglary_claim: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10, // Limit to recent 10
  });

  // 3. Fetch Users
  const usersRaw = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      _count: {
        select: { policies: true },
      },
      policies: {
        select: {
          _count: {
            select: { claims: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total claims per user in Javascript
  const users = usersRaw.map((user) => ({
    ...user,
    totalClaims: user.policies.reduce(
      (sum, policy) => sum + policy._count.claims,
      0,
    ),
  }));

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and process insurance claims
          </p>
        </div>
        <Link href="/dashboard/agent/create-user">
          <Button size="lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User Account
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Claims
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClaims.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processed Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedClaims.length}</div>
            <p className="text-xs text-muted-foreground">All time processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Total registered policyholders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Motor vs Burglary
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              M: {pendingClaims.filter((c) => c.claim_type === "MOTOR").length}{" "}
              | B:{" "}
              {pendingClaims.filter((c) => c.claim_type === "BURGLARY").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending Breakdown</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Claims Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          {/* PENDING CLAIMS TABLE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Claims Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Policy Holder</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Amount Est.</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingClaims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No pending claims found.
                      </TableCell>
                    </TableRow>
                  )}
                  {pendingClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">#{claim.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{claim.claimant_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.policy.policy_number}
                        </div>
                      </TableCell>
                      <TableCell>{claim.claim_type}</TableCell>
                      <TableCell>
                        {format(claim.createdAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        $
                        {claim.motor_claim?.estimated_repair_cost?.toString() ||
                          claim.burglary_claim?.estimated_repair_cost?.toString() ||
                          "0"}
                      </TableCell>
                      <TableCell>
                        <ClaimActionCell claimId={claim.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* PROCESSED CLAIMS TABLE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recently Processed Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Policy Holder</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Processed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Update Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">#{claim.id}</TableCell>
                      <TableCell>{claim.claimant_name}</TableCell>
                      <TableCell>{claim.claim_type}</TableCell>
                      <TableCell>
                        {format(claim.updatedAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {claim.rejection_reason || "Approved"}
                      </TableCell>
                      <TableCell>
                        {/* Only show Progress Manager if the claim is Approved */}
                        {claim.status === "APPROVED" && (
                          <AgentProgressManager claimId={claim.id} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Policies</TableHead>
                    <TableHead>Claims</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user._count.policies}</TableCell>
                      <TableCell>{user.totalClaims}</TableCell>
                      <TableCell>
                        {format(user.createdAt, "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

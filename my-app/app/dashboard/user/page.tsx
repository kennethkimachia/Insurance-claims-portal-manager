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
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ClaimDetailsSheet } from "@/components/user/claim-details-sheet";

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-200"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    case "CLOSED":
      return <Badge variant="outline">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function UserDashboard() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return redirect("/sign-in");

  // Fetch real claims for the logged-in user
  const claimsRaw = await prisma.claim.findMany({
    where: {
      policy: {
        user: { clerkId: clerkId },
      },
    },
    include: {
      policy: true,
      motor_claim: true,
      burglary_claim: true,
      agent: {
        select: { firstName: true, lastName: true, email: true },
      },
      progressSteps: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalClaims = claimsRaw.length;
  const activeClaimsList = claimsRaw.filter(
    (c) => c.status === "PENDING" || c.status === "APPROVED",
  );
  const pastClaimsList = claimsRaw.filter(
    (c) => c.status === "REJECTED" || c.status === "CLOSED",
  );

  // Sum up approved amounts (Logic: If approved, sum the estimated cost)
  const approvedTotal = claimsRaw
    .filter((c) => c.status === "APPROVED" || c.status === "CLOSED")
    .reduce((sum, claim) => {
      const cost =
        claim.motor_claim?.estimated_repair_cost ||
        claim.burglary_claim?.estimated_repair_cost ||
        0;
      return sum + Number(cost);
    }, 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Claims Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your insurance claims and track their progress
          </p>
        </div>
        <Link href="/claim-form">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Claim
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClaimsList.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
            <p className="text-xs text-muted-foreground">
              All time claims submitted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Value
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${approvedTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Est. value of approved claims
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ongoing Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Ongoing Claims
          </CardTitle>
          <CardDescription>
            Claims currently being processed or requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeClaimsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeClaimsList.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">#{claim.id}</TableCell>
                    <TableCell>{claim.claim_type}</TableCell>
                    <TableCell>
                      {format(claim.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>
                      $
                      {claim.motor_claim?.estimated_repair_cost?.toString() ||
                        claim.burglary_claim?.estimated_repair_cost?.toString() ||
                        "0"}
                    </TableCell>
                    <TableCell>
                      <ClaimDetailsSheet claim={claim} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No ongoing claims at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Past Claims
          </CardTitle>
          <CardDescription>Rejected or Closed claims history</CardDescription>
        </CardHeader>
        <CardContent>
          {pastClaimsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Date Closed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastClaimsList.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">#{claim.id}</TableCell>
                    <TableCell>{claim.claim_type}</TableCell>
                    <TableCell>
                      {format(claim.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(claim.updatedAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>
                      {claim.status === "REJECTED" ? (
                        <span className="text-red-500 text-sm">Denied</span>
                      ) : (
                        <span className="text-green-600 text-sm">
                          Completed
                        </span>
                      )}
                      <span className="ml-2">
                        <ClaimDetailsSheet claim={claim} />
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No past claims found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

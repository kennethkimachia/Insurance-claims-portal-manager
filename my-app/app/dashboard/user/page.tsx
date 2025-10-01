import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { UserSidebar } from "@/components/UserSidebar"
import Link from "next/link"

// Mock data for ongoing claims
const ongoingClaims = [
  {
    id: "CLM-2024-001",
    type: "Auto Accident",
    dateSubmitted: "2024-01-15",
    status: "Under Review",
    amount: "$2,500.00",
    estimatedCompletion: "2024-01-25",
  },
  {
    id: "CLM-2024-002",
    type: "Property Damage",
    dateSubmitted: "2024-01-10",
    status: "Pending Documentation",
    amount: "$1,200.00",
    estimatedCompletion: "2024-01-20",
  },
  {
    id: "CLM-2024-003",
    type: "Medical",
    dateSubmitted: "2024-01-08",
    status: "Processing",
    amount: "$850.00",
    estimatedCompletion: "2024-01-18",
  },
]

// Mock data for past claims
const pastClaims = [
  {
    id: "CLM-2023-045",
    type: "Auto Accident",
    dateSubmitted: "2023-12-05",
    dateCompleted: "2023-12-20",
    status: "Approved",
    amount: "$3,200.00",
    paidAmount: "$3,200.00",
  },
  {
    id: "CLM-2023-038",
    type: "Home Insurance",
    dateSubmitted: "2023-11-15",
    dateCompleted: "2023-12-01",
    status: "Approved",
    amount: "$1,800.00",
    paidAmount: "$1,800.00",
  },
  {
    id: "CLM-2023-029",
    type: "Medical",
    dateSubmitted: "2023-10-20",
    dateCompleted: "2023-11-05",
    status: "Partially Approved",
    amount: "$950.00",
    paidAmount: "$750.00",
  },
  {
    id: "CLM-2023-021",
    type: "Property Damage",
    dateSubmitted: "2023-09-10",
    dateCompleted: "2023-09-25",
    status: "Denied",
    amount: "$500.00",
    paidAmount: "$0.00",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Under Review":
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    case "Pending Documentation":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    case "Processing":
      return (
        <Badge variant="default">
          <FileText className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    case "Approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    case "Partially Approved":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    case "Denied":
      return <Badge variant="destructive">{status}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claims Dashboard</h1>
          <p className="text-muted-foreground">Manage your insurance claims and track their progress</p>
        </div>
        <Link href="/claim-form">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
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
            <div className="text-2xl font-bold">{ongoingClaims.length}</div>
            <p className="text-xs text-muted-foreground">Currently being processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingClaims.length + pastClaims.length}</div>
            <p className="text-xs text-muted-foreground">All time claims submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,550.00</div>
            <p className="text-xs text-muted-foreground">Total approved payouts</p>
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
          <CardDescription>Claims currently being processed or requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {ongoingClaims.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Est. Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ongoingClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.id}</TableCell>
                    <TableCell>{claim.type}</TableCell>
                    <TableCell>{claim.dateSubmitted}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell>{claim.amount}</TableCell>
                    <TableCell>{claim.estimatedCompletion}</TableCell>
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
          <CardDescription>Previously completed claims and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Date Completed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.id}</TableCell>
                  <TableCell>{claim.type}</TableCell>
                  <TableCell>{claim.dateSubmitted}</TableCell>
                  <TableCell>{claim.dateCompleted}</TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>{claim.amount}</TableCell>
                  <TableCell className={claim.paidAmount === "$0.00" ? "text-red-600" : "text-green-600"}>
                    {claim.paidAmount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Clock, CheckCircle, XCircle, Send, UserPlus, AlertTriangle, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link";

// Mock data for pending claims
const pendingClaims = [
  {
    id: "CLM-2024-001",
    policyHolder: "John Doe",
    policyNumber: "POL-2024-001",
    type: "Auto Accident",
    dateSubmitted: "2024-01-15",
    amount: "$2,500.00",
    priority: "High",
    description: "Rear-end collision on Highway 101",
  },
  {
    id: "CLM-2024-002",
    policyHolder: "Jane Smith",
    policyNumber: "POL-2024-002",
    type: "Property Damage",
    dateSubmitted: "2024-01-14",
    amount: "$1,200.00",
    priority: "Medium",
    description: "Water damage from burst pipe",
  },
  {
    id: "CLM-2024-003",
    policyHolder: "Mike Johnson",
    policyNumber: "POL-2024-003",
    type: "Medical",
    dateSubmitted: "2024-01-13",
    amount: "$850.00",
    priority: "Low",
    description: "Emergency room visit",
  },
]

// Mock data for processed claims
const processedClaims = [
  {
    id: "CLM-2024-004",
    policyHolder: "Sarah Wilson",
    policyNumber: "POL-2024-004",
    type: "Home Insurance",
    dateSubmitted: "2024-01-10",
    dateProcessed: "2024-01-12",
    amount: "$3,200.00",
    status: "Approved",
    action: "Forwarded to Insurance Co.",
    agent: "You",
  },
  {
    id: "CLM-2024-005",
    policyHolder: "Robert Brown",
    policyNumber: "POL-2024-005",
    type: "Auto Accident",
    dateSubmitted: "2024-01-08",
    dateProcessed: "2024-01-11",
    amount: "$1,800.00",
    status: "Rejected",
    action: "Insufficient Documentation",
    agent: "You",
  },
]

// Mock data for users
const users = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@email.com",
    policyNumber: "POL-2024-001",
    dateCreated: "2024-01-01",
    status: "Active",
    claimsCount: 2,
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    policyNumber: "POL-2024-002",
    dateCreated: "2024-01-02",
    status: "Active",
    claimsCount: 1,
  },
  {
    id: "USR-003",
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    policyNumber: "POL-2024-003",
    dateCreated: "2024-01-03",
    status: "Inactive",
    claimsCount: 3,
  },
]

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return <Badge variant="destructive">{priority}</Badge>
    case "Medium":
      return <Badge variant="secondary">{priority}</Badge>
    case "Low":
      return <Badge variant="outline">{priority}</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Active":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Active
        </Badge>
      )
    case "Inactive":
      return <Badge variant="secondary">Inactive</Badge>
    case "Approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Approved
        </Badge>
      )
    case "Rejected":
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function ClaimActions({ claimId }: { claimId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve & Forward
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">
          <XCircle className="w-4 h-4 mr-2" />
          Reject Claim
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Send className="w-4 h-4 mr-2" />
          Request More Info
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AgentDashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage users and process insurance claims</p>
        </div>
        <Link href="/dashboard/agent/create-user">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Create User Account
        </Button>
        </Link>

      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClaims.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.status === "Active").length}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingClaims.filter((c) => c.priority === "High").length}</div>
            <p className="text-xs text-muted-foreground">Urgent claims</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Claims Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          {/* Pending Claims */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Claims Review
              </CardTitle>
              <CardDescription>Claims submitted by policy holders awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Policy Holder</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{claim.policyHolder}</div>
                          <div className="text-sm text-muted-foreground">{claim.policyNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{claim.type}</TableCell>
                      <TableCell>{claim.dateSubmitted}</TableCell>
                      <TableCell>{claim.amount}</TableCell>
                      <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                      <TableCell>
                        <ClaimActions claimId={claim.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recently Processed Claims */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Recently Processed Claims
              </CardTitle>
              <CardDescription>Claims you have recently reviewed and processed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Policy Holder</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Processed</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{claim.policyHolder}</div>
                          <div className="text-sm text-muted-foreground">{claim.policyNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{claim.type}</TableCell>
                      <TableCell>{claim.dateProcessed}</TableCell>
                      <TableCell>{claim.amount}</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell className="text-sm">{claim.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Accounts
              </CardTitle>
              <CardDescription>Manage policy holder accounts and create new users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Claims</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.policyNumber}</TableCell>
                      <TableCell>{user.dateCreated}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.claimsCount}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Users className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              View Claims
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Account</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
  )
}

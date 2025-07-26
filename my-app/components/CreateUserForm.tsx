"use client"

import { useState, type FormEvent } from "react"
import { useUser } from "@clerk/nextjs"
import { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react"

export default function InvitationForm() {
  // Get the currently signed-in user's data from Clerk
  const { user } = useUser()

  // Determine the role of the person using the form
  const currentUserRole = user?.publicMetadata?.role as Role

  // State for all form fields
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [roleToCreate, setRoleToCreate] = useState<Role>("USER") // Default to creating a USER

  // State for managing the UI feedback (loading, success, error messages)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles the form submission.
   */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/create-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          role: roleToCreate, // Send the selected role to the API
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // If the API returns an error, display it
        throw new Error(result.error || "Failed to send invitation.")
      }

      // On success, show a confirmation message and reset the form
      setSuccess(`Invitation for new ${roleToCreate.toLowerCase()} successfully sent to ${email}.`)
      setEmail("")
      setFirstName("")
      setLastName("")
      setRoleToCreate("USER") // Reset dropdown to default
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <UserPlus className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User Account</h1>
          <p className="text-muted-foreground">Invite a new user to join the insurance portal</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill out the form below to send an invitation to a new user. They will receive an email with instructions
              to set up their account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <Select value={roleToCreate} onValueChange={(value) => setRoleToCreate(value as Role)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* An ADMIN can create AGENTs and USERs */}
                    {currentUserRole === Role.ADMIN && (
                      <SelectItem value={Role.AGENT}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Agent
                        </div>
                      </SelectItem>
                    )}
                    {/* Both ADMINs and AGENTs can create USERs */}
                    {(currentUserRole === Role.ADMIN || currentUserRole === Role.AGENT) && (
                      <SelectItem value={Role.USER}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          User (Policyholder)
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {roleToCreate === "AGENT"
                    ? "Agents can manage claims and create user accounts"
                    : "Users can submit and track their insurance claims"}
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || !email} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmail("")
                    setFirstName("")
                    setLastName("")
                    setRoleToCreate("USER")
                    setError("")
                    setSuccess("")
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>

            {/* Feedback Messages */}
            {success && (
              <Alert className="mt-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mt-6 border-red-200 bg-red-50" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Invitation Email Sent</p>
                <p className="text-sm text-muted-foreground">
                  The user will receive an email with a secure invitation link
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Account Setup</p>
                <p className="text-sm text-muted-foreground">
                  They'll create their password and complete their profile
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Access Granted</p>
                <p className="text-sm text-muted-foreground">
                  The user can now access the portal with their assigned role permissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Car, Shield, Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { createClaim } from "@/lib/actions/claim.actions"

interface GeneralInfo {
  name: string
  policy_number: string
  address: string
  po_box: string
  occupation: string
  telephone: string
}

interface StolenItem {
  id: string
  name: string
  description: string
  purchaseDate: Date | undefined
  estimatedValue: string
}

interface MotorClaimDetails {
  dateOfAccident: Date | undefined
  locationOfAccident: string
  descriptionOfAccident: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vehicleRegistrationNo: string
  driversName: string
  driversLicenseNo: string
  thirdPartyInvolved: boolean
  thirdPartyDetails: string
  policeReportFiled: boolean
  policeStation: string
  policeReportNumber: string
  descriptionOfDamage: string
  estimatedRepairCost: string
}

interface BurglaryClaimDetails {
  dateOfLoss: Date | undefined
  dateOfDiscovery: Date | undefined
  descriptionOfIncident: string
  policeReportFiled: boolean
  policeStation: string
  policeReportNumber: string
  wasPropertyDamaged: boolean
  descriptionOfDamage: string
  estimatedRepairCost: string
  stolenItems: StolenItem[]
}

export default function InsuranceClaimForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [claimType, setClaimType] = useState<"motor" | "burglary" | null>(null)
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    name: "",
    policy_number: "",
    address: "",
    po_box: "",
    occupation: "",
    telephone: "",
  })
  const [motorDetails, setMotorDetails] = useState<MotorClaimDetails>({
    dateOfAccident: undefined,
    locationOfAccident: "",
    descriptionOfAccident: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleRegistrationNo: "",
    driversName: "",
    driversLicenseNo: "",
    thirdPartyInvolved: false,
    thirdPartyDetails: "",
    policeReportFiled: false,
    policeStation: "",
    policeReportNumber: "",
    descriptionOfDamage: "",
    estimatedRepairCost: "",
  })
  const [burglaryDetails, setBurglaryDetails] = useState<BurglaryClaimDetails>({
    dateOfLoss: undefined,
    dateOfDiscovery: undefined,
    descriptionOfIncident: "",
    policeReportFiled: false,
    policeStation: "",
    policeReportNumber: "",
    wasPropertyDamaged: false,
    descriptionOfDamage: "",
    estimatedRepairCost: "",
    stolenItems: [],
  })
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<Omit<StolenItem, "id">>({
    name: "",
    description: "",
    purchaseDate: undefined,
    estimatedValue: "",
  })

  const steps = [
    { number: 1, title: "Select Type", description: "Choose claim type" },
    { number: 2, title: "General Information", description: "Policy & contact details" },
    { number: 3, title: "Claim Details", description: "Specific information" },
  ]

  const handleClaimTypeSelect = (type: "motor" | "burglary") => {
    setClaimType(type)
    setCurrentStep(2)
  }

  const handleGeneralInfoNext = () => {
    setCurrentStep(3)
  }

  const handleAddStolenItem = () => {
    if (newItem.name && newItem.estimatedValue) {
      const item: StolenItem = {
        ...newItem,
        id: Date.now().toString(),
      }
      setBurglaryDetails((prev) => ({
        ...prev,
        stolenItems: [...prev.stolenItems, item],
      }))
      setNewItem({
        name: "",
        description: "",
        purchaseDate: undefined,
        estimatedValue: "",
      })
      setIsAddItemDialogOpen(false)
    }
  }

  const handleRemoveStolenItem = (id: string) => {
    setBurglaryDetails((prev) => ({
      ...prev,
      stolenItems: prev.stolenItems.filter((item) => item.id !== id),
    }))
  }

  const handleSubmitClaim = async () => {
    if (!claimType) return

    setIsSubmitting(true)
    try {
      const result = await createClaim({
        claimType,
        generalInfo,
        motorDetails: claimType === "motor" ? motorDetails : undefined,
        burglaryDetails: claimType === "burglary" ? burglaryDetails : undefined,
      })

      if (result.success) {
        alert("Claim submitted successfully!")
        router.push("/dashboard/user")
      } else {
        alert(result.message || "Failed to submit claim")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while submitting the claim")
    } finally {
      setIsSubmitting(false)
    }
  }

  const DatePicker = ({
    date,
    onDateChange,
    placeholder = "Pick a date",
  }: {
    date: Date | undefined
    onDateChange: (date: Date | undefined) => void
    placeholder?: string
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                      currentStep >= step.number
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-foreground">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn("mx-4 h-0.5 w-16 sm:w-24", currentStep > step.number ? "bg-primary" : "bg-border")}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Claim Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">Start a New Claim</h2>
                  <p className="mt-2 text-muted-foreground">Please select the type of claim you would like to file.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                    onClick={() => handleClaimTypeSelect("motor")}
                  >
                    <CardHeader className="text-center">
                      <Car className="mx-auto h-12 w-12 text-primary" />
                      <CardTitle>Motor Claim</CardTitle>
                      <CardDescription>For accidents and damages related to your vehicle.</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                    onClick={() => handleClaimTypeSelect("burglary")}
                  >
                    <CardHeader className="text-center">
                      <Shield className="mx-auto h-12 w-12 text-primary" />
                      <CardTitle>Burglary Claim</CardTitle>
                      <CardDescription>For theft or damage to your property.</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: General Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">General Information</h2>
                  <p className="mt-2 text-muted-foreground">Please provide your policy and contact details.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={generalInfo.name}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policy_number">Policy Number</Label>
                    <Input
                      id="policy_number"
                      type="text"
                      value={generalInfo.policy_number}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, policy_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      value={generalInfo.address}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="po_box">P.O. Box</Label>
                    <Input
                      id="po_box"
                      type="number"
                      value={generalInfo.po_box}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, po_box: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={generalInfo.occupation}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, occupation: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="telephone">Telephone Number</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      value={generalInfo.telephone}
                      onChange={(e) => setGeneralInfo((prev) => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleGeneralInfoNext}>Next</Button>
                </div>
              </div>
            )}

            {/* Step 3: Motor Claim Details */}
            {currentStep === 3 && claimType === "motor" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">Motor Claim Details</h2>
                  <p className="mt-2 text-muted-foreground">Describe the incident and vehicle details.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date of Accident</Label>
                    <DatePicker
                      date={motorDetails.dateOfAccident}
                      onDateChange={(date) => setMotorDetails((prev) => ({ ...prev, dateOfAccident: date }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location of Accident</Label>
                    <Input
                      id="location"
                      value={motorDetails.locationOfAccident}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, locationOfAccident: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description of Accident</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={motorDetails.descriptionOfAccident}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, descriptionOfAccident: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="make">Vehicle Make</Label>
                    <Input
                      id="make"
                      value={motorDetails.vehicleMake}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, vehicleMake: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Vehicle Model</Label>
                    <Input
                      id="model"
                      value={motorDetails.vehicleModel}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, vehicleModel: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Vehicle Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={motorDetails.vehicleYear}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, vehicleYear: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration">Vehicle Registration No</Label>
                    <Input
                      id="registration"
                      value={motorDetails.vehicleRegistrationNo}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, vehicleRegistrationNo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver-name">Driver's Name</Label>
                    <Input
                      id="driver-name"
                      value={motorDetails.driversName}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, driversName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">Driver's License No</Label>
                    <Input
                      id="license"
                      value={motorDetails.driversLicenseNo}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, driversLicenseNo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="third-party"
                        checked={motorDetails.thirdPartyInvolved}
                        onCheckedChange={(checked) =>
                          setMotorDetails((prev) => ({ ...prev, thirdPartyInvolved: checked }))
                        }
                      />
                      <Label htmlFor="third-party">Third Party Involved?</Label>
                    </div>
                  </div>

                  {motorDetails.thirdPartyInvolved && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="third-party-details">Third Party Details</Label>
                      <Textarea
                        id="third-party-details"
                        rows={3}
                        value={motorDetails.thirdPartyDetails}
                        onChange={(e) => setMotorDetails((prev) => ({ ...prev, thirdPartyDetails: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="police-report"
                        checked={motorDetails.policeReportFiled}
                        onCheckedChange={(checked) =>
                          setMotorDetails((prev) => ({ ...prev, policeReportFiled: checked }))
                        }
                      />
                      <Label htmlFor="police-report">Police Report Filed?</Label>
                    </div>
                  </div>

                  {motorDetails.policeReportFiled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="police-station">Police Station</Label>
                        <Input
                          id="police-station"
                          value={motorDetails.policeStation}
                          onChange={(e) => setMotorDetails((prev) => ({ ...prev, policeStation: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="police-report-no">Police Report Number</Label>
                        <Input
                          id="police-report-no"
                          value={motorDetails.policeReportNumber}
                          onChange={(e) => setMotorDetails((prev) => ({ ...prev, policeReportNumber: e.target.value }))}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="damage-description">Description of Damage</Label>
                    <Textarea
                      id="damage-description"
                      rows={3}
                      value={motorDetails.descriptionOfDamage}
                      onChange={(e) => setMotorDetails((prev) => ({ ...prev, descriptionOfDamage: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="repair-cost">Estimated Repair Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="repair-cost"
                        type="number"
                        className="pl-8"
                        value={motorDetails.estimatedRepairCost}
                        onChange={(e) => setMotorDetails((prev) => ({ ...prev, estimatedRepairCost: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmitClaim} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Burglary Claim Details */}
            {currentStep === 3 && claimType === "burglary" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">Burglary Claim Details</h2>
                  <p className="mt-2 text-muted-foreground">Provide details about the incident and stolen items.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date of Loss</Label>
                    <DatePicker
                      date={burglaryDetails.dateOfLoss}
                      onDateChange={(date) => setBurglaryDetails((prev) => ({ ...prev, dateOfLoss: date }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Discovery</Label>
                    <DatePicker
                      date={burglaryDetails.dateOfDiscovery}
                      onDateChange={(date) => setBurglaryDetails((prev) => ({ ...prev, dateOfDiscovery: date }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="incident-description">Description of Incident</Label>
                    <Textarea
                      id="incident-description"
                      rows={3}
                      value={burglaryDetails.descriptionOfIncident}
                      onChange={(e) =>
                        setBurglaryDetails((prev) => ({ ...prev, descriptionOfIncident: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="police-report-burglary"
                        checked={burglaryDetails.policeReportFiled}
                        onCheckedChange={(checked) =>
                          setBurglaryDetails((prev) => ({ ...prev, policeReportFiled: checked }))
                        }
                      />
                      <Label htmlFor="police-report-burglary">Police Report Filed?</Label>
                    </div>
                  </div>

                  {burglaryDetails.policeReportFiled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="police-station-burglary">Police Station</Label>
                        <Input
                          id="police-station-burglary"
                          value={burglaryDetails.policeStation}
                          onChange={(e) => setBurglaryDetails((prev) => ({ ...prev, policeStation: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="police-report-no-burglary">Police Report Number</Label>
                        <Input
                          id="police-report-no-burglary"
                          value={burglaryDetails.policeReportNumber}
                          onChange={(e) =>
                            setBurglaryDetails((prev) => ({ ...prev, policeReportNumber: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="property-damaged"
                        checked={burglaryDetails.wasPropertyDamaged}
                        onCheckedChange={(checked) =>
                          setBurglaryDetails((prev) => ({ ...prev, wasPropertyDamaged: checked }))
                        }
                      />
                      <Label htmlFor="property-damaged">Was Property Damaged?</Label>
                    </div>
                  </div>

                  {burglaryDetails.wasPropertyDamaged && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="damage-description-burglary">Description of Damage</Label>
                        <Textarea
                          id="damage-description-burglary"
                          rows={3}
                          value={burglaryDetails.descriptionOfDamage}
                          onChange={(e) =>
                            setBurglaryDetails((prev) => ({ ...prev, descriptionOfDamage: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="repair-cost-burglary">Estimated Repair Cost</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="repair-cost-burglary"
                            type="number"
                            className="pl-8"
                            value={burglaryDetails.estimatedRepairCost}
                            onChange={(e) =>
                              setBurglaryDetails((prev) => ({ ...prev, estimatedRepairCost: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Stolen Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Stolen Items</h3>
                    <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Stolen Item</DialogTitle>
                          <DialogDescription>Provide details about the stolen item.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input
                              id="item-name"
                              value={newItem.name}
                              onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="item-description">Item Description</Label>
                            <Textarea
                              id="item-description"
                              rows={3}
                              value={newItem.description}
                              onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Purchase Date</Label>
                            <DatePicker
                              date={newItem.purchaseDate}
                              onDateChange={(date) => setNewItem((prev) => ({ ...prev, purchaseDate: date }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="item-value">Estimated Value</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input
                                id="item-value"
                                type="number"
                                className="pl-8"
                                value={newItem.estimatedValue}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, estimatedValue: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddStolenItem}>Save Item</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {burglaryDetails.stolenItems.length > 0 && (
                    <div className="space-y-3">
                      {burglaryDetails.stolenItems.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">Estimated Value: ${item.estimatedValue}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveStolenItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmitClaim} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

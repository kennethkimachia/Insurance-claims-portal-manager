"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Car,
  Shield,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClaim } from "@/lib/actions/claim.actions";
import { MediaUpload } from "@/components/ui/media-upload";
// Zod & React Hook Form
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Validation Schemas ---

const generalInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  policy_number: z.string().min(1, "Policy number is required"),
  address: z.string().min(5, "Address is required"),
  po_box: z.string().optional(),
  occupation: z.string().optional(),
  telephone: z.string().min(8, "Phone number is required"),
});

const motorDetailsSchema = z.object({
  dateOfAccident: z.date({ required_error: "Date is required" }),
  locationOfAccident: z.string().min(1, "Location is required"),
  descriptionOfAccident: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  vehicleMake: z.string().min(1, "Make is required"),
  vehicleModel: z.string().min(1, "Model is required"),
  vehicleYear: z
    .string()
    .or(z.number())
    .transform((v) => v.toString()),
  vehicleRegistrationNo: z.string().min(1, "Registration No is required"),
  driversName: z.string().min(1, "Driver name is required"),
  driversLicenseNo: z.string().min(1, "License No is required"),
  thirdPartyInvolved: z.boolean(),
  thirdPartyDetails: z.string().optional(),
  policeReportFiled: z.boolean(),
  policeStation: z.string().optional(),
  policeReportNumber: z.string().optional(),
  descriptionOfDamage: z.string().min(1, "Damage description is required"),
  estimatedRepairCost: z
    .string()
    .or(z.number())
    .transform((v) => v.toString()),
  mediaUrls: z
    .array(z.string())
    .min(1, "At least one image/video is required for motor claims"),
});

const burglaryDetailsSchema = z.object({
  dateOfLoss: z.date({ required_error: "Date of loss is required" }),
  dateOfDiscovery: z.date({ required_error: "Date of discovery is required" }),
  descriptionOfIncident: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  policeReportFiled: z.boolean(),
  policeStation: z.string().optional(),
  policeReportNumber: z.string().optional(),
  wasPropertyDamaged: z.boolean(),
  descriptionOfDamage: z.string().optional(),
  estimatedRepairCost: z
    .string()
    .or(z.number())
    .transform((v) => v.toString())
    .optional(),
  stolenItems: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      purchaseDate: z.date().optional(),
      estimatedValue: z.string(),
      mediaUrl: z.string().nullable().optional(),
    }),
  ),
});

// Types inferred from schema
type GeneralInfo = z.infer<typeof generalInfoSchema>;
type MotorClaimDetails = z.infer<typeof motorDetailsSchema>;
type BurglaryClaimDetails = z.infer<typeof burglaryDetailsSchema>;

interface StolenItem {
  id: string;
  name: string;
  description: string;
  purchaseDate: Date | undefined;
  estimatedValue: string;
  mediaUrl?: string;
}

export default function InsuranceClaimForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [claimType, setClaimType] = useState<"motor" | "burglary" | null>(null);

  // Forms
  const generalForm = useForm<GeneralInfo>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: "",
      policy_number: "",
      address: "",
      po_box: "",
      occupation: "",
      telephone: "",
    },
  });

  const motorForm = useForm<MotorClaimDetails>({
    resolver: zodResolver(motorDetailsSchema),
    defaultValues: {
      thirdPartyInvolved: false,
      policeReportFiled: false,
      mediaUrls: [],
    },
  });

  const burglaryForm = useForm<BurglaryClaimDetails>({
    resolver: zodResolver(burglaryDetailsSchema),
    defaultValues: {
      policeReportFiled: false,
      wasPropertyDamaged: false,
      stolenItems: [],
    },
  });

  // State for adding item
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<StolenItem, "id">>({
    name: "",
    description: "",
    purchaseDate: undefined,
    estimatedValue: "",
    mediaUrl: "",
  });

  const steps = [
    { number: 1, title: "Select Type", description: "Choose claim type" },
    {
      number: 2,
      title: "General Information",
      description: "Policy & contact details",
    },
    { number: 3, title: "Claim Details", description: "Specific information" },
  ];

  const handleClaimTypeSelect = (type: "motor" | "burglary") => {
    setClaimType(type);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGeneralInfoSubmit = (data: GeneralInfo) => {
    // Validation passed
    console.log("General Info:", data);
    setCurrentStep(3);
  };

  const handleAddStolenItem = () => {
    if (newItem.name && newItem.estimatedValue) {
      const item: StolenItem = {
        ...newItem,
        id: Date.now().toString(),
      };

      const currentItems = burglaryForm.getValues("stolenItems") || [];
      burglaryForm.setValue("stolenItems", [...currentItems, item]);

      setNewItem({
        name: "",
        description: "",
        purchaseDate: undefined,
        estimatedValue: "",
        mediaUrl: "",
      });
      setIsAddItemDialogOpen(false);
    }
  };

  const handleRemoveStolenItem = (id: string) => {
    const currentItems = burglaryForm.getValues("stolenItems") || [];
    burglaryForm.setValue(
      "stolenItems",
      currentItems.filter((item) => item.id !== id),
    );
  };

  const onSubmitFullForm = async () => {
    if (!claimType) return;
    setIsSubmitting(true);

    // Gather data
    const generalData = generalForm.getValues();
    let specificData;
    let isValid = false;

    if (claimType === "motor") {
      isValid = await motorForm.trigger();
      specificData = motorForm.getValues();
    } else {
      isValid = await burglaryForm.trigger();
      specificData = burglaryForm.getValues();
    }

    if (!isValid) {
      setIsSubmitting(false);
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    try {
      const result = await createClaim({
        claimType,
        generalInfo: generalData,
        motorDetails:
          claimType === "motor"
            ? (specificData as MotorClaimDetails)
            : undefined,
        burglaryDetails:
          claimType === "burglary"
            ? (specificData as BurglaryClaimDetails)
            : undefined,
      });

      if (result.success) {
        alert("Claim submitted successfully!");
        router.push("/dashboard/user");
      } else {
        alert(result.message || "Failed to submit claim");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Date Picker Component ---
  const DatePicker = ({
    value,
    onChange,
    placeholder = "Pick a date",
  }: {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

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
                    <div className="text-sm font-medium text-foreground">
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 w-16 sm:w-24",
                      currentStep > step.number ? "bg-primary" : "bg-border",
                    )}
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
                  <h2 className="text-2xl font-bold text-foreground">
                    Start a New Claim
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Please select the type of claim you would like to file.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                    onClick={() => handleClaimTypeSelect("motor")}
                  >
                    <CardHeader className="text-center">
                      <Car className="mx-auto h-12 w-12 text-primary" />
                      <CardTitle>Motor Claim</CardTitle>
                      <CardDescription>
                        For accidents and damages related to your vehicle.
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                    onClick={() => handleClaimTypeSelect("burglary")}
                  >
                    <CardHeader className="text-center">
                      <Shield className="mx-auto h-12 w-12 text-primary" />
                      <CardTitle>Burglary Claim</CardTitle>
                      <CardDescription>
                        For theft or damage to your property.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: General Information */}
            {currentStep === 2 && (
              <form
                onSubmit={generalForm.handleSubmit(handleGeneralInfoSubmit)}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    General Information
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Please provide your policy and contact details.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...generalForm.register("name")} />
                    {generalForm.formState.errors.name && (
                      <span className="text-red-500 text-sm">
                        {generalForm.formState.errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="policy_number">Policy Number</Label>
                    <Input
                      id="policy_number"
                      {...generalForm.register("policy_number")}
                    />
                    {generalForm.formState.errors.policy_number && (
                      <span className="text-red-500 text-sm">
                        {generalForm.formState.errors.policy_number.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" {...generalForm.register("address")} />
                    {generalForm.formState.errors.address && (
                      <span className="text-red-500 text-sm">
                        {generalForm.formState.errors.address.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="po_box">P.O. Box</Label>
                    <Input id="po_box" {...generalForm.register("po_box")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      {...generalForm.register("occupation")}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="telephone">Telephone Number</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      {...generalForm.register("telephone")}
                    />
                    {generalForm.formState.errors.telephone && (
                      <span className="text-red-500 text-sm">
                        {generalForm.formState.errors.telephone.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button type="submit">Next</Button>
                </div>
              </form>
            )}

            {/* Step 3: Motor Claim Details */}
            {currentStep === 3 && claimType === "motor" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    Motor Claim Details
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Describe the incident and vehicle details.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date of Accident</Label>
                    <Controller
                      control={motorForm.control}
                      name="dateOfAccident"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {motorForm.formState.errors.dateOfAccident && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.dateOfAccident.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Location of Accident</Label>
                    <Input {...motorForm.register("locationOfAccident")} />
                    {motorForm.formState.errors.locationOfAccident && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.locationOfAccident.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description of Accident</Label>
                    <Textarea
                      rows={3}
                      {...motorForm.register("descriptionOfAccident")}
                    />
                    {motorForm.formState.errors.descriptionOfAccident && (
                      <span className="text-red-500 text-sm">
                        {
                          motorForm.formState.errors.descriptionOfAccident
                            .message
                        }
                      </span>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-2">
                    <Label>Vehicle Make</Label>
                    <Input {...motorForm.register("vehicleMake")} />
                    {motorForm.formState.errors.vehicleMake && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.vehicleMake.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Model</Label>
                    <Input {...motorForm.register("vehicleModel")} />
                    {motorForm.formState.errors.vehicleModel && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.vehicleModel.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Year</Label>
                    <Input
                      type="number"
                      {...motorForm.register("vehicleYear")}
                    />
                    {motorForm.formState.errors.vehicleYear && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.vehicleYear.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Registration No</Label>
                    <Input {...motorForm.register("vehicleRegistrationNo")} />
                    {motorForm.formState.errors.vehicleRegistrationNo && (
                      <span className="text-red-500 text-sm">
                        {
                          motorForm.formState.errors.vehicleRegistrationNo
                            .message
                        }
                      </span>
                    )}
                  </div>

                  {/* Driver Details */}
                  <div className="space-y-2">
                    <Label>Driver's Name</Label>
                    <Input {...motorForm.register("driversName")} />
                    {motorForm.formState.errors.driversName && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.driversName.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>License No</Label>
                    <Input {...motorForm.register("driversLicenseNo")} />
                    {motorForm.formState.errors.driversLicenseNo && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.driversLicenseNo.message}
                      </span>
                    )}
                  </div>

                  {/* Third Party & Police */}
                  <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                    <Controller
                      control={motorForm.control}
                      name="thirdPartyInvolved"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label>Third Party Involved?</Label>
                  </div>
                  {motorForm.watch("thirdPartyInvolved") && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Third Party Details</Label>
                      <Textarea
                        rows={2}
                        {...motorForm.register("thirdPartyDetails")}
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                    <Controller
                      control={motorForm.control}
                      name="policeReportFiled"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label>Police Report Filed?</Label>
                  </div>
                  {motorForm.watch("policeReportFiled") && (
                    <>
                      <div className="space-y-2">
                        <Label>Police Station</Label>
                        <Input {...motorForm.register("policeStation")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Police Report No</Label>
                        <Input {...motorForm.register("policeReportNumber")} />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description of Damage</Label>
                    <Textarea
                      rows={3}
                      {...motorForm.register("descriptionOfDamage")}
                    />
                    {motorForm.formState.errors.descriptionOfDamage && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.descriptionOfDamage.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Estimated Repair Cost ($)</Label>
                    <Input
                      type="number"
                      {...motorForm.register("estimatedRepairCost")}
                    />
                    {motorForm.formState.errors.estimatedRepairCost && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.estimatedRepairCost.message}
                      </span>
                    )}
                  </div>

                  {/* Media Upload (Required) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-1">
                      Upload Images/Videos{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Please provide evidence of the accident.
                    </p>
                    <Controller
                      control={motorForm.control}
                      name="mediaUrls"
                      render={({ field }) => (
                        <MediaUpload
                          value={field.value}
                          onUpload={(url) =>
                            field.onChange([...field.value, url])
                          }
                          onRemove={(url) =>
                            field.onChange(field.value.filter((u) => u !== url))
                          }
                        />
                      )}
                    />
                    {motorForm.formState.errors.mediaUrls && (
                      <span className="text-red-500 text-sm">
                        {motorForm.formState.errors.mediaUrls.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={onSubmitFullForm} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Burglary Claim Details */}
            {currentStep === 3 && claimType === "burglary" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    Burglary Claim Details
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Provide details about the incident and stolen items.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date of Loss</Label>
                    <Controller
                      control={burglaryForm.control}
                      name="dateOfLoss"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {burglaryForm.formState.errors.dateOfLoss && (
                      <span className="text-red-500 text-sm">
                        {burglaryForm.formState.errors.dateOfLoss.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Discovery</Label>
                    <Controller
                      control={burglaryForm.control}
                      name="dateOfDiscovery"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {burglaryForm.formState.errors.dateOfDiscovery && (
                      <span className="text-red-500 text-sm">
                        {burglaryForm.formState.errors.dateOfDiscovery.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description of Incident</Label>
                    <Textarea
                      rows={3}
                      {...burglaryForm.register("descriptionOfIncident")}
                    />
                    {burglaryForm.formState.errors.descriptionOfIncident && (
                      <span className="text-red-500 text-sm">
                        {
                          burglaryForm.formState.errors.descriptionOfIncident
                            .message
                        }
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                    <Controller
                      control={burglaryForm.control}
                      name="policeReportFiled"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label>Police Report Filed?</Label>
                  </div>
                  {burglaryForm.watch("policeReportFiled") && (
                    <>
                      <div className="space-y-2">
                        <Label>Police Station</Label>
                        <Input {...burglaryForm.register("policeStation")} />
                      </div>
                      <div className="space-y-2">
                        <Label>Police Report No</Label>
                        <Input
                          {...burglaryForm.register("policeReportNumber")}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2 flex items-center gap-2">
                    <Controller
                      control={burglaryForm.control}
                      name="wasPropertyDamaged"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label>Was Property Damaged?</Label>
                  </div>
                  {burglaryForm.watch("wasPropertyDamaged") && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description of Damage</Label>
                        <Textarea
                          rows={3}
                          {...burglaryForm.register("descriptionOfDamage")}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Estimated Repair Cost ($)</Label>
                        <Input
                          type="number"
                          {...burglaryForm.register("estimatedRepairCost")}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Stolen Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Stolen Items</h3>
                    <Dialog
                      open={isAddItemDialogOpen}
                      onOpenChange={setIsAddItemDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Stolen Item</DialogTitle>
                          <DialogDescription>
                            Provide details about the stolen item.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input
                              value={newItem.name}
                              onChange={(e) =>
                                setNewItem((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              rows={2}
                              value={newItem.description}
                              onChange={(e) =>
                                setNewItem((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Purchase Date</Label>
                            <DatePicker
                              value={newItem.purchaseDate}
                              onChange={(date) =>
                                setNewItem((prev) => ({
                                  ...prev,
                                  purchaseDate: date,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estimated Value ($)</Label>
                            <Input
                              type="number"
                              value={newItem.estimatedValue}
                              onChange={(e) =>
                                setNewItem((prev) => ({
                                  ...prev,
                                  estimatedValue: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {/* Optional Image Upload for Item */}
                          <div className="space-y-2">
                            <Label>Item Image (Optional)</Label>
                            <MediaUpload
                              value={newItem.mediaUrl ? [newItem.mediaUrl] : []}
                              onUpload={(url) =>
                                setNewItem((prev) => ({
                                  ...prev,
                                  mediaUrl: url,
                                }))
                              }
                              onRemove={() =>
                                setNewItem((prev) => ({
                                  ...prev,
                                  mediaUrl: "",
                                }))
                              }
                              maxFiles={1}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddItemDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddStolenItem}>
                            Save Item
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {burglaryForm.watch("stolenItems")?.length > 0 && (
                    <div className="space-y-3">
                      {burglaryForm.watch("stolenItems").map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {item.mediaUrl && (
                                <img
                                  src={item.mediaUrl}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-md"
                                />
                              )}
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Value: ${item.estimatedValue}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStolenItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={onSubmitFullForm} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// Define types matching the form
interface GeneralInfo {
  name: string
  policy_number: string
  address: string
  po_box: string
  occupation: string
  telephone: string
}

interface StolenItem {
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

export async function createClaim(data: {
  claimType: "motor" | "burglary"
  generalInfo: GeneralInfo
  motorDetails?: MotorClaimDetails
  burglaryDetails?: BurglaryClaimDetails
}) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const policy = await prisma.policy.findFirst({
      where: { 
        policy_number: data.generalInfo.policy_number,
        /*I need to fix this issue. The policy number validation is not working.
        Each form needs to get the userID of the person submitting the form. This way it is able to 
        check the policy number of that user using the userID */
        type: data.claimType === "motor" ? "MOTOR" : "BURGLARY"
      },
    })

    if (!policy) {
      return { success: false, message: `Invalid policy number. Please ensure you are using a valid ${data.claimType.toUpperCase()} policy number.` }
    }

    // Create the claim
    const claim = await prisma.claim.create({
      data: {
        status: "PENDING",
        claim_type: data.claimType === "motor" ? "MOTOR" : "BURGLARY",
        claimant_name: data.generalInfo.name,
        address: data.generalInfo.address,
        po_box: data.generalInfo.po_box,
        occupation: data.generalInfo.occupation,
        telephone: data.generalInfo.telephone,
        policy: { connect: { id: policy.id } },
        ...(data.claimType === "motor" && data.motorDetails
          ? {
              motor_claim: {
                create: {
                  date_of_accident: data.motorDetails.dateOfAccident!,
                  location_of_accident: data.motorDetails.locationOfAccident,
                  description_of_accident: data.motorDetails.descriptionOfAccident,
                  vehicle_make: data.motorDetails.vehicleMake,
                  vehicle_model: data.motorDetails.vehicleModel,
                  vehicle_year: parseInt(data.motorDetails.vehicleYear),
                  vehicle_registration_no: data.motorDetails.vehicleRegistrationNo,
                  driver_name: data.motorDetails.driversName,
                  driver_license_no: data.motorDetails.driversLicenseNo,
                  third_party_involved: data.motorDetails.thirdPartyInvolved,
                  third_party_details: data.motorDetails.thirdPartyDetails,
                  police_report_filed: data.motorDetails.policeReportFiled,
                  police_station: data.motorDetails.policeStation,
                  police_report_number: data.motorDetails.policeReportNumber,
                  description_of_damage: data.motorDetails.descriptionOfDamage,
                  estimated_repair_cost: data.motorDetails.estimatedRepairCost ? parseFloat(data.motorDetails.estimatedRepairCost) : null,
                },
              },
            }
          : {}),
        ...(data.claimType === "burglary" && data.burglaryDetails
          ? {
              burglary_claim: {
                create: {
                  date_of_loss: data.burglaryDetails.dateOfLoss!,
                  date_of_discovery: data.burglaryDetails.dateOfDiscovery!,
                  description_of_incident: data.burglaryDetails.descriptionOfIncident,
                  police_report_filed: data.burglaryDetails.policeReportFiled,
                  police_station: data.burglaryDetails.policeStation,
                  police_report_number: data.burglaryDetails.policeReportNumber,
                  property_damaged: data.burglaryDetails.wasPropertyDamaged,
                  damage_description: data.burglaryDetails.descriptionOfDamage,
                  estimated_repair_cost: data.burglaryDetails.estimatedRepairCost ? parseFloat(data.burglaryDetails.estimatedRepairCost) : null,
                  stolen_items: {
                    create: data.burglaryDetails.stolenItems.map((item) => ({
                      item_name: item.name,
                      item_description: item.description,
                      purchase_date: item.purchaseDate,
                      estimated_value: parseFloat(item.estimatedValue),
                    })),
                  },
                },
              },
            }
          : {}),
      },
    })

    revalidatePath("/agent/pending")
    revalidatePath("/agent/claims")
    revalidatePath("/all-claims")

    return { success: true, message: "Claim submitted successfully", claimId: claim.id }
  } catch (error) {
    console.error("Error creating claim:", error)
    return { success: false, message: "Failed to submit claim" }
  }
}

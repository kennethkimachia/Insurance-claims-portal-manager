"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ClaimStatus } from "@prisma/client";


export async function processClaim(claimId: number, status: "APPROVED" | "REJECTED" | "CLOSED", reason?: string) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    // 1. Fetch the user from the database to check their REAL role
    // We do this instead of checking sessionClaims because the session might be stale
    console.log("--- Process Claim Debug Start ---");
    console.log("Clerk User ID:", clerkId);

    const agent = await prisma.user.findUnique({
        where: { clerkId }
    });

    console.log("Database Agent Found:", agent);

    // 2. Check if agent exists and has the correct role
    // We also allow ADMIN role to process claims to prevent lockout if you are an Admin
    if (!agent || (agent.role !== "AGENT" && agent.role !== "ADMIN")) {
        console.log("Auth Failed: User role is", agent?.role);
        return { success: false, message: "Unauthorized: You do not have Agent permissions." };
    }

    if (status === "REJECTED" && !reason) {
      return { success: false, message: "Rejection reason is required" };
    }

    await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: status as ClaimStatus,
        rejection_reason: status === "REJECTED" ? reason : null,
        agentId: agent.id, 
      },
    });

    if (status === "APPROVED") {
        await prisma.claimProgress.create({
            data: {
                claimId,
                title: "Claim Approved",
                description: "Your claim has been reviewed and approved by the agent. Processing will begin shortly."
            }
        });
    }

    revalidatePath("/dashboard/agent");
    revalidatePath("/dashboard/user");
    console.log("--- Process Claim Success ---");
    return { success: true, message: `Claim ${status.toLowerCase()} successfully` };
  } catch (error) {
    console.error("Error processing claim:", error);
    return { success: false, message: "Failed to process claim" };
  }
}

export async function addClaimProgress(claimId: number, title: string, description: string) {
    const { userId: clerkId } = await auth();
  
    if (!clerkId) {
      return { success: false, message: "Unauthorized access" };
    }

    try {
        // 1. Verify Role against Database
        const agent = await prisma.user.findUnique({
            where: { clerkId }
        });

        // 2. Allow Agents OR Admins
        if (!agent || (agent.role !== "AGENT" && agent.role !== "ADMIN")) {
            return { success: false, message: "Unauthorized access" };
        }

        // 3. Perform Action
        await prisma.claimProgress.create({
            data: {
                claimId,
                title,
                description
            }
        });

        revalidatePath("/dashboard/agent");
        revalidatePath("/dashboard/user");
        return { success: true, message: "Progress step added" };
    } catch (error) {
        console.error("Error adding progress:", error);
        return { success: false, message: "Failed to add progress" };
    }
}
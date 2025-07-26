import { NextResponse } from "next/server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { sessionClaims } = await auth();
    console.log("--- Backend API Request ---");
    console.log("Received sessionClaims:", JSON.stringify(sessionClaims, null, 2));

    const creatorRole = sessionClaims?.metadata?.role as Role;
    console.log("Extracted creatorRole:", creatorRole);

    if (!creatorRole) {
      console.log("Authorization failed: No role found in token metadata.");
      return NextResponse.json({ error: "Unauthorized: Role not found in token." }, { status: 403 });
    }
    
    const { email, firstName, lastName, role: roleToCreate } = await request.json();

    if (!email || !roleToCreate) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    const validRoles: Role[] = Object.values(Role);
    if (!validRoles.includes(roleToCreate)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    let isAuthorized = false;
    if (creatorRole === Role.ADMIN) {
      if (roleToCreate === Role.AGENT || roleToCreate === Role.USER) {
        isAuthorized = true;
      }
    } else if (creatorRole === Role.AGENT) {
      if (roleToCreate === Role.USER) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You are not authorized to create a user with this role." },
        { status: 403 }
      );
    }

    const client = await clerkClient();
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/sign-up`,
      publicMetadata: {
        role: roleToCreate,
        firstName: firstName || "",
        lastName: lastName || "",
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error: any) {
    console.error("Error in /api/create-invitation:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
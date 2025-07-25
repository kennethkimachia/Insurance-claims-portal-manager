// app/api/create-invitation/route.ts

import { NextResponse } from "next/server";
import { clerkClient, auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {

    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;

    if (!role || !["ADMIN", "AGENT"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, firstName, lastName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // FIX: Await the clerkClient() call FIRST to get the client object,
    // then access the .invitations property on the resolved object.
    const client = await clerkClient();
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/sign-up`,
      publicMetadata: {
        role: "USER",
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
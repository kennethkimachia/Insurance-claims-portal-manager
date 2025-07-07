// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client"; // Import the Role enum from Prisma Client

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // FIX 1: Await the headers() function to get the actual headers object.
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, public_metadata } =
      evt.data;

    // FIX 2: Robustly handle the role from metadata.
    let role: Role = "USER"; // Default to USER
    const roleFromClerk = public_metadata?.role as string; // Safely access the role

    if (roleFromClerk) {
      const upperCaseRole = roleFromClerk.toUpperCase();
      // Check if the role from Clerk is a valid role in our enum
      if (Object.values(Role).includes(upperCaseRole as Role)) {
        role = upperCaseRole as Role;
      }
    }

    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        role: role, // Use the validated and correctly typed role
      },
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  }

  return new Response("", { status: 200 });
}
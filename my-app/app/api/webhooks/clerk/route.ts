// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
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

  // Get the type of event
  const eventType = evt.type;

  // Use a switch statement for cleaner handling of multiple events
  switch (eventType) {
    // CASE 1: User is created
    case "user.created": {
      const { id, email_addresses, first_name, last_name, public_metadata } =
        evt.data;

      // Validate and determine the user's role
      let role: Role = "USER"; // Default role
      const roleFromClerk = public_metadata?.role as string;
      if (
        roleFromClerk &&
        Object.values(Role).includes(roleFromClerk.toUpperCase() as Role)
      ) {
        role = roleFromClerk.toUpperCase() as Role;
      }

      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          role: role,
        },
      });

      return NextResponse.json({ message: "User created" }, { status: 201 });
    }

    // CASE 2: User is updated
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, public_metadata } =
        evt.data;

      let role: Role = "USER";
      const roleFromClerk = public_metadata?.role as string;
      if (
        roleFromClerk &&
        Object.values(Role).includes(roleFromClerk.toUpperCase() as Role)
      ) {
        role = roleFromClerk.toUpperCase() as Role;
      }

      await prisma.user.update({
        where: {
          clerkId: id,
        },
        data: {
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          role: role,
        },
      });

      return NextResponse.json({ message: "User updated" }, { status: 200 });
    }

    // CASE 3: User is deleted
    case "user.deleted": {
      const { id } = evt.data;

      // Ensure id is not undefined before proceeding
      if (!id) {
        return new Response("Error occured -- user ID missing in payload", {
          status: 400,
        });
      }

      await prisma.user.delete({
        where: {
          clerkId: id,
        },
      });

      return NextResponse.json({ message: "User deleted" }, { status: 200 });
    }
  }

  // If the event type is not handled, return a 200 OK
  return new Response("", { status: 200 });
}
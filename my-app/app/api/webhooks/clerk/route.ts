import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local',
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing Svix headers', {
      status: 400,
    });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error: Webhook verification failed', {
      status: 400,
    });
  }

  const eventType = evt.type;

  // --- HANDLE USER CREATION ---
  if (eventType === 'user.created') {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
    } = evt.data;

    if (!email_addresses || email_addresses.length === 0) {
      return new NextResponse('Error: No email address found for the user', {
        status: 400,
      });
    }

    try {
      // Default to USER initially. The organizationMembership event will update this shortly after.
      const user = await prisma.user.upsert({
        where: { clerkId: clerkId },
        update: {
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
        },
        create: {
          clerkId: clerkId,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          role: Role.USER, // Default role
        },
      });

      console.log(`Successfully upserted user ${clerkId}`);

      // Create Policies (Logic preserved from your code)
      const existingMotorPolicy = await prisma.policy.findFirst({
        where: { userId: user.id, type: "MOTOR" }
      });

      if (!existingMotorPolicy) {
        const motorPolicyNumber = `POL-M-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
        await prisma.policy.create({
          data: {
            policy_number: motorPolicyNumber,
            type: "MOTOR",
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            userId: user.id,
          },
        });
      }

      const existingBurglaryPolicy = await prisma.policy.findFirst({
        where: { userId: user.id, type: "BURGLARY" }
      });

      if (!existingBurglaryPolicy) {
        const burglaryPolicyNumber = `POL-B-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
        await prisma.policy.create({
          data: {
            policy_number: burglaryPolicyNumber,
            type: "BURGLARY",
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            userId: user.id,
          },
        });
      }

    } catch (error) {
      console.error('Error in user.created:', error);
      return new NextResponse('Error processing user', { status: 500 });
    }
  }

  // --- HANDLE ROLE UPDATES (ORGANIZATION MEMBERSHIP) ---
  if (eventType === 'organizationMembership.created' || eventType === 'organizationMembership.updated') {
    const { role, public_user_data } = evt.data;
    const userId = public_user_data.user_id;

    console.log(`Processing org membership for ${userId}. Clerk Role: ${role}`);

    try {
      // Map Clerk Role to Database Role
      // IMPORTANT: Verify these keys in your Clerk Dashboard > Organization > Roles
      let dbRole: Role = Role.USER;

      if (role === 'org:admin') {
        dbRole = Role.ADMIN;
      } else if (role === 'org:agent') { // You might need to check if your custom role key is 'org:agent'
        dbRole = Role.AGENT;
      } else {
        dbRole = Role.USER; // 'org:member' falls here
      }

      // Update the user's role in the database
      await prisma.user.update({
        where: { clerkId: userId },
        data: { role: dbRole },
      });
      
      console.log(`Updated user ${userId} role to ${dbRole}`);

    } catch (error) {
      console.error('Error updating role:', error);
      // We don't return 500 here to avoid retries if the user doesn't exist yet (rare race condition)
    }
  }

  return new NextResponse('Webhook processed successfully', { status: 200 });
}
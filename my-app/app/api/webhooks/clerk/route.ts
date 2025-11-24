import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma'; 
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

  if (eventType === 'user.created') {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      public_metadata,
    } = evt.data;


    const role = (public_metadata.role as Role) || Role.USER;


    if (!email_addresses || email_addresses.length === 0) {
      return new NextResponse('Error: No email address found for the user', {
        status: 400,
      });
    }

    try {
      const user = await prisma.user.upsert({
        where: { clerkId: clerkId },
        update: {
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          role: role,
        },
        create: {
          clerkId: clerkId,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          role: role,
        },
      });

      console.log(`Successfully upserted user ${clerkId} in the database.`);

      // Ensure user has both MOTOR and BURGLARY policies
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
        console.log(`Created MOTOR policy ${motorPolicyNumber} for user ${user.id}`);
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
        console.log(`Created BURGLARY policy ${burglaryPolicyNumber} for user ${user.id}`);
      }

    } catch (error) {
      console.error('Error during database operation:', error);
      return new NextResponse('Error: Could not process user in database', {
        status: 500,
      });
    }
  }


  return new NextResponse('Webhook processed successfully', { status: 200 });
}
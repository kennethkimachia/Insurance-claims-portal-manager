import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Role } from '@prisma/client'; 
import {prisma} from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const invitingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!invitingUser) {
      return new NextResponse('Inviting user not found in database', {
        status: 404,
      });
    }

    const { role: invitingUserRole } = invitingUser;
    const { email, roleToAssign, redirectUrl } = await req.json();

    if (!email || !roleToAssign || !redirectUrl) {
      return new NextResponse('Missing required fields', { status: 400 });
    }


    if (invitingUserRole === Role.USER) {
      return new NextResponse('Users cannot send invitations', {
        status: 403,
      });
    }

    if (invitingUserRole === Role.AGENT && roleToAssign !== Role.USER) {
      return new NextResponse('Agents can only invite Users', {
        status: 403,
      });
    }

    const client = await clerkClient();
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: redirectUrl,
      publicMetadata: {
        role: roleToAssign, 
      },
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error('[INVITE_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
// lib/auth.ts

import { auth } from '@clerk/nextjs/server';
import {prisma} from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Securely fetches the role of the currently authenticated user
 * directly from the database.
 *
 * This function should be used in Server Components, API Routes, or
 * Server Actions to perform permission checks.
 *
 * @returns {Promise<Role | null>} The user's role, or null if not authenticated.
 */
export async function getCurrentUserRoleFromDB(): Promise<Role | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      role: true,
    },
  });


  return user?.role || null;
}
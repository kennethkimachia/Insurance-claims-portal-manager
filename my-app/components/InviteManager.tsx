// components/InviteManager.tsx (This is a Server Component)

import { Role } from '@prisma/client';
import { getCurrentUserRoleFromDB } from '@/lib/auth';
import { InviteForm } from './InviteForm';

export async function InviteManager() {
  const currentUserRole = await getCurrentUserRoleFromDB();


  const canInvite =
  currentUserRole === Role.ADMIN || currentUserRole === Role.AGENT;
  const canInviteAgents = currentUserRole === Role.ADMIN;


  if (!canInvite) {
    return null;
  }


  return <InviteForm canInviteAgents={canInviteAgents} />;
}
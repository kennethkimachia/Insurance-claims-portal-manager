"use server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function createAgent({ email, name }: { email: string; name: string }) {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "admin") throw new Error("Unauthorized");

  // Create agent in Clerk
const client = await clerkClient();
const clerkUser = await client.users.createUser({
  emailAddress: [email],
  publicMetadata: { role: "agent" },
});

  // Create agent in Prisma
  await prisma.user.create({
    data: {
      id: clerkUser.id,
      name,
      email,
      role: "agent",
    },
  });

  return clerkUser;
}
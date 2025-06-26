"use server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function createUser({ email, name }: { email: string; name: string }) {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "agent") throw new Error("Unauthorized");

  // Create user in Clerk
const client = await clerkClient();
const clerkUser = await client.users.createUser({
  emailAddress: [email],
  publicMetadata: { role: "user" },
});

  // Create user in Prisma
  await prisma.user.create({
    data: {
      id: clerkUser.id,
      name,
      email,
      role: "user",
    },
  });

  return clerkUser;
}

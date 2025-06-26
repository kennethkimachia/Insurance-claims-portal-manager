"use server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function createAgent({ email, name, password }: { email: string; name: string; password: string }) {
  const user = await currentUser();
  /* if (!user || user.publicMetadata.role !== "admin") throw new Error("Unauthorized"); */

  // Create agent in Clerk
const client = await clerkClient();
try {
const clerkUser = await client.users.createUser({
  emailAddress: [email],
  firstName: name,
  password,
  publicMetadata: { role: "agent" },
});

    // Create agent in Prisma
  await prisma.user.create({
    data: {
      id: clerkUser.id,
      name,
      email,
      role: "agent",
      // Do NOT store password in your database unless you are handling authentication yourself.
      // Clerk manages authentication, so you should NOT store the password here.
    },
  });

  return clerkUser;

} catch (error: any) {
  console.error("Clerk error:", error.errors || error);
  throw error;
}


}
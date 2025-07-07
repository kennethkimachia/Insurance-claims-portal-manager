"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function createUser(formData: FormData) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== "AGENT") {
    return { success: false, message: "Unauthorized" };
  }

const parsed = createUserSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return { success: false, message: "Invalid form data." };
  }
  const { email, password, firstName, lastName } = parsed.data;

  try {
    const newUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: password,
      firstName: firstName,
      lastName: lastName,      
      publicMetadata: {
        role: "USER",
      },
    });

    return { success: true, message: `User ${email} created successfully.` };
  } catch (error: any) {
    console.error("Error creating user:", error)

    const message =
      error.errors?.[0]?.longMessage || "An unknown error occurred.";
    return { success: false, message };
  }
}
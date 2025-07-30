import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default async function AdminDashboardPage() {
  const { orgRole } = await auth();

  if (orgRole !== "org:admin") {
    redirect(ROUTES.HOME); 
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Organization Admin!</p>
      {/* The form for creating Agents and Users goes here */}
    </div>
  );
}
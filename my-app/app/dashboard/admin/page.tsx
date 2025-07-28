import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default async function AdminDashboardPage() {
  const { orgRole } = await auth();

  // Only allow 'admin' role to access this page.
/*   if (orgRole !== "Admin") {
    redirect(ROUTES.HOME); // Redirect non-admins away
  } */

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Organization Admin!</p>
      {/* The form for creating Agents and Users goes here */}
    </div>
  );
}
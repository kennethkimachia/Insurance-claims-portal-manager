// app/admin/dashboard/page.tsx

import { auth } from "@clerk/nextjs/server";

export default async function AdminDashboardPage() {
  // Destructure all relevant properties from the auth() helper
  const { userId, orgId, orgRole, orgSlug } = await auth();

  // --- SERVER-SIDE LOGGING ---
  // This will print to the terminal where you ran "npm run dev"
  console.log("--- AUTHENTICATION STATE ---");
  console.log("User ID:", userId);
  console.log("Organization ID:", orgId);
  console.log("Organization Role:", orgRole);
  console.log("Organization Slug:", orgSlug);
  console.log("--------------------------");

  // We will temporarily display the state on the page as well.
  // The redirect is removed for now.
  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', lineHeight: '1.6' }}>
      <h1>Admin Dashboard - Diagnostic Mode</h1>
      <p>
        This page is for diagnosing the authentication state. Check your server
        terminal for detailed logs.
      </p>
      <hr style={{ margin: '20px 0' }} />
      <h2>Authentication State:</h2>
      <ul>
        <li><strong>User ID:</strong> {userId || "Not logged in"}</li>
        <li><strong>Organization ID:</strong> {orgId || "Not in an organization session"}</li>
        <li><strong>Organization Role:</strong> {orgRole || "No organization role"}</li>
        <li><strong>Organization Slug:</strong> {orgSlug || "No organization slug"}</li>
      </ul>
    </div>
  );
}
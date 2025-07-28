"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTES } from "lib/routes";

export default function OrgSelectionPage() {
  // 1. Use Clerk's official hooks to get user data and control functions.
  const { user, isLoaded } = useUser();
  const { setActive } = useClerk();
  const router = useRouter();

  const handleSelectOrg = async (orgId: string) => {
    // This should not happen, but it's a good safeguard.
    if (!setActive) return;

    try {
      // 2. This is THE official Clerk function to update the session
      //    and set the active organization. This is the core of the solution.
      await setActive({
        organization: orgId,
      });

      // 3. After the session is activated, redirect the user.
      //    We can now reliably check their role and send them to the right place.
      const membership = user?.organizationMemberships.find(
        (m) => m.organization.id === orgId
      );

      switch (membership?.role) {
        case "admin":
          router.push(ROUTES.ADMIN_DASHBOARD);
          break;
        case "agent":
          router.push(ROUTES.AGENT_DASHBOARD);
          break;
        default:
          router.push(ROUTES.USER_DASHBOARD);
          break;
      }
    } catch (err) {
      console.error("Error setting active organization", err);
    }
  };

  // Show a loading state while Clerk initializes.
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If the user has only one organization, we can be smart and activate it for them.
  if (user?.organizationMemberships.length === 1) {
    const org = user.organizationMemberships[0];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Welcome to {org.organization.name}
          </h1>
          <p className="text-md text-gray-600 mb-6">
            Click below to continue to your dashboard.
          </p>
          <button
            onClick={() => handleSelectOrg(org.organization.id)}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // If the user has multiple organizations, show them a list to choose from.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Select Your Organization
        </h1>
        <div className="space-y-4 mt-6">
          {user?.organizationMemberships.map((membership) => (
            <button
              key={membership.organization.id}
              onClick={() => handleSelectOrg(membership.organization.id)}
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {membership.organization.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
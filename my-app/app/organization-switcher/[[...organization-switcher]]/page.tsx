"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTES } from "lib/routes";
import type { OrganizationMembershipResource } from "@clerk/types";
import SessionResource from "@clerk/types"

export default function OrgSelectionPage() {
  const { user, isLoaded } = useUser();
  const { setActive } = useClerk();
  const router = useRouter();

  const handleSelectOrg = async (orgId: string) => {
    if (!setActive) return;

    try {
      const newSession = await setActive({
        organization: orgId,
      });

      if (!newSession) {
        console.error("Failed to set new session.");
        return;
      }
      const membership: OrganizationMembershipResource | undefined =
        newSession.user.organizationMemberships.find(
          (m: OrganizationMembershipResource) => m.organization.id === orgId,
        );

      console.log("Selected Membership Info:", membership);
      switch (membership?.role) {
        case "org:admin":
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

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
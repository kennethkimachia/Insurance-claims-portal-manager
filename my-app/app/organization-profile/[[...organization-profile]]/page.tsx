// app/organization-profile/[[...organization-profile]]/page.tsx
import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationProfilePage() {
  return (
    <div className="flex items-center justify-center py-12">
      <OrganizationProfile />
    </div>
  );
}
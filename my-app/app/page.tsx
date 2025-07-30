import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";


export default async function Home() {

  const {orgRole} = await auth()

  switch (orgRole) {
        case "org:admin":
          redirect(ROUTES.ADMIN_DASHBOARD);
          break;
        case "org:agent":
          redirect(ROUTES.AGENT_DASHBOARD);
          break;
        default:
          redirect(ROUTES.USER_DASHBOARD);
          break;
      }

  return (

    <div>


    </div>
  );
}
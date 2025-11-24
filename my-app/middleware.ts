import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROUTES } from "./lib/routes";

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const isPublicRoute = createRouteMatcher([
  `${ROUTES.SIGN_IN}(.*)`,
  `${ROUTES.SIGN_UP}(.*)`,
  "/api/webhooks/clerk",
]);

const isProtectedRoute = createRouteMatcher([
  `${ROUTES.ADMIN_DASHBOARD}(.*)`,
  `${ROUTES.AGENT_DASHBOARD}(.*)`,
  `${ROUTES.USER_DASHBOARD}(.*)`,
  `${ROUTES.INVITATION_FORM}`,
  `${ROUTES.HOME}`,
]);

const onAdminDashboard = createRouteMatcher([`${ROUTES.ADMIN_DASHBOARD}(.*)`]);
const onAgentDashboard = createRouteMatcher([`${ROUTES.AGENT_DASHBOARD}(.*)`]);
const onUserDashboard = createRouteMatcher([`${ROUTES.USER_DASHBOARD}(.*)`]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, has, redirectToSignIn } = await auth();
  const url = req.nextUrl;

  if (isPublicRoute(req)) return NextResponse.next();

  if (!userId && isProtectedRoute(req)) {
    if (PUBLIC_BASE_URL) {
      const returnUrl = new URL(req.nextUrl.pathname, PUBLIC_BASE_URL).toString();
      return redirectToSignIn({ returnBackUrl: returnUrl });
    }
    return redirectToSignIn({ returnBackUrl: req.url }); 
  }

  if (userId) {
    const isAdmin = has({ role: "org:admin" });
    const isAgent = has({ role: "org:agent" });

    const roleDashboard = isAdmin
      ? ROUTES.ADMIN_DASHBOARD
      : isAgent
      ? ROUTES.AGENT_DASHBOARD
      : ROUTES.USER_DASHBOARD; 

    if (url.pathname === "/" || url.pathname === ROUTES.HOME) {
      const destPath = roleDashboard;

      const destUrl = PUBLIC_BASE_URL 
        ? new URL(destPath, PUBLIC_BASE_URL) 
        : new URL(destPath, req.url);       
      
      if (destUrl.pathname !== url.pathname) {
          console.log(`Redirecting root to: ${destUrl.href}`); 
          return NextResponse.redirect(destUrl);
      }
    }

    const buildRedirect = (destination: string) => {
        return PUBLIC_BASE_URL
            ? new URL(destination, PUBLIC_BASE_URL)
            : new URL(destination, req.url);
    };


    if (onAdminDashboard(req) && !isAdmin) {
        return NextResponse.redirect(buildRedirect(roleDashboard));
    }
    
    if (onAgentDashboard(req) && !(isAgent || isAdmin)) {
        return NextResponse.redirect(buildRedirect(roleDashboard));
    }

  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api/webhooks/clerk",
    "/api|trpc)(.*)",
  ],
};
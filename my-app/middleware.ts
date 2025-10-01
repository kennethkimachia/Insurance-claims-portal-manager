import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROUTES } from "./lib/routes";

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
const onUserDashboard  = createRouteMatcher([`${ROUTES.USER_DASHBOARD}(.*)`]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, has, redirectToSignIn } = await auth();
  const url = req.nextUrl;

  if (isPublicRoute(req)) return NextResponse.next();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    const isAdmin  = has({ role: "org:admin" });
    const isAgent  = has({ role: "org:agent" });
    const isMember = has({ role: "org:member" }); 

    const roleDashboard = isAdmin
      ? ROUTES.ADMIN_DASHBOARD
      : isAgent
      ? ROUTES.AGENT_DASHBOARD
      : ROUTES.USER_DASHBOARD;

    if (url.pathname === "/" || url.pathname === ROUTES.HOME) {
      const dest = new URL(roleDashboard, req.url);
      if (dest.pathname !== url.pathname) return NextResponse.redirect(dest);
    }

    if (onAdminDashboard(req) && !isAdmin) {
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }
    if (onAgentDashboard(req) && !(isAgent || isAdmin)) {
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }
 
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Everything except static files and Next internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

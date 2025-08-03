// middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROUTES } from "./lib/routes"; // Import our routes

const isPublicRoute = createRouteMatcher([
  `${ROUTES.SIGN_IN}(.*)`,
  `${ROUTES.SIGN_UP}(.*)`,
  "/api/webhooks/clerk",

]);

const isProtectedRoute = createRouteMatcher([
  `${ROUTES.ADMIN_DASHBOARD}(.*)`,
  `${ROUTES.AGENT_DASHBOARD}(.*)`,
  `${ROUTES.USER_DASHBOARD}(.*)`,
  `${ROUTES.ORG_SELECTION}(.*)`,
  `${ROUTES.INVITATION_FORM}`,
  `${ROUTES.HOME}`,
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth();

  // 1. If the user is logged out and trying to access a protected route,
  //    redirect them to the sign-in page.
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL(ROUTES.SIGN_IN, req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 2. If the user is logged in but has NO active organization,
  //    AND they are trying to access a protected route,
  //    force them to the organization selection page.
  if (userId && !orgId && isProtectedRoute(req)) {
    const orgSelectionUrl = new URL(ROUTES.ORG_SELECTION, req.url);
    return NextResponse.redirect(orgSelectionUrl);
  }

  // 3. If the user IS logged in and tries to visit a public route,
  //    redirect them to their specific dashboard based on their role.
  if (userId && isPublicRoute(req)) {
    let path = ROUTES.ORG_SELECTION; // Default path

    switch (orgRole) {
      case "admin":
        path = ROUTES.ADMIN_DASHBOARD;
        break;
      case "agent":
        path = ROUTES.AGENT_DASHBOARD;
        break;
      case "user":
        path = ROUTES.USER_DASHBOARD;
        break;
    }

    const absoluteUrl = new URL(path, req.url);
    return NextResponse.redirect(absoluteUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
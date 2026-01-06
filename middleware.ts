import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
    
    // Check admin access for admin routes
    if (isAdminRoute(req)) {
      // Bypass check for local development
      if (process.env.NODE_ENV === "development" && process.env.SKIP_ADMIN_CHECK === "true") {
        return;
      }

      const { orgRole } = await auth();
      if (orgRole !== "org:admin" && orgRole !== "org:owner") {
        // Redirect non-admins away from admin routes
        return Response.redirect(new URL("/listings", req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};

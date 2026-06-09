import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Route-level RBAC. /admin requires ADMIN, /coach requires COACH+, /app requires sign-in.
export default auth((req) => {
  const { nextUrl } = req;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const signedIn = !!req.auth?.user;

  const needsAuth = ["/app", "/coach", "/host", "/admin"].some((p) =>
    nextUrl.pathname.startsWith(p)
  );
  if (needsAuth && !signedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return Response.redirect(new URL("/app", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/coach") && !["COACH", "ADMIN"].includes(role ?? "")) {
    return Response.redirect(new URL("/app", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/host") && !["HOST", "ADMIN"].includes(role ?? "")) {
    return Response.redirect(new URL("/app", nextUrl));
  }
});

export const config = {
  matcher: [
    // Skip auth middleware for static/SEO surfaces (CiteForge-style GEO paths).
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|sw\\.js|swe-worker|manifest\\.webmanifest|icons/|llms\\.txt|llms-full\\.txt|robots\\.txt|sitemap\\.xml).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add your IP addresses in .env as: ALLOWED_IPS=::1,127.0.0.1,your-ip-here
const ALLOWED_IPS = (process.env.ALLOWED_IPS || "::1,127.0.0.1")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

// Set to true to skip IP check (useful during development)
const SKIP_IP_CHECK = process.env.NODE_ENV === "development";

export function proxy(request: NextRequest) {
  // Only apply to admin routes (both pages and API)
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    // Skip login/logout API endpoints
    if (
      request.nextUrl.pathname === "/api/admin/login" ||
      request.nextUrl.pathname === "/api/admin/logout"
    ) {
      return NextResponse.next();
    }

    // Get client IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    console.log(`[Admin Access] IP: ${ip} - Path: ${request.nextUrl.pathname}`);

    // First check: IP whitelist (skip in development if configured)
    if (!SKIP_IP_CHECK && !ALLOWED_IPS.includes(ip)) {
      console.log(`[BLOCKED] IP not in whitelist: ${ip}`);

      // Return 404 for both API and pages (mysterious approach)
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    // Second check: Authentication cookie (skip for login page)
    if (request.nextUrl.pathname !== "/admin/login") {
      const authCookie = request.cookies.get("admin_auth");
      if (!authCookie || authCookie.value !== "authenticated") {
        console.log(`[404] No valid auth cookie - page not found`);

        // Return 404 for unauthorized access (mysterious approach)
        return NextResponse.rewrite(new URL("/404", request.url));
      }
    }

    console.log(`[ALLOWED] Access granted`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

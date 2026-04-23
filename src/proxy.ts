import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// Add your IP addresses in .env as: ALLOWED_IPS=::1,127.0.0.1,your-ip-here
const ALLOWED_IPS = (process.env.ALLOWED_IPS || "::1,127.0.0.1")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

// Set to true to skip IP check (useful during development)
const SKIP_IP_CHECK = process.env.NODE_ENV === "development";

// JWT secret key - should be set in .env
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Token expiration time
const TOKEN_EXPIRY = "15m";

export async function proxy(request: NextRequest) {
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
      // Return 404 for both API and pages (mysterious approach)
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    // Second check: JWT Authentication (skip for login page)
    if (request.nextUrl.pathname !== "/admin/login") {
      const token = await getJwtFromRequest(request);

      if (!token) {
        console.log(`[404] No JWT token found - page not found`);
        return NextResponse.rewrite(new URL("/404", request.url));
      }

      try {
        await jwtVerify(token, JWT_SECRET);
        console.log(`[ALLOWED] Valid JWT token`);
      } catch (error) {
        console.log(`[BLOCKED] Invalid JWT token: ${error}`);
        return NextResponse.rewrite(new URL("/404", request.url));
      }
    }

    console.log(`[ALLOWED] Access granted`);
  }

  return NextResponse.next();
}

/**
 * Extract JWT token from request - checks Authorization header first, then cookies
 */
async function getJwtFromRequest(request: NextRequest): Promise<string | null> {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookie
  const authCookie = request.cookies.get("admin_auth");
  if (authCookie?.value) {
    // Cookie may contain just the token or a serialized object
    try {
      // Try parsing as JSON first (for backward compatibility)
      const parsed = JSON.parse(authCookie.value);
      return parsed.token || null;
    } catch {
      // If not JSON, treat the value as the token directly
      return authCookie.value;
    }
  }

  return null;
}

/**
 * Generate a new JWT token for authenticated users
 */
export async function generateJwtToken(
  payload: Record<string, unknown> = {},
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

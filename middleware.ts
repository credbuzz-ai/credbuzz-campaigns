import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);
  const referralCode = searchParams.get("referral_code");

  // Only modify the response for the home page with referral code
  if (pathname === "/" && referralCode) {
    const response = NextResponse.next();

    // Get the base URL from environment or fallback
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.headers.get("host");

    // Update Open Graph meta tags for referral links
    const html = response.headers.get("content-type")?.includes("text/html");
    if (html) {
      response.headers.set(
        "x-og-image",
        `${baseUrl}/api/og?referral_code=${referralCode}`
      );
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};

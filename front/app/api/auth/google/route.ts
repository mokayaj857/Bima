import { NextRequest, NextResponse } from "next/server";

// Set this to your Strapi backend URL, or use an environment variable
const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_GOOGLE_CONNECT = `${STRAPI_URL}/api/connect/google`;

export async function GET(req: NextRequest) {
  try {
    // If this is a callback from Strapi with user data, handle it
    const searchParams = req.nextUrl.searchParams;
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const jwt = searchParams.get("jwt");

    console.log("Google OAuth callback params:", { accessToken, refreshToken, jwt });

    if (jwt) {
      // If we have a JWT from Strapi, redirect to dashboard with it
      const response = NextResponse.redirect(new URL(`/connect/google/redirect?jwt=${jwt}`, req.url));
      return response;
    }

    if (accessToken) {
      // If we have access token, redirect to our handler
      const response = NextResponse.redirect(new URL(`/connect/google/redirect?access_token=${accessToken}`, req.url));
      if (refreshToken) {
        // Store refresh token as httpOnly cookie
        response.cookies.set("refresh_token", refreshToken, { 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 // 7 days
        });
      }
      return response;
    }

    // Otherwise, start the OAuth flow by redirecting to Strapi
    console.log("Starting Google OAuth flow, redirecting to:", STRAPI_GOOGLE_CONNECT);
    return NextResponse.redirect(STRAPI_GOOGLE_CONNECT);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/auth/sign-in?error=google-error", req.url));
  }
}


import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { access_token, id_token } = body;

    console.log("Exchanging Google tokens for JWT...");

    if (!access_token && !id_token) {
      return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
    }

    // Get user info from Google
    if (access_token) {
      try {
        const googleUserResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);

        if (googleUserResponse.ok) {
          const googleUser = await googleUserResponse.json();
          console.log("Google user data:", googleUser);

          // Authenticate with our server
          const serverResponse = await fetch(`${SERVER_URL}/api/auth/google/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: googleUser.email,
              googleId: googleUser.id,
              username: googleUser.name || googleUser.email.split('@')[0],
            }),
          });

          if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            console.log("Server auth success:", serverData);

            return NextResponse.json({
              jwt: serverData.token,
              user: serverData.user
            });
          }
        }
      } catch (error) {
        console.log("Token exchange failed:", error);
      }
    }

    return NextResponse.json({ error: 'Failed to exchange tokens' }, { status: 400 });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

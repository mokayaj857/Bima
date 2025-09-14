import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { access_token, id_token } = body;

    if (!access_token && !id_token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Use the access_token to get user info from Google
    const googleUserResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
    
    if (!googleUserResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const googleUser = await googleUserResponse.json();
    console.log("Google user info:", googleUser);

    // Now authenticate with our server using the Google user info
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

    if (!serverResponse.ok) {
      const errorText = await serverResponse.text();
      console.error("Failed to authenticate user on server:", errorText);
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
    }

    const userData = await serverResponse.json();
    console.log("Server user data:", userData);

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

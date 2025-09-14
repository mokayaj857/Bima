import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

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

    // Now authenticate with Strapi using the Google user info
    // First, try to find existing user
    let strapiResponse = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: googleUser.email,
        password: `google-${googleUser.id}`, // Use Google ID as password
      }),
    });

    let userData;

    if (!strapiResponse.ok) {
      // User doesn't exist, create new user
      strapiResponse = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: googleUser.email.split('@')[0] + '_' + googleUser.id,
          email: googleUser.email,
          password: `google-${googleUser.id}`,
          provider: 'google',
          confirmed: true,
        }),
      });

      if (!strapiResponse.ok) {
        const errorText = await strapiResponse.text();
        console.error("Failed to create user in Strapi:", errorText);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    userData = await strapiResponse.json();
    console.log("Strapi user data:", userData);

    return NextResponse.json({
      jwt: userData.jwt,
      user: userData.user,
    });

  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

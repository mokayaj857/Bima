import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { access_token, id_token } = body;

    console.log("Exchanging Google tokens for Strapi JWT...");
    
    if (!access_token && !id_token) {
      return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
    }

    // Method 1: Try to authenticate with Google access token via Strapi
    if (access_token) {
      try {
        const strapiResponse = await fetch(`${STRAPI_URL}/api/auth/google/callback?access_token=${access_token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (strapiResponse.ok) {
          const strapiData = await strapiResponse.json();
          console.log("Strapi auth success:", strapiData);
          
          if (strapiData.jwt) {
            return NextResponse.json({ 
              jwt: strapiData.jwt, 
              user: strapiData.user 
            });
          }
        }
      } catch (error) {
        console.log("Method 1 failed, trying method 2...");
      }
    }

    // Method 2: Try direct user creation/authentication using Google user info
    if (access_token) {
      try {
        // First, get user info from Google
        const googleUserResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
        
        if (googleUserResponse.ok) {
          const googleUser = await googleUserResponse.json();
          console.log("Google user data:", googleUser);

          // Try to find or create user in Strapi
          const strapiAuthResponse = await fetch(`${STRAPI_URL}/api/auth/google/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: access_token,
              id_token: id_token,
            }),
          });

          if (strapiAuthResponse.ok) {
            const strapiData = await strapiAuthResponse.json();
            console.log("Strapi manual auth success:", strapiData);
            
            if (strapiData.jwt) {
              return NextResponse.json({ 
                jwt: strapiData.jwt, 
                user: strapiData.user 
              });
            }
          }
        }
      } catch (error) {
        console.log("Method 2 failed:", error);
      }
    }

    return NextResponse.json({ error: 'Failed to exchange tokens' }, { status: 400 });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

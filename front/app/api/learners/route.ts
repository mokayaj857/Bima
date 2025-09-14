import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    // First, get the authenticated user
    const token = authorization.replace('Bearer ', '');
  const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user data' }, { status: 401 });
    }

    const userData = await userResponse.json();
    console.log('Authenticated user:', userData);

    const body = await req.json();
    console.log('Creating learner with data:', body);

    // Add the user relation to the profile data (Strapi v5 expects connect with documentId)
    const profileData = {
      ...body,
      data: {
        ...body.data,
        user: {
          connect: [
            { id: userData.documentId }
          ]
        }
      }
    };

    console.log('Profile data with user relation:', profileData);

    const response = await fetch(`${STRAPI_URL}/api/learners`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    console.log('Strapi response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strapi error response:', errorText);
      return NextResponse.json({ 
        error: 'Failed to create learner profile', 
        details: errorText,
        status: response.status,
        url: `${STRAPI_URL}/api/learners`
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Successfully created learner:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating learner profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const response = await fetch(`${STRAPI_URL}/api/learners?populate=*`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch learners' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching learners:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

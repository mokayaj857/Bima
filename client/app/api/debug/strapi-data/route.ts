import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    // Fetch raw user data from Strapi
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return NextResponse.json({ 
        error: 'Failed to fetch user from Strapi',
        status: userResponse.status,
        details: errorText,
        strapiUrl: `${STRAPI_URL}/api/users/me?populate=*`
      }, { status: userResponse.status });
    }

    const userData = await userResponse.json();

    // Also try to fetch learner and educator profiles
    const additionalData = {
      learners: null,
      educators: null,
    };

    try {
      const learnersResponse = await fetch(`${STRAPI_URL}/api/learners?populate=*`, {
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
      });
      if (learnersResponse.ok) {
        additionalData.learners = await learnersResponse.json();
      }
    } catch (error) {
      console.log('Could not fetch learners:', error);
    }

    try {
      const educatorsResponse = await fetch(`${STRAPI_URL}/api/educators?populate=*`, {
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
      });
      if (educatorsResponse.ok) {
        additionalData.educators = await educatorsResponse.json();
      }
    } catch (error) {
      console.log('Could not fetch educators:', error);
    }

    return NextResponse.json({
      message: 'Raw Strapi data',
      strapiUrl: STRAPI_URL,
      user: userData,
      additional: additionalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching raw Strapi data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      strapiUrl: STRAPI_URL
    }, { status: 500 });
  }
}

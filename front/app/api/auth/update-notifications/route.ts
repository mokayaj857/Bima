import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function PUT(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const notificationSettings = await req.json();

    // First get the current user to get their ID
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: userResponse.status });
    }

    const userData = await userResponse.json();

    // Update notification settings
    const updateResponse = await fetch(`${STRAPI_URL}/api/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationSettings: notificationSettings,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      return NextResponse.json({ 
        error: 'Failed to update notification settings', 
        details: errorText 
      }, { status: updateResponse.status });
    }

    const updatedUser = await updateResponse.json();
    return NextResponse.json({ 
      message: 'Notification settings updated successfully',
      settings: notificationSettings 
    });

  } catch (error) {
    console.error('Notification settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

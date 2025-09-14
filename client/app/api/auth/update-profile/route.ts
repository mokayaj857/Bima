import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function PUT(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const profileData = await req.json();

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

    // Only include fields that are different from current values
    const updateData: any = {};
    
    if (profileData.username && profileData.username !== userData.username) {
      updateData.username = profileData.username;
    }
    
    if (profileData.email && profileData.email !== userData.email) {
      updateData.email = profileData.email;
    }
    
    // If no changes, return success without making API call
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        message: 'No changes detected',
        user: userData 
      });
    }

    // Update user profile using the correct endpoint with actual user ID
    const updateResponse = await fetch(`${STRAPI_URL}/api/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Update profile error:', errorText);
      
      // Handle specific errors
      if (updateResponse.status === 400) {
        let errorMessage = 'Invalid data provided';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // Keep default message
        }
        
        return NextResponse.json({ 
          error: errorMessage
        }, { status: 400 });
      }
      
      if (updateResponse.status === 403) {
        return NextResponse.json({ 
          error: 'Permission denied. Please make sure you have permission to update your profile.' 
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to update profile', 
        details: errorText 
      }, { status: updateResponse.status });
    }

    const updatedUser = await updateResponse.json();
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    // Fetch from backend
    const userResponse = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      return NextResponse.json(userData);
    } else {
      const errorData = await userResponse.json();
      return NextResponse.json(errorData, { status: userResponse.status });
    }
  } catch (error) {
    console.error('Backend connection failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from "next/server";

// Helper to get user id from session/auth (replace with your real auth logic)
async function getUserId(req: NextRequest): Promise<string | null> {
  // TODO: Replace with real authentication/session logic
  // For now, fallback to a static user id for demo
  return '1';
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== BOOKMARK POST REQUEST ===');
    const { courseId, action } = await request.json();
    console.log('Request body:', { courseId, action });

    const userId = await getUserId(request);
    console.log('User ID:', userId);

    if (!courseId || !userId) {
      console.log('Missing required fields:', { courseId, userId });
      return NextResponse.json({ error: "Course ID and user authentication required" }, { status: 400 });
    }

    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    console.log('Strapi URL:', strapiUrl);

    // Find existing user-course
    const findUrl = `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&filters[course][id][$eq]=${courseId}`;
    console.log('Finding existing user-course:', findUrl);

    const findRes = await fetch(findUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Find response status:', findRes.status);
    const findData = await findRes.json();
    console.log('Find response data:', findData);

    const existing = findData.data?.[0];
    console.log('Existing user-course:', existing);

    if (action === 'toggle') {
      if (existing) {
        // Toggle bookmarked

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = await getUserId(request);

    if (!courseId || !userId) {
      return NextResponse.json({ error: "Course ID and user authentication required" }, { status: 400 });
    }

    const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

    // Check if user-course exists and is bookmarked
    const res = await fetch(
      `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&filters[course][id][$eq]=${courseId}&filters[bookmarked][$eq]=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await res.json();
    const isBookmarked = data.data && data.data.length > 0;

    return NextResponse.json({ bookmarked: isBookmarked });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';

// Helper to get user id from session/auth (replace with your real auth logic)
async function getUserId(req: NextRequest): Promise<string | null> {
  // TODO: Replace with real authentication/session logic
  // For now, fallback to a static user id for demo
  return '1';
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

  // Fetch enrolled courses
  const enrolledRes = await fetch(
    `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&populate=course`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const enrolledData = await enrolledRes.json();

  // Map enrolled to dashboard format
  const enrolled = (enrolledData.data || []).map((entry: any) => {
    const course = entry.attributes?.course?.data?.attributes || {};
    return {
      id: entry.attributes?.course?.data?.id,
      title: course.title || 'Untitled',
      subtitle: course.description || '',
      readTime: course.readTime || '',
      color: 'bg-blue-100',
    };
  });

  // Fetch bookmarks (user-courses where bookmarked=true)
  const bookmarksRes = await fetch(
    `${strapiUrl}/api/user-courses?filters[user][id][$eq]=${userId}&filters[bookmarked][$eq]=true&populate=course`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const bookmarksData = await bookmarksRes.json();
  const bookmarks = (bookmarksData.data || []).map((entry: any) => {
    const course = entry.attributes?.course?.data?.attributes || {};
    return {
      id: entry.attributes?.course?.data?.id,
      title: course.title || 'Untitled',
      subtitle: course.description || '',
      readTime: course.readTime || '',
      color: 'bg-green-100',
    };
  });

  // Fetch drafts (courses created by user with published_at=null)
  const draftsRes = await fetch(
    `${strapiUrl}/api/courses?filters[users][id][$eq]=${userId}&filters[published_at][$null]=true&populate=*`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const draftsData = await draftsRes.json();
  const drafts = (draftsData.data || []).map((course: any) => ({
    id: course.id,
    title: course.attributes?.title || 'Untitled',
    subtitle: course.attributes?.description || '',
    readTime: course.attributes?.readTime || '',
    color: 'bg-yellow-100',
  }));

  // Fetch published (courses created by user with published_at!=null)
  const publishedRes = await fetch(
    `${strapiUrl}/api/courses?filters[users][id][$eq]=${userId}&filters[published_at][$notNull]=true&populate=*`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const publishedData = await publishedRes.json();
  const published = (publishedData.data || []).map((course: any) => ({
    id: course.id,
    title: course.attributes?.title || 'Untitled',
    subtitle: course.attributes?.description || '',
    readTime: course.attributes?.readTime || '',
    color: 'bg-purple-100',
  }));

  return NextResponse.json({
    enrolled,
    bookmarks,
    drafts,
    published,
    subscriptions: [] // TODO: Implement subscriptions
  });
}

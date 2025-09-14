import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const STRAPI_PREVIEW = process.env.STRAPI_PREVIEW === "true";
const STRAPI_COURSES_PATH = process.env.STRAPI_COURSES_PATH || "/api/courses";
const STRAPI_LESSONS_PATH = process.env.STRAPI_LESSONS_PATH || "/api/lessons";

export const dynamic = "force-dynamic";

function buildMediaUrl(baseUrl: string, url?: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${baseUrl}${url}`;
}

function extractMediaUrl(baseUrl: string, candidate: any): string {
  if (!candidate) return "";
  // v4 relation shape
  if (candidate.data) {
    const data = Array.isArray(candidate.data) ? candidate.data : [candidate.data];
    for (const d of data) {
      const u = d?.attributes?.formats?.thumbnail?.url || d?.attributes?.url;
      if (u) return buildMediaUrl(baseUrl, u);
    }
    return "";
  }
  // v5 flattened
  if (Array.isArray(candidate)) {
    for (const d of candidate) {
      const u = d?.formats?.thumbnail?.url || d?.url || d?.attributes?.url;
      if (u) return buildMediaUrl(baseUrl, u);
    }
    return "";
  }
  const url = candidate?.formats?.thumbnail?.url || candidate?.url || candidate?.attributes?.url;
  return buildMediaUrl(baseUrl, url);
}

function normalizeAttrs<T = any>(raw: any): T {
  return raw?.attributes ? (raw.attributes as T) : (raw as T);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const draftQuery = STRAPI_PREVIEW ? "&publicationState=preview" : "";
    const qsPopulate = "populate=*";
    const isNumericId = /^\d+$/.test(id);
    const courseFilter = isNumericId
      ? `filters[id][$eq]=${encodeURIComponent(id)}`
      : `filters[documentId][$eq]=${encodeURIComponent(id)}`;

    const courseUrl = `${STRAPI_URL}${STRAPI_COURSES_PATH}?${courseFilter}&${qsPopulate}${draftQuery}`;
    const lessonsUrl = `${STRAPI_URL}${STRAPI_LESSONS_PATH}?filters[course][id][$eq]=${encodeURIComponent(
      id
    )}&${qsPopulate}${draftQuery}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    };

    const courseRes = await fetch(courseUrl, { headers, cache: "no-store" });

    if (!courseRes.ok) {
      const details = await courseRes.text();
      return NextResponse.json(
        { error: "Failed to fetch course", status: courseRes.status, url: courseUrl, details },
        { status: courseRes.status }
      );
    }

    const coursePayload = await courseRes.json();

    const courseData = Array.isArray(coursePayload?.data) ? coursePayload.data[0] : coursePayload?.data;
    if (!courseData) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const courseAttrs = normalizeAttrs<any>(courseData);

    // pick media field (imagescontent preferred)
    const imageUrl = extractMediaUrl(
      STRAPI_URL,
      courseAttrs.imagescontent || courseAttrs.image || courseAttrs.cover || courseAttrs.thumbnail || courseAttrs.banner
    );

    const course = {
      id: String(courseData?.id ?? ""),
      title: courseAttrs.title || courseAttrs.name || courseAttrs.type_of_courses || "Untitled",
      category:
        (typeof courseAttrs.category === "string" && courseAttrs.category) ||
        courseAttrs.type_of_courses ||
        (Array.isArray(courseAttrs.category?.data)
          ? courseAttrs.category?.data?.[0]?.attributes?.name
          : courseAttrs.category?.data?.attributes?.name) ||
        "Uncategorized",
      date: courseAttrs.publishedAt || courseAttrs.createdAt || "",
      readTime: courseAttrs.readTime || "",
      image: imageUrl || "",
      content: courseAttrs.content || courseAttrs.description || courseAttrs.body || courseAttrs.text || courseAttrs.overview || "",
    };

    // 1) Try lessons from populated course relation
    let lessons: any[] = [];
    const courseLessons = (courseAttrs as any).lessons || (courseAttrs as any).Lessons;
    if (courseLessons) {
      const relationData = Array.isArray(courseLessons?.data) ? courseLessons.data : courseLessons;
      const arr = Array.isArray(relationData) ? relationData : relationData?.data ? [relationData.data] : [];
      lessons = arr.map((l: any) => ({ id: l?.id, attributes: l?.attributes || l }));
    }

    // 2) If empty, try querying the Lessons CT with several possible relation keys
    const mapLessons = (rawArr: any[]) => rawArr.map((l) => {
      const a = normalizeAttrs<any>(l);
      const media = extractMediaUrl(STRAPI_URL, a.imagescontent || a.image || a.cover || a.thumbnail || a.banner);
      
      // Enhanced content extraction - try multiple possible content fields
      const content = a.content || a.body || a.description || a.text || a.lesson_content || a.micro || "";
      
      return {
        id: String(l?.id ?? ""),
        title: a.micro || a.title || a.name || a.heading || `Lesson ${l?.id}`,
        content: content,
        image: media || "",
        order: a.order || a.position || a.index || 0,
      };
    });

    let finalLessons = mapLessons(lessons);

    if (finalLessons.length === 0) {
      const envKey = process.env.STRAPI_LESSONS_RELATION_KEY;
      const relationKeys = envKey && envKey.trim() !== ''
        ? [envKey]
        : ["course", "courses", "course_id", "courseId", "parent", "courseRef"];

      const courseId = String(courseData?.id ?? id);
      const courseDocId = (courseData as any)?.documentId || (courseAttrs as any)?.documentId || '';

      for (const key of relationKeys) {
        // Try by numeric id
        const urlById = `${STRAPI_URL}${STRAPI_LESSONS_PATH}?filters[${key}][id][$eq]=${encodeURIComponent(courseId)}&${qsPopulate}${draftQuery}`;
        const r1 = await fetch(urlById, { headers, cache: "no-store" });
        if (r1.ok) {
          const json1 = await r1.json();
          const dataArr1: any[] = json1?.data || [];
          finalLessons = mapLessons(dataArr1);
        }
        if (finalLessons.length > 0) break;

        // Try by documentId (Strapi v5)
        if (courseDocId) {
          const urlByDoc = `${STRAPI_URL}${STRAPI_LESSONS_PATH}?filters[${key}][documentId][$eq]=${encodeURIComponent(courseDocId)}&${qsPopulate}${draftQuery}`;
          const r2 = await fetch(urlByDoc, { headers, cache: "no-store" });
          if (r2.ok) {
            const json2 = await r2.json();
            const dataArr2: any[] = json2?.data || [];
            finalLessons = mapLessons(dataArr2);
          }
          if (finalLessons.length > 0) break;
        }
      }
    }

    // sort lessons by order then id
    finalLessons.sort((a, b) => (a.order as number) - (b.order as number) || Number(a.id) - Number(b.id));

    return NextResponse.json({ course, lessons: finalLessons });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



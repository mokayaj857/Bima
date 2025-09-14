import { NextResponse } from "next/server";

type StrapiMedia = {
  data?: {
    attributes?: {
      url?: string;
      formats?: Record<string, { url: string } | undefined>;
    } | null;
  } | null;
};

type StrapiRelation<T> = {
  data?: { id: number; attributes?: T | null } | { id: number; attributes?: T | null }[] | null;
};

type StrapiCourseAttributes = Record<string, unknown> & {
  title?: string;
  content?: string;
  description?: string;
  body?: string;
  readTime?: string;
  shareText?: string;
  articleSections?: string[];
  publishedAt?: string;
  createdAt?: string;
  category?: string | StrapiRelation<{ name?: string }>;
  image?: StrapiMedia;
  cover?: StrapiMedia;
  thumbnail?: StrapiMedia;
  banner?: StrapiMedia;
  author?: StrapiRelation<{ name?: string }>;
  educator?: StrapiRelation<{ name?: string; fullName?: string; username?: string }>;
  user?: StrapiRelation<{ username?: string; email?: string; name?: string }>;
};

type StrapiItem<T> = {
  id: number;
  attributes?: T | null;
};

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const STRAPI_PREVIEW = process.env.STRAPI_PREVIEW === "true";
const STRAPI_COURSES_PATH = process.env.STRAPI_COURSES_PATH || "/api/courses"; // allow override if UID/path differs

function buildMediaUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}

function pickFirstMediaUrl(candidate: unknown): string {
  const extractV4 = (entry: any): string | undefined => {
    const url = entry?.attributes?.formats?.thumbnail?.url || entry?.attributes?.url;
    return url ? buildMediaUrl(url) : undefined;
  };
  const extractV5 = (entry: any): string | undefined => {
    const url = entry?.formats?.thumbnail?.url || entry?.url || entry?.attributes?.url;
    return url ? buildMediaUrl(url) : undefined;
  };
  const anyVal: any = candidate as any;
  if (!anyVal) return "";
  // Strapi v4 relation-like { data: {...} | [...] }
  if (anyVal.data) {
    const data = Array.isArray(anyVal.data) ? anyVal.data : [anyVal.data];
    for (const d of data) {
      const u = extractV4(d);
      if (u) return u;
    }
    return "";
  }
  // Strapi v5 flattened object or array of objects
  if (Array.isArray(anyVal)) {
    for (const d of anyVal) {
      const u = extractV5(d);
      if (u) return u;
    }
    return "";
  }
  return extractV5(anyVal) || "";
}

function pickImage(attrs: StrapiCourseAttributes): string {
  const keys = ["imagescontent", "image", "cover", "thumbnail", "banner"] as const;
  for (const key of keys) {
    const url = pickFirstMediaUrl((attrs as any)[key]);
    if (url) return url;
  }
  return "";
}

function pickAuthorName(attrs: StrapiCourseAttributes): string {
  const getSingle = (rel: any): any => (Array.isArray(rel?.data) ? rel?.data?.[0] : rel?.data);
  const edu = getSingle((attrs as any).educator)?.attributes;
  const aut = getSingle((attrs as any).author)?.attributes;
  const usr = getSingle((attrs as any).user)?.attributes;
  return edu?.name || edu?.fullName || edu?.username || aut?.name || usr?.name || usr?.username || "";
}

function pickCategory(attrs: StrapiCourseAttributes): string {
  const a: any = attrs as any;
  // direct string or v5 flattened custom field like type_of_courses
  if (typeof a.category === "string" && a.category) return a.category;
  if (typeof a.type_of_courses === "string" && a.type_of_courses) return a.type_of_courses;
  const cat: any = a.category;
  if (!cat) return "Uncategorized";
  const getSingle = (rel: any): any => (Array.isArray(rel?.data) ? rel?.data?.[0] : rel?.data);
  const rel = getSingle(cat);
  const name = rel?.attributes?.name || rel?.name;
  return name || "Uncategorized";
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const query = new URLSearchParams({ populate: "*" }).toString();

    const draftQuery = STRAPI_PREVIEW ? "&publicationState=preview" : "";
    const effectiveUrl = `${STRAPI_URL}${STRAPI_COURSES_PATH}?${query}${draftQuery}`;
    const res = await fetch(effectiveUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      // Ensure we always hit Strapi on request in dev
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Failed to fetch from Strapi",
          status: res.status,
          url: effectiveUrl,
          usedToken: Boolean(STRAPI_TOKEN),
          details: text,
        },
        { status: res.status }
      );
    }

    const payload = await res.json();
    const items: any[] = payload?.data || [];

    const courses = items.map((item: any) => {
      // Strapi v4: item.attributes; Strapi v5: fields flattened on item
      const attrs = ((item && item.attributes) ? item.attributes : item) as any as StrapiCourseAttributes;
      const authorName = pickAuthorName(attrs);
      const imageUrl = pickImage(attrs);
      const categoryName = pickCategory(attrs);
      const content = (attrs as any).content || (attrs as any).description || (attrs as any).body || "";
      let readTime = (attrs as any).readTime || "";
      if (!readTime && typeof content === "string" && content) {
        const words = content.trim().split(/\s+/).length;
        const mins = Math.max(1, Math.round(words / 200));
        readTime = `${mins} min read`;
      }
      const title = (attrs as any).title || (attrs as any).name || (attrs as any).type_of_courses || `Course ${item?.id}`;

      return {
        id: String(item?.id ?? ""),
        category: categoryName,
        title,
        date: (attrs as any).publishedAt || (attrs as any).createdAt || "",
        readTime,
        image: imageUrl,
        content: typeof content === "string" ? content : "",
        author: { name: authorName },
        shareText: (attrs as any).shareText || "",
        articleSections: Array.isArray((attrs as any).articleSections) ? (attrs as any).articleSections as string[] : [],
        relatedArticles: [],
      };
    });

    const categorySet = new Set<string>();
    for (const c of courses) {
      if (c.category) categorySet.add(c.category);
    }
    const categories = Array.from(categorySet).map((name) => ({ category: name }));

    return NextResponse.json({ categories, courses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: message,
        url: `${STRAPI_URL}${STRAPI_COURSES_PATH}`,
        usedToken: Boolean(STRAPI_TOKEN),
      },
      { status: 500 }
    );
  }
}



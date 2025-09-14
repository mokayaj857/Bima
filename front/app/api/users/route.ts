import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export async function GET() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/users`, {
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({
        error: "Failed to fetch users from Strapi",
        status: res.status,
        details: text,
      }, { status: res.status });
    }

    const users = await res.json();
    return NextResponse.json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      error: message,
      url: `${STRAPI_URL}/api/users`,
      usedToken: Boolean(STRAPI_TOKEN),
    }, { status: 500 });
  }
}

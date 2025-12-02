// // app/api/google/events/route.ts
// import { NextResponse } from "next/server";
// import { auth } from "@/auth";

// export async function GET() {
//   const session = await auth();
//   if (!session?.accessToken) {
//     return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
//   }

//   const now = new Date();
//   const timeMin = now.toISOString();
//   const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

//   const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
//   url.searchParams.set("singleEvents", "true");
//   url.searchParams.set("orderBy", "startTime");
//   url.searchParams.set("timeMin", timeMin);
//   url.searchParams.set("timeMax", in30);
//   url.searchParams.set("maxResults", "2500");

//   const res = await fetch(url.toString(), {
//     headers: { Authorization: `Bearer ${session.accessToken}` },
//     cache: "no-store",
//   });

//   if (res.status === 401 || res.status === 403) {
//     return NextResponse.json({ error: "FORBIDDEN_OR_SCOPE", status: res.status }, { status: res.status });
//   }

//   const data = await res.json();
//   return NextResponse.json({ items: data.items ?? [] });
// }

// app/api/google/events/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createEvent, listEvents } from "@/lib/google";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId") || "primary";
  const q = searchParams.get("q") || undefined;

  const items = await listEvents(session.user.id as string, { calendarId, q });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const body = await req.json();
    // очікуємо: { calendarId, summary, start:{dateTime|date}, end:{dateTime|date}, ... }
    const created = await createEvent(session.user.id as string, body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "CREATE_FAILED", detail: String(e?.message ?? e) }, { status: 500 });
  }
}

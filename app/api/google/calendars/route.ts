// app/api/google/calendars/route.ts
import { auth } from "@/auth";
import { listCalendars } from "@/lib/google";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const items = await listCalendars((session.user as any).id);
  return Response.json({ items });
}
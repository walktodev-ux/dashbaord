// app/api/google/events/[id]/route.ts
import { auth } from "@/auth";
import { updateEvent, deleteEvent } from "@/lib/google";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const updated = await updateEvent((session.user as any).id, params.id, body);
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  await deleteEvent((session.user as any).id, params.id);
  return new Response(null, { status: 204 });
}

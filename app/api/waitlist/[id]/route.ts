// app/api/waitlist/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WaitlistStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id ?? "";

  const form = await req.formData();
  const method = (String(form.get("_method") || "PATCH")).toUpperCase();

  // захист від чужих записів
  const item = await prisma.waitlistItem.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (method === "DELETE") {
    await prisma.waitlistItem.delete({ where: { id: params.id } });
  } else {
    const status = String(form.get("status") || "PENDING") as keyof typeof WaitlistStatus;
    const note = (form.get("note") as string | null) ?? null;
    await prisma.waitlistItem.update({
      where: { id: params.id },
      data: { status: WaitlistStatus[status] ?? WaitlistStatus.PENDING, note },
    });
  }

  return NextResponse.redirect(new URL("/dashboard", req.url), { status: 303 });
}

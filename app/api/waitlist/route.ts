// app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WaitlistStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id ?? "";

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim() || null;
  const phone = String(form.get("phone") ?? "").trim() || null;
  const note = String(form.get("note") ?? "").trim() || null;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await prisma.waitlistItem.create({
    data: { name, email, phone, note, userId, status: WaitlistStatus.PENDING },
  });

  return NextResponse.redirect(new URL("/dashboard", req.url), { status: 303 });
}

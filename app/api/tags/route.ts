import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      include: {
        todos: true,
      }
    });

    return NextResponse.json(tags);
  } catch (e: any) {
    console.error("GET /api/tags ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const tag = await prisma.tag.create({
    data: {
      userId: session.user.id,
      name: body.name,
    }
  });

  return NextResponse.json(tag);
}



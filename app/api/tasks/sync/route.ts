import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listGoogleTasks } from "@/lib/googleTasks";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // 1. Отримуємо задачі Google
  const gTasks = await listGoogleTasks(userId);

  for (const t of gTasks) {
    if (!t.id) continue;

    await prisma.todo.upsert({
      where: { googleId: t.id },
      update: {
        title: t.title ?? "",
        note: t.notes ?? "",
        due: t.due ? new Date(t.due) : null,
        done: t.status === "completed",
      },
      create: {
        userId,
        googleId: t.id,
        title: t.title ?? "",
        note: t.notes ?? "",
        due: t.due ? new Date(t.due) : undefined,
        done: t.status === "completed",
      },
    });
  }

  return NextResponse.json({ synced: gTasks.length });
}

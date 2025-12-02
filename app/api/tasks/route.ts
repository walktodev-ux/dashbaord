import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createGoogleTask } from "@/lib/googleTasks";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const tasks = await prisma.todo.findMany({
    where: { userId: session.user.id },
    include: {
      tags: {
        include: { tag: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // 1. Створюємо в Google Tasks
  let google: any = null;
  try {
    google = await createGoogleTask(session.user.id, {
      title: body.title,
      notes: body.note,
      due: body.due ? new Date(body.due).toISOString() : undefined,
    });
  } catch (e) {
    console.error("GoogleTask error", e);
  }

  // 2. Створюємо локально
  const todo = await prisma.todo.create({
    data: {
      userId: session.user.id,
      title: body.title,
      note: body.note,
      due: body.due ? new Date(body.due) : null,
      recurrence: body.recurrence,
      googleId: google?.id ?? null,
    },
    include: {
      tags: { include: { tag: true } }
    }
  });

  // 3. Прив’язуємо теги
  if (body.tagIds?.length > 0) {
    await prisma.todoTag.createMany({
      data: body.tagIds.map((tagId: string) => ({
        todoId: todo.id,
        tagId,
      }))
    });
  }

  return NextResponse.json(todo);
}

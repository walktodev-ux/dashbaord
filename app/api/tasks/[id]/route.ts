import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateGoogleTask, deleteGoogleTask } from "@/lib/googleTasks";

export async function PATCH(req: Request, { params }: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const todo = await prisma.todo.findUnique({ where: { id: params.id } });
  if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Google sync
  if (todo.googleId) {
    try {
      await updateGoogleTask(session.user.id, todo.googleId, {
        title: body.title,
        notes: body.note,
        due: body.due,
        status: body.done ? "completed" : "needsAction",
      });
    } catch (e) {
      console.error("Google Sync Failed", e);
    }
  }

  const updated = await prisma.todo.update({
    where: { id: params.id },
    data: {
      done: body.done,
      title: body.title,
      note: body.note,
      due: body.due ? new Date(body.due) : null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todo = await prisma.todo.findUnique({ where: { id: params.id } });
  if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (todo.googleId) {
    try {
      await deleteGoogleTask(session.user.id, todo.googleId);
    } catch (e) {
      console.error("Google delete failed", e);
    }
  }

  await prisma.todo.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}


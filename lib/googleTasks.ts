import { prisma } from "@/lib/prisma";
import { getValidGoogleAccessToken } from "@/lib/google"; // ми використовуємо існуючий refresh-логіку

const TASKS_BASE = "https://tasks.googleapis.com/tasks/v1";

/* ------------------------------
   Отримати список задач
--------------------------------- */
export async function listGoogleTasks(userId: string) {
  const access = await getValidGoogleAccessToken(userId);

  const res = await fetch(`${TASKS_BASE}/lists/@default/tasks`, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());

  const json = await res.json();
  return json.items ?? [];
}

/* ------------------------------
   Створення задачі
--------------------------------- */
export async function createGoogleTask(
  userId: string,
  input: {
    title: string;
    notes?: string;
    due?: string;     // ISO date
  }
) {
  const access = await getValidGoogleAccessToken(userId);

  const body: any = { title: input.title };
  if (input.notes) body.notes = input.notes;
  if (input.due) body.due = input.due;

  const res = await fetch(`${TASKS_BASE}/lists/@default/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

/* ------------------------------
   Оновлення задачі
--------------------------------- */
export async function updateGoogleTask(
  userId: string,
  taskId: string,
  updates: any
) {
  const access = await getValidGoogleAccessToken(userId);

  const res = await fetch(
    `${TASKS_BASE}/lists/@default/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

/* ------------------------------
   Видалення задачі
--------------------------------- */
export async function deleteGoogleTask(userId: string, taskId: string) {
  const access = await getValidGoogleAccessToken(userId);

  const res = await fetch(
    `${TASKS_BASE}/lists/@default/tasks/${taskId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${access}` } }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error(await res.text());
  }

  return true;
}

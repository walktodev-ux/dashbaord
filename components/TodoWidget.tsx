"use client";

import { useEffect, useState } from "react";
import { Plus, Tag as TagIcon, Check, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type Recurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

type Tag = {
    id: string;
    name: string;
    color?: string;
};

type Todo = {
    id: string;
    title: string;
    note?: string;
    due?: string;
    done: boolean;
    recurrence: Recurrence;
    googleId?: string;
    tags: { tag: Tag }[];
};

// Форматування
function formatDate(d?: string) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "short"
    });
}

export default function TodoWidget() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [note, setNote] = useState("");
    const [due, setDue] = useState("");
    const [recurrence, setRecurrence] = useState<Recurrence>("NONE");

    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // ------------------------ LOAD ------------------------
    useEffect(() => {
        loadTodos();
        loadTags();
    }, []);

    async function loadTodos() {
        setLoading(true);
        const res = await fetch("/api/tasks");
        const data = await res.json();
        setTodos(data);
        setLoading(false);
    }

    async function loadTags() {
        try {
            const res = await fetch("/api/tags");
            if (!res.ok) {
                console.warn("Tags API returned:", res.status);
                setTags([]);
                return;
            }

            const txt = await res.text(); // читаємо текст
            if (!txt) {
                setTags([]);
                return;
            }

            const data = JSON.parse(txt); // парсимо вручну
            setTags(data);
        } catch (e) {
            console.error("loadTags error", e);
            setTags([]);
        }
    }


    // ---------------------- CREATE ------------------------
    async function createTodo() {
        if (!title.trim()) return;

        const res = await fetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify({
                title,
                note,
                due,
                recurrence,
                tagIds: selectedTags,
            })
        });

        await loadTodos();

        setTitle("");
        setNote("");
        setDue("");
        setRecurrence("NONE");
        setSelectedTags([]);
    }

    // ---------------------- MARK DONE ---------------------
    async function toggleDone(id: string, done: boolean) {
        await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ done })
        });

        loadTodos();
    }

    // ------------------------------------------------------

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-700">Задачі</h2>
                    <p className="text-sm text-slate-500">Усі ваші задачі та нагадування</p>
                </div>
                <button
                    onClick={createTodo}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                >
                    <Plus className="size-4" /> Додати
                </button>
            </div>

            {/* New task form */}
            <div className="rounded-xl border bg-white p-4 space-y-3 shadow-sm">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Нова задача…"
                />

                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Нотатка (необовʼязково)…"
                />

                <div className="flex items-center gap-3">
                    <div>
                        <label className="text-xs text-slate-500">Дедлайн</label>
                        <input
                            type="date"
                            value={due}
                            onChange={(e) => setDue(e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-500">Повтор</label>
                        <select
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                            className="border rounded-md px-2 py-1 text-sm"
                        >
                            <option value="NONE">Ніколи</option>
                            <option value="DAILY">Щодня</option>
                            <option value="WEEKLY">Щотижня</option>
                            <option value="MONTHLY">Щомісяця</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500">Теги</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {tags.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() =>
                                        setSelectedTags((prev) =>
                                            prev.includes(t.id)
                                                ? prev.filter((x) => x !== t.id)
                                                : [...prev, t.id]
                                        )
                                    }
                                    className={cn(
                                        "px-2 py-1 rounded-md text-xs border",
                                        selectedTags.includes(t.id)
                                            ? "bg-violet-600 text-white"
                                            : "bg-white text-slate-600"
                                    )}
                                >
                                    #{t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks list */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center text-slate-400 py-6">Завантаження…</div>
                ) : todos.length === 0 ? (
                    <div className="text-center text-slate-400 py-6">
                        У вас ще немає задач.
                    </div>
                ) : (
                    todos.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => toggleDone(t.id, !t.done)}
                                    className={cn(
                                        "h-5 w-5 rounded border flex items-center justify-center",
                                        t.done
                                            ? "bg-green-600 border-green-600 text-white"
                                            : "border-slate-300 text-transparent"
                                    )}
                                >
                                    <Check className="size-4" />
                                </button>

                                <div className="flex-1">
                                    <div
                                        className={cn(
                                            "font-medium",
                                            t.done ? "line-through text-slate-400" : "text-slate-700"
                                        )}
                                    >
                                        {t.title}
                                    </div>

                                    {t.note && (
                                        <div className="text-sm text-slate-500 mt-1">
                                            {t.note}
                                        </div>
                                    )}

                                    {(t.due || t.tags.length > 0) && (
                                        <div className="flex items-center gap-3 mt-2">
                                            {t.due && (
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                    <CalendarDays className="size-3" />
                                                    {formatDate(t.due)}
                                                </span>
                                            )}

                                            {t.tags.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                    <TagIcon className="size-3" />
                                                    {t.tags.map((tg) => tg.tag.name).join(", ")}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

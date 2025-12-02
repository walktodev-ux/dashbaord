"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";

type Props = {
    calendarId: string;
    onCreated: () => void;
    onClose: () => void;
};

export default function NewEventModal({ calendarId, onCreated, onClose }: Props) {
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [startDateTime, setStartDateTime] = useState<Date | null>(null);
    const [endDateTime, setEndDateTime] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!summary.trim()) {
            setError("Вкажи назву події.");
            return;
        }
        if (!startDateTime || !endDateTime) {
            setError("Заповни дату й час початку та завершення.");
            return;
        }
        if (endDateTime <= startDateTime) {
            setError("Час завершення має бути пізніше за початок.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/google/events", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    calendarId,
                    summary,
                    description: description || undefined,
                    start: { dateTime: startDateTime.toISOString() },
                    end: { dateTime: endDateTime.toISOString() },
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }

            await res.json();
            onCreated(); // перезавантажуємо список подій у батьківському компоненті
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Не вдалося створити подію");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-700">Нова подія</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-slate-400">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Назва
                        </label>
                        <input
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Назва події"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Опис (необов’язково)
                        </label>
                        <textarea
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Короткий опис"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Початок
                            </label>
                            <DatePicker
                                selected={startDateTime}
                                onChange={(date) => setStartDateTime(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd.MM.yyyy HH:mm"
                                placeholderText="дд.мм.рррр гг:хх"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Завершення
                            </label>
                            <DatePicker
                                selected={endDateTime}
                                onChange={(date) => setEndDateTime(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="dd.MM.yyyy HH:mm"
                                placeholderText="дд.мм.рррр гг:хх"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                minDate={startDateTime || undefined}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-rose-600">{error}</p>}

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            disabled={loading}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? "Створюю…" : "Створити"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

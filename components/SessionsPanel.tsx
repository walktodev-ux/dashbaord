"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";

const LOCALE = "uk-UA";
const TIME_ZONE = "Europe/Kyiv";

export type UIEvent = {
    id?: string;
    summary?: string;
    description?: string;
    htmlLink?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
};

/* ---------- helpers ---------- */
function useFormatters() {
    const timeFmt = useMemo(
        () =>
            new Intl.DateTimeFormat(LOCALE, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: TIME_ZONE,
            }),
        []
    );
    const dayHeadingFmt = useMemo(
        () =>
            new Intl.DateTimeFormat(LOCALE, {
                weekday: "long",
                day: "2-digit",
                month: "long",
                timeZone: TIME_ZONE,
            }),
        []
    );
    const dateKeyFmt = useMemo(
        () =>
            new Intl.DateTimeFormat("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: TIME_ZONE,
            }),
        []
    );
    return { timeFmt, dayHeadingFmt, dateKeyFmt };
}

function dateKey(d: Date, df: Intl.DateTimeFormat) {
    return df.format(d); // YYYY-MM-DD
}
function mondayOfWeek(d: Date) {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7; // 0 = Mon
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
}
function sundayOfWeek(mon: Date) {
    const s = new Date(mon);
    s.setDate(s.getDate() + 7);
    return s;
}
function isTimed(s?: string) {
    return Boolean(s && s.includes("T"));
}
function minutesBetween(s?: string, e?: string) {
    if (!isTimed(s)) return undefined;
    const ds = s ? new Date(s).getTime() : 0;
    const de = e ? new Date(e).getTime() : 0;
    if (!ds || !de) return undefined;
    return Math.max(0, Math.round((de - ds) / 60000));
}
function fmtRange(s?: string, e?: string, tf?: Intl.DateTimeFormat) {
    if (!isTimed(s)) return "Весь день";
    const ds = new Date(s!);
    const de = new Date(e ?? s!);
    return `${tf!.format(ds)}–${tf!.format(de)}`;
}

/* ---------- component ---------- */
export default function SessionsPanel({
    events,
    nowIso,
    title = "Сесії",
}: {
    events: UIEvent[];
    nowIso: string;
    title?: string;
}) {
    const [mode, setMode] = useState<"today" | "week">("today");
    const { timeFmt, dayHeadingFmt, dateKeyFmt } = useFormatters();

    const now = useMemo(() => new Date(nowIso), [nowIso]);
    const mon = useMemo(() => mondayOfWeek(now), [now]);
    const sun = useMemo(() => sundayOfWeek(mon), [mon]);
    const todayKey = useMemo(() => dateKey(now, dateKeyFmt), [now, dateKeyFmt]);

    const eventsToday = useMemo(() => {
        const list = events.filter((e) => {
            const s = e.start?.dateTime ?? e.start?.date;
            return s && dateKey(new Date(s), dateKeyFmt) === todayKey;
        });
        list.sort((a, b) => {
            const as = new Date(a.start?.dateTime ?? a.start?.date ?? 0).getTime();
            const bs = new Date(b.start?.dateTime ?? b.start?.date ?? 0).getTime();
            return as - bs;
        });
        return list;
    }, [events, todayKey, dateKeyFmt]);

    // 7-денні колонки
    const weekCols = useMemo(() => {
        const cols: { key: string; label: string; items: UIEvent[] }[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            cols.push({
                key: dateKey(d, dateKeyFmt),
                label: dayHeadingFmt.format(d),
                items: [],
            });
        }
        for (const ev of events) {
            const s = ev.start?.dateTime ?? ev.start?.date;
            if (!s) continue;
            const d = new Date(s);
            if (d >= mon && d < sun) {
                const k = dateKey(d, dateKeyFmt);
                const col = cols.find((c) => c.key === k);
                if (col) col.items.push(ev);
            }
        }
        for (const c of cols) {
            c.items.sort((a, b) => {
                const as = new Date(a.start?.dateTime ?? a.start?.date ?? 0).getTime();
                const bs = new Date(b.start?.dateTime ?? b.start?.date ?? 0).getTime();
                return as - bs;
            });
        }
        return cols;
    }, [events, mon, sun, dateKeyFmt, dayHeadingFmt]);

    return (
        <div className="p-5 bg-white">
            {/* header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center justify-center rounded-xl p-2 ring-1 bg-violet-50 text-violet-700 ring-violet-100">
                        <CalendarDays className="size-5" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
                    <span className="text-sm text-slate-500 hidden sm:inline">
                        {mode === "today" ? "Заплановані на сьогодні" : "Сесії цього тижня"}
                    </span>
                </div>

                <div className="inline-flex rounded-lg border bg-white ml-auto">
                    <button
                        type="button"
                        onClick={() => setMode("today")}
                        className={
                            "px-3 py-1.5 text-sm rounded-l-lg " +
                            (mode === "today" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50")
                        }
                    >
                        Сьогодні
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("week")}
                        className={
                            "px-3 py-1.5 text-sm rounded-r-lg border-l " +
                            (mode === "week" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50")
                        }
                    >
                        Тиждень
                    </button>
                </div>
            </div>

            {/* content */}
            {mode === "today" ? (
                <ul className="space-y-3">
                    {eventsToday.length === 0 && (
                        <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                            На сьогодні нічого не заплановано.
                        </li>
                    )}
                    {eventsToday.slice(0, 12).map((ev) => {
                        const s = ev.start?.dateTime ?? ev.start?.date;
                        const e = ev.end?.dateTime ?? ev.end?.date;
                        const dur = minutesBetween(s, e);
                        return (
                            <li key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="font-medium text-slate-700">{ev.summary ?? "Без назви"}</div>
                                    <div className="text-sm text-slate-500" suppressHydrationWarning>
                                        {fmtRange(s, e, timeFmt)}
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="size-4" />
                                        {isTimed(s) ? "Заплановано" : "Весь день"}
                                    </span>
                                    {dur ? <span>• {dur} хв</span> : null}
                                </div>
                                {ev.description ? (
                                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{ev.description}</p>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                // ---- ГРИД 1/2/4/7 колонок ----
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {weekCols.map((col) => (
                        <div key={col.key} className="rounded-xl border border-slate-200 bg-white">
                            {/* sticky заголовок у колонці */}
                            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur px-3 py-2 rounded-t-xl border-b">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {col.label}
                                </div>
                            </div>

                            <ul className="p-3 space-y-3 min-h-[220px]">
                                {col.items.length === 0 ? (
                                    <li className="text-xs text-slate-400 border border-dashed rounded-lg p-3 text-center">
                                        Немає сесій
                                    </li>
                                ) : (
                                    col.items.map((ev) => {
                                        const s = ev.start?.dateTime ?? ev.start?.date;
                                        const e = ev.end?.dateTime ?? ev.end?.date;
                                        const dur = minutesBetween(s, e);
                                        return (
                                            <li
                                                key={ev.id}
                                                className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition"
                                            >
                                                <div className="text-sm font-medium text-slate-700 truncate">
                                                    {ev.summary ?? "Без назви"}
                                                </div>
                                                <div className="mt-1 flex flex-col justify-between text-xs text-slate-500">
                                                    <span suppressHydrationWarning>{fmtRange(s, e, timeFmt)}</span>
                                                    {dur ? <span>• {dur} хв</span> : null}
                                                </div>
                                                {ev.description ? (
                                                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                                                ) : null}
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

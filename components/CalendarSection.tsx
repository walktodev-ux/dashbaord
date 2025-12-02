// "use client";

// import { useState, useEffect } from "react";
// import CalendarToolbar from "@/components/CalendarToolbar";
// import NewEventModal from "@/components/NewEventModal";
// import { toDateOnlyKey, getMonthMatrix } from "@/lib/calendar";
// import type { CalendarEvent } from "@/lib/google";

// export default function CalendarSection({ userId }: { userId: string }) {
//     const [calendarId, setCalendarId] = useState("primary");
//     const [events, setEvents] = useState<CalendarEvent[]>([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [query, setQuery] = useState("");
//     const now = new Date();

//     const load = async (q?: string, calId?: string) => {
//         const url = new URL("/api/google/events", window.location.origin);
//         const cid = calId ?? calendarId;

//         if (cid !== "primary") url.searchParams.set("calendarId", cid);
//         if (q) url.searchParams.set("q", q);

//         const res = await fetch(url.toString());
//         const data = await res.json();
//         setEvents(data.items || []);
//     };

//     useEffect(() => {
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [calendarId]);

//     const y = now.getFullYear();
//     const m = now.getMonth();
//     const weeks = getMonthMatrix(y, m);

//     const byDate = new Map<string, CalendarEvent[]>();
//     for (const ev of events) {
//         const s = ev.start?.dateTime ?? ev.start?.date;
//         if (!s) continue;
//         const d = new Date(s);
//         const key = toDateOnlyKey(d);
//         if (!byDate.has(key)) byDate.set(key, []);
//         byDate.get(key)!.push(ev);
//     }

//     return (
//         <div className="space-y-4">
//             <CalendarToolbar
//                 onCalendarChange={(id) => {
//                     setCalendarId(id);
//                     load(query, id);
//                 }}
//                 onSearch={(q) => {
//                     setQuery(q);
//                     load(q);
//                 }}
//                 onCreate={() => setIsModalOpen(true)}   // ← відкриваємо модалку
//             />

//             {/* СІТКА КАЛЕНДАРЯ */}
//             <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-slate-200">
//                 {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
//                     <div
//                         key={d}
//                         className="bg-white p-2 text-center text-xs font-medium text-slate-500"
//                     >
//                         {d}
//                     </div>
//                 ))}

//                 {weeks.flat().map(({ date, inCurrentMonth }) => {
//                     const key = toDateOnlyKey(date);
//                     const dayEvents = byDate.get(key) ?? [];
//                     const isToday = key === toDateOnlyKey(now);

//                     return (
//                         <div
//                             key={key}
//                             className={[
//                                 "min-h-28 bg-white p-2 text-slate-500",
//                                 inCurrentMonth ? "" : "opacity-50",
//                                 isToday ? "ring-2 ring-violet-500" : "",
//                             ].join(" ")}
//                         >
//                             <div className="text-xs font-medium">{date.getDate()}</div>
//                             <div className="mt-2 space-y-1">
//                                 {dayEvents.slice(0, 3).map((ev) => (
//                                     <a
//                                         key={ev.id}
//                                         href={ev.htmlLink ?? "#"}
//                                         target="_blank"
//                                         className="block truncate rounded-md border px-2 py-1 text-xs hover:bg-violet-50"
//                                     >
//                                         {ev.start?.dateTime
//                                             ? new Date(ev.start.dateTime).toLocaleTimeString([], {
//                                                 hour: "2-digit",
//                                                 minute: "2-digit",
//                                             })
//                                             : "Весь день"}{" "}
//                                         · {ev.summary ?? "Без назви"}
//                                     </a>
//                                 ))}
//                                 {dayEvents.length > 3 && (
//                                     <div className="text-xs text-slate-400">
//                                         +{dayEvents.length - 3} ще…
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* МОДАЛКА — тільки коли isModalOpen === true */}
//             {isModalOpen && (
//                 <NewEventModal
//                     calendarId={calendarId}
//                     onCreated={async () => {
//                         await load(query);
//                         setIsModalOpen(false);
//                     }}
//                     onClose={() => setIsModalOpen(false)}
//                 />
//             )}
//         </div>
//     );
// }

// // components/CalendarSection.tsx
// "use client";

// import { useState, useEffect } from "react";
// import CalendarToolbar from "@/components/CalendarToolbar";
// import NewEventModal from "@/components/NewEventModal";
// import { toDateOnlyKey, getMonthMatrix } from "@/lib/calendar";
// import type { CalendarEvent } from "@/lib/google";

// /** ===== хелпери для дат ===== **/

// type ViewMode = "week" | "month" | "year";

// function startOfWeek(d: Date) {
//     const date = new Date(d);
//     const weekday = (date.getDay() + 6) % 7; // Пн=0
//     date.setDate(date.getDate() - weekday);
//     date.setHours(0, 0, 0, 0);
//     return date;
// }

// function endOfWeek(d: Date) {
//     const start = startOfWeek(d);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 7);
//     end.setHours(23, 59, 59, 999);
//     return end;
// }

// function startOfMonth(d: Date) {
//     const date = new Date(d.getFullYear(), d.getMonth(), 1);
//     date.setHours(0, 0, 0, 0);
//     return date;
// }

// function endOfMonth(d: Date) {
//     const date = new Date(d.getFullYear(), d.getMonth() + 1, 0);
//     date.setHours(23, 59, 59, 999);
//     return date;
// }

// function startOfYear(d: Date) {
//     const date = new Date(d.getFullYear(), 0, 1);
//     date.setHours(0, 0, 0, 0);
//     return date;
// }

// function endOfYear(d: Date) {
//     const date = new Date(d.getFullYear(), 11, 31);
//     date.setHours(23, 59, 59, 999);
//     return date;
// }

// function getViewRange(date: Date, view: ViewMode) {
//     if (view === "week") return { start: startOfWeek(date), end: endOfWeek(date) };
//     if (view === "month") return { start: startOfMonth(date), end: endOfMonth(date) };
//     return { start: startOfYear(date), end: endOfYear(date) };
// }

// /** ===== сам календар ===== **/

// export default function CalendarSection({ userId }: { userId: string }) {
//     const [calendarId, setCalendarId] = useState("primary");
//     const [events, setEvents] = useState<CalendarEvent[]>([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [query, setQuery] = useState("");
//     const [view, setView] = useState<ViewMode>("month");
//     const [currentDate, setCurrentDate] = useState(() => new Date());

//     const now = new Date();

//     // завантаження подій під обраний діапазон
//     const load = async (q?: string) => {
//         const { start, end } = getViewRange(currentDate, view);

//         const url = new URL("/api/google/events", window.location.origin);
//         url.searchParams.set("timeMin", start.toISOString());
//         url.searchParams.set("timeMax", end.toISOString());
//         if (calendarId !== "primary") url.searchParams.set("calendarId", calendarId);
//         if (q) url.searchParams.set("q", q);

//         const res = await fetch(url);
//         const data = await res.json();
//         setEvents(data.items || []);
//     };

//     useEffect(() => {
//         load(query);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [calendarId, view, currentDate]);

//     // групуємо події по даті
//     const byDate = new Map<string, CalendarEvent[]>();
//     for (const ev of events) {
//         const s = ev.start?.dateTime ?? ev.start?.date;
//         if (!s) continue;
//         const d = new Date(s);
//         const key = toDateOnlyKey(d);
//         if (!byDate.has(key)) byDate.set(key, []);
//         byDate.get(key)!.push(ev);
//     }

//     // перемикання періодів
//     const handlePrev = () => {
//         setCurrentDate((prev) => {
//             const d = new Date(prev);
//             if (view === "month") d.setMonth(d.getMonth() - 1);
//             else if (view === "week") d.setDate(d.getDate() - 7);
//             else d.setFullYear(d.getFullYear() - 1);
//             return d;
//         });
//     };

//     const handleNext = () => {
//         setCurrentDate((prev) => {
//             const d = new Date(prev);
//             if (view === "month") d.setMonth(d.getMonth() + 1);
//             else if (view === "week") d.setDate(d.getDate() + 7);
//             else d.setFullYear(d.getFullYear() + 1);
//             return d;
//         });
//     };

//     const handleToday = () => {
//         setCurrentDate(new Date());
//     };

//     // дані для month-view
//     const y = currentDate.getFullYear();
//     const m = currentDate.getMonth();
//     const weeks = getMonthMatrix(y, m);
//     const monthLabel = currentDate.toLocaleDateString("uk-UA", {
//         month: "long",
//         year: "numeric",
//     });

//     const renderDayCell = (date: Date, inCurrentMonth: boolean) => {
//         const key = toDateOnlyKey(date);
//         const dayEvents = byDate.get(key) ?? [];
//         const isToday = key === toDateOnlyKey(now);

//         return (
//             <div
//                 key={key + String(inCurrentMonth)}
//                 className={[
//                     "min-h-28 bg-white p-2 text-slate-500",
//                     inCurrentMonth ? "" : "opacity-50",
//                     isToday ? "ring-2 ring-violet-500" : "",
//                 ].join(" ")}
//             >
//                 <div className="text-xs font-medium">{date.getDate()}</div>
//                 <div className="mt-2 space-y-1">
//                     {dayEvents.slice(0, 3).map((ev) => (
//                         <a
//                             key={ev.id}
//                             href={ev.htmlLink ?? "#"}
//                             target="_blank"
//                             className="block truncate rounded-md border px-2 py-1 text-xs hover:bg-violet-50"
//                         >
//                             {ev.start?.dateTime
//                                 ? new Date(ev.start.dateTime).toLocaleTimeString([], {
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                 })
//                                 : "Весь день"}{" "}
//                             · {ev.summary ?? "Без назви"}
//                         </a>
//                     ))}
//                     {dayEvents.length > 3 && (
//                         <div className="text-xs text-slate-400">
//                             +{dayEvents.length - 3} ще…
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     // тиждень
//     const renderWeekGrid = () => {
//         const start = startOfWeek(currentDate);
//         const days: Date[] = [];
//         for (let i = 0; i < 7; i++) {
//             const d = new Date(start);
//             d.setDate(start.getDate() + i);
//             days.push(d);
//         }

//         return (
//             <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-slate-200">
//                 {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
//                     <div
//                         key={d}
//                         className="bg-white p-2 text-center text-xs font-medium text-slate-500"
//                     >
//                         {d}
//                     </div>
//                 ))}
//                 {days.map((d) => renderDayCell(d, true))}
//             </div>
//         );
//     };

//     // місяць
//     const renderMonthGrid = () => (
//         <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-slate-200">
//             {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
//                 <div
//                     key={d}
//                     className="bg-white p-2 text-center text-xs font-medium text-slate-500"
//                 >
//                     {d}
//                 </div>
//             ))}
//             {weeks.flat().map(({ date, inCurrentMonth }) =>
//                 renderDayCell(date, inCurrentMonth)
//             )}
//         </div>
//     );

//     // рік
//     const renderYearGrid = () => {
//         const year = currentDate.getFullYear();
//         const months = Array.from({ length: 12 }, (_, i) => i);

//         const eventsByMonth = new Map<number, CalendarEvent[]>();
//         for (const ev of events) {
//             const s = ev.start?.dateTime ?? ev.start?.date;
//             if (!s) continue;
//             const d = new Date(s);
//             if (d.getFullYear() !== year) continue;
//             const monthIdx = d.getMonth();
//             if (!eventsByMonth.has(monthIdx)) eventsByMonth.set(monthIdx, []);
//             eventsByMonth.get(monthIdx)!.push(ev);
//         }

//         return (
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {months.map((monthIdx) => {
//                     const label = new Date(year, monthIdx, 1).toLocaleDateString("uk-UA", {
//                         month: "long",
//                     });
//                     const monthEvents = eventsByMonth.get(monthIdx) ?? [];
//                     return (
//                         <div
//                             key={monthIdx}
//                             className="rounded-xl border border-slate-200 bg-white p-3"
//                         >
//                             <div className="text-sm font-semibold text-slate-700 capitalize">
//                                 {label}
//                             </div>
//                             <div className="mt-1 text-xs text-slate-500">
//                                 Подій: {monthEvents.length}
//                             </div>
//                             <ul className="mt-2 space-y-1 text-xs text-slate-600 max-h-28 overflow-y-auto">
//                                 {monthEvents.slice(0, 5).map((ev) => (
//                                     <li key={ev.id} className="truncate">
//                                         {ev.summary ?? "Без назви"}
//                                     </li>
//                                 ))}
//                                 {monthEvents.length > 5 && (
//                                     <li className="text-slate-400">
//                                         +{monthEvents.length - 5} ще…
//                                     </li>
//                                 )}
//                             </ul>
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };

//     return (
//         <div className="space-y-4">
//             {/* верхній тулбар */}
//             <CalendarToolbar
//                 onCalendarChange={setCalendarId}
//                 onSearch={(q) => {
//                     setQuery(q);
//                     load(q);
//                 }}
//                 onCreate={() => setIsModalOpen(true)}
//             />

//             {/* перемикання періодів + view */}
//             <div className="flex flex-wrap items-center justify-between gap-3">
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={handlePrev}
//                         className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50"
//                     >
//                         ‹
//                     </button>
//                     <button
//                         onClick={handleToday}
//                         className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50"
//                     >
//                         Сьогодні
//                     </button>
//                     <button
//                         onClick={handleNext}
//                         className="rounded-md border px-2 py-1 text-sm hover:bg-slate-50"
//                     >
//                         ›
//                     </button>

//                     <span className="ml-3 text-sm font-medium text-slate-700 capitalize">
//                         {view === "year" ? currentDate.getFullYear() : monthLabel}
//                     </span>
//                 </div>

//                 <div className="flex items-center gap-1">
//                     <button
//                         onClick={() => setView("week")}
//                         className={[
//                             "rounded-md px-3 py-1 text-sm border",
//                             view === "week"
//                                 ? "bg-slate-900 text-white border-slate-900"
//                                 : "bg-white text-slate-600 hover:bg-slate-50",
//                         ].join(" ")}
//                     >
//                         Тиждень
//                     </button>
//                     <button
//                         onClick={() => setView("month")}
//                         className={[
//                             "rounded-md px-3 py-1 text-sm border",
//                             view === "month"
//                                 ? "bg-slate-900 text-white border-slate-900"
//                                 : "bg-white text-slate-600 hover:bg-slate-50",
//                         ].join(" ")}
//                     >
//                         Місяць
//                     </button>
//                     <button
//                         onClick={() => setView("year")}
//                         className={[
//                             "rounded-md px-3 py-1 text-sm border",
//                             view === "year"
//                                 ? "bg-slate-900 text-white border-slate-900"
//                                 : "bg-white text-slate-600 hover:bg-slate-50",
//                         ].join(" ")}
//                     >
//                         Рік
//                     </button>
//                 </div>
//             </div>

//             {/* основний візуал */}
//             {view === "week" && renderWeekGrid()}
//             {view === "month" && renderMonthGrid()}
//             {view === "year" && renderYearGrid()}

//             {/* модалка створення події */}
//             {isModalOpen && (
//                 <NewEventModal
//                     calendarId={calendarId}
//                     onCreated={async () => {
//                         await load(query);
//                         setIsModalOpen(false);
//                     }}
//                     onClose={() => setIsModalOpen(false)}
//                 />
//             )}
//         </div>
//     );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import CalendarToolbar from "@/components/CalendarToolbar";
import NewEventModal from "@/components/NewEventModal";
import { toDateOnlyKey, getMonthMatrix } from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/google";

/* -----------------------------------------
   Helpers
----------------------------------------- */

function getMonday(d: Date) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getWeekDays(monday: Date) {
    return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

const HOURS = Array.from({ length: 24 }).map(
    (_, h) => `${String(h).padStart(2, "0")}:00`
);

/* -----------------------------------------
   CalendarSection
----------------------------------------- */

export default function CalendarSection({ userId }: { userId: string }) {
    const [calendarId, setCalendarId] = useState("primary");
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [mode, setMode] = useState<"week" | "month" | "year">("month");
    const [cursor, setCursor] = useState(new Date());
    const [query, setQuery] = useState("");

    /* -----------------------------------------
       Load events
    ----------------------------------------- */
    const load = async (search?: string) => {
        const url = new URL("/api/google/events", window.location.origin);
        if (calendarId !== "primary") url.searchParams.set("calendarId", calendarId);
        if (search) url.searchParams.set("q", search);

        const res = await fetch(url);
        const data = await res.json();
        setEvents(data.items || []);
    };

    useEffect(() => {
        load();
    }, [calendarId]);

    /* -----------------------------------------
       Navigation
    ----------------------------------------- */

    function goPrev() {
        const d = new Date(cursor);
        if (mode === "week") d.setDate(cursor.getDate() - 7);
        if (mode === "month") d.setMonth(cursor.getMonth() - 1);
        if (mode === "year") d.setFullYear(cursor.getFullYear() - 1);
        setCursor(d);
    }

    function goNext() {
        const d = new Date(cursor);
        if (mode === "week") d.setDate(cursor.getDate() + 7);
        if (mode === "month") d.setMonth(cursor.getMonth() + 1);
        if (mode === "year") d.setFullYear(cursor.getFullYear() + 1);
        setCursor(d);
    }

    function goToday() {
        setCursor(new Date());
    }

    /* -----------------------------------------
       Group events by date
    ----------------------------------------- */
    const eventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const ev of events) {
            const iso = ev.start?.dateTime ?? ev.start?.date;
            if (!iso) continue;
            const d = new Date(iso);
            const key = toDateOnlyKey(d);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(ev);
        }
        return map;
    }, [events]);

    /* -----------------------------------------
       WEEK VIEW
    ----------------------------------------- */

    function renderWeek() {
        const monday = getMonday(cursor);
        const days = getWeekDays(monday);

        return (
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm text-slate-400" >
                {/* Header */}
                <div className="grid grid-cols-8 border-b bg-slate-50 text-sm font-medium">
                    <div className="p-2 text-center text-slate-400">Год.</div>
                    {days.map((d) => (
                        <div key={d.toISOString()} className="p-2 text-center">
                            {d.toLocaleDateString("uk-UA", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                            })}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-8 " >
                    {/* Hours */}
                    <div className="border-r bg-slate-50 text-xs text-slate-500">
                        {HOURS.map((h) => (
                            <div key={h} className="h-16 border-b px-2 pt-1">
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    {days.map((day) => {
                        const key = toDateOnlyKey(day);
                        const dayEvents = (eventsByDay.get(key) ?? []).filter((e) => e.start?.dateTime);

                        return (
                            <div key={key} className="border-r relative">
                                {HOURS.map((_, i) => (
                                    <div key={i} className="h-16 border-b"></div>
                                ))}

                                {dayEvents.map((ev) => {
                                    const start = new Date(ev.start!.dateTime!);
                                    const end = new Date(ev.end!.dateTime!);

                                    const duration = (end.getTime() - start.getTime()) / 3600000;
                                    const top =
                                        start.getHours() * 64 +
                                        (start.getMinutes() / 60) * 64;
                                    const height = duration * 64;

                                    return (
                                        <div
                                            key={ev.id}
                                            className="absolute left-1 right-1 bg-violet-600 text-white text-xs rounded px-2 py-1 shadow"
                                            style={{ top, height }}
                                        >
                                            <div className="font-medium truncate">{ev.summary}</div>
                                            <div className="text-[10px] opacity-90">
                                                {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                                                {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* -----------------------------------------
       MONTH VIEW
    ----------------------------------------- */

    function renderMonth() {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const matrix = getMonthMatrix(y, m);

        return (
            <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-slate-200">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
                    <div key={d} className="bg-white p-2 text-center text-xs font-medium text-slate-500">
                        {d}
                    </div>
                ))}

                {matrix.flat().map(({ date, inCurrentMonth }) => {
                    const key = toDateOnlyKey(date);
                    const dayEvents = eventsByDay.get(key) ?? [];
                    const isToday = key === toDateOnlyKey(new Date());

                    return (
                        <div
                            key={key}
                            className={[
                                "min-h-28 bg-white p-2 text-slate-600",
                                !inCurrentMonth && "opacity-40",
                                isToday && "ring-2 ring-violet-500",
                            ].join(" ")}
                        >
                            <div className="text-xs font-medium">{date.getDate()}</div>
                            <div className="mt-1 space-y-1">
                                {dayEvents.slice(0, 2).map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="truncate rounded border px-2 py-0.5 text-xs text-slate-700 bg-violet-50"
                                    >
                                        {ev.summary}
                                    </div>
                                ))}
                                {dayEvents.length > 2 && (
                                    <div className="text-xs text-slate-400">+{dayEvents.length - 2} ще…</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    /* -----------------------------------------
       YEAR VIEW
    ----------------------------------------- */

    function renderYear() {
        const year = cursor.getFullYear();

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => {
                    const matrix = getMonthMatrix(year, i);
                    return (
                        <div key={i} className="border rounded-lg p-3 bg-white shadow-sm text-slate-400" >
                            <div className="font-semibold text-sm mb-2 text-center">
                                {new Date(year, i).toLocaleDateString("uk-UA", { month: "long" })}
                            </div>

                            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded overflow-hidden">
                                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
                                    <div key={d} className="bg-slate-50 text-xs text-center p-1 text-slate-500">
                                        {d}
                                    </div>
                                ))}

                                {matrix.flat().map(({ date, inCurrentMonth }) => {
                                    const key = toDateOnlyKey(date);
                                    const dayEvents = eventsByDay.get(key) ?? [];

                                    return (
                                        <div
                                            key={key}
                                            className={[
                                                "min-h-10 bg-white p-1 text-xs",
                                                !inCurrentMonth && "opacity-40",
                                            ].join(" ")}
                                        >
                                            <div>{date.getDate()}</div>
                                            {dayEvents.slice(0, 1).map((ev) => (
                                                <div key={ev.id} className="text-[10px] mt-1 truncate bg-violet-50 px-1">
                                                    {ev.summary}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    /* -----------------------------------------
       Render
    ----------------------------------------- */

    return (
        <div className="space-y-4">

            {/* Toolbar */}
            <CalendarToolbar
                mode={mode}
                onModeChange={setMode}
                periodLabel={cursor.toLocaleDateString("uk-UA", {
                    month: mode === "year" ? undefined : "long",
                    year: "numeric",
                })}
                onPrev={goPrev}
                onNext={goNext}
                onCalendarChange={setCalendarId}
                onSearch={(q) => {
                    setQuery(q);
                    load(q);
                }}
            />

            {/* Views */}
            {mode === "week" && renderWeek()}
            {mode === "month" && renderMonth()}
            {mode === "year" && renderYear()}

            {/* Modal */}
            {isModalOpen && (
                <NewEventModal
                    calendarId={calendarId}
                    onCreated={async () => {
                        await load(query);
                        setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Floating create button (опціонально) */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-violet-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-violet-700"
                >
                    + Створити подію
                </button>
            </div>

        </div>
    );
}

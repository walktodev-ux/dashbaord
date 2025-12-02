

// "use client";

// import { useEffect, useState } from "react";

// export default function CalendarToolbar({
//     onCalendarChange,
//     onSearch,
//     onCreate,
// }: {
//     onCalendarChange: (calendarId: string) => void;
//     onSearch: (query: string) => void;
//     onCreate: () => void;
// }) {
//     const [calendars, setCalendars] = useState<any[]>([]);
//     const [selected, setSelected] = useState("primary");
//     const [query, setQuery] = useState("");

//     useEffect(() => {
//         fetch("/api/google/calendars")
//             .then((r) => r.json())
//             .then((d) => setCalendars(d.items || []))
//             .catch(() => setCalendars([]));
//     }, []);

//     return (
//         <div className="flex flex-wrap items-center gap-2">
//             <select
//                 className="border rounded-md px-2 py-1 text-sm text-slate-400"
//                 value={selected}
//                 onChange={(e) => {
//                     setSelected(e.target.value);
//                     onCalendarChange(e.target.value);
//                 }}
//             >
//                 <option value="primary">Основний календар</option>
//                 {calendars.map((c) => (
//                     <option key={c.id} value={c.id}>
//                         {c.summary}
//                     </option>
//                 ))}
//             </select>

//             <input
//                 className="border rounded-md px-2 py-1 text-sm text-gray-500 flex-1 min-w-[180px] border-gray-300 placeholder:text-gray-400"
//                 placeholder="Пошук подій…"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//             />

//             <button
//                 type="button"
//                 onClick={() => onSearch(query)}
//                 className="border rounded-md px-3 py-1 text-sm bg-amber-50 text-amber-700 hover:bg-amber-700 hover:text-white"
//             >
//                 Пошук
//             </button>

//             <button
//                 type="button"
//                 onClick={onCreate}
//                 className="border rounded-md px-3 py-1 text-sm bg-violet-600 text-white hover:bg-violet-700"
//             >
//                 + Створити
//             </button>
//         </div>
//     );
// }


"use client";

import { useState, useEffect } from "react";

export default function CalendarToolbar({
    calendarId,
    mode,
    periodLabel,
    onModeChange,
    onPrev,
    onNext,
    onToday,
    onCalendarChange,
    onSearch,
    onCreate,
}: {
    calendarId: string;
    mode: "week" | "month" | "year";
    periodLabel: string;
    onModeChange: (m: "week" | "month" | "year") => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onCalendarChange: (calendarId: string) => void;
    onSearch: (q: string) => void;
    onCreate: () => void;
}) {
    const [calendars, setCalendars] = useState<any[]>([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetch("/api/google/calendars")
            .then((r) => r.json())
            .then((d) => setCalendars(d.items || []))
            .catch(() => setCalendars([]));
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-3">

            {/* Селект календарів */}
            <select
                className="border rounded-md px-2 py-1 text-sm text-slate-600"
                value={calendarId}
                onChange={(e) => onCalendarChange(e.target.value)}
            >
                <option value="primary">Основний календар</option>
                {calendars.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.summary}
                    </option>
                ))}
            </select>

            {/* Пошук */}
            <input
                className="border rounded-md px-2 py-1 text-sm flex-1 min-w-40 text-slate-400"
                placeholder="Пошук подій…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <button
                onClick={() => onSearch(query)}
                className="border rounded-md px-3 py-1 text-sm bg-amber-50 text-amber-700 hover:bg-amber-700 hover:text-white"
            >
                Пошук
            </button>

            {/* Навігація */}
            <div className="flex items-center gap-2 ml-4">
                <button
                    onClick={onPrev}
                    className="border rounded-md px-2 py-1 text-sm hover:bg-slate-100 bg-slate-300 text-slate-600"
                >
                    ←
                </button>

                <button
                    onClick={onToday}
                    className="border rounded-md px-2 py-1 text-sm hover:bg-slate-100 bg-slate-300 text-slate-600"
                >
                    Сьогодні
                </button>

                <button
                    onClick={onNext}
                    className="border rounded-md px-2 py-1 text-sm hover:bg-slate-100 bg-slate-300 text-slate-600"
                >
                    →
                </button>


            </div>

            {/* Режими перегляду */}
            <div className="flex items-center gap-1 ml-auto">
                <div className="text-sm font-medium text-slate-700 ml-2">
                    {periodLabel}
                </div>
                <button
                    onClick={() => onModeChange("week")}
                    className={`px-3 py-1 rounded-md text-sm ${mode === "week"
                        ? "bg-slate-900 text-white"
                        : "border bg-white text-slate-600"
                        }`}
                >
                    Тиждень
                </button>
                <button
                    onClick={() => onModeChange("month")}
                    className={`px-3 py-1 rounded-md text-sm ${mode === "month"
                        ? "bg-slate-900 text-white"
                        : "border bg-white text-slate-600"
                        }`}
                >
                    Місяць
                </button>
                <button
                    onClick={() => onModeChange("year")}
                    className={`px-3 py-1 rounded-md text-sm ${mode === "year"
                        ? "bg-slate-900 text-white"
                        : "border bg-white text-slate-600"
                        }`}
                >
                    Рік
                </button>
            </div>

            {/* Створення події */}
            {/* <button
                onClick={onCreate}
                className="border rounded-md px-3 py-1 text-sm bg-violet-600 text-white hover:bg-violet-700"
            >
                + Створити
            </button> */}
        </div>
    );
}

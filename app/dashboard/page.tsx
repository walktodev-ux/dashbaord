

// app/dashboard/page.tsx
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listCalendarEvents, type CalendarEvent } from "@/lib/google";
import { toDateOnlyKey, getMonthMatrix } from "@/lib/calendar";

import {
  CalendarDays,
  Calendar1,
  Users,
  Clock,
  Sparkles,
  Plus,
  Phone,
  Mail,
} from "lucide-react";

import SessionsPanel from "@/components/SessionsPanel";
import CalendarSection from "@/components/CalendarSection";

export const dynamic = "force-dynamic";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white shadow-[0_1px_0_0_rgba(16,24,40,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function Kpi({
  title,
  value,
  hint,
  icon,
  tint,
}: {
  title: string;
  value: number | string;
  hint?: string;
  icon: React.ReactNode;
  tint: "blue" | "green" | "pink" | "amber";
}) {
  const tints: Record<typeof tint, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-green-50 text-green-700 ring-green-100",
    pink: "bg-pink-50 text-pink-700 ring-pink-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{title}</div>
        <div className={`inline-flex items-center justify-center rounded-xl p-2 ring-1 ${tints[tint]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="text-center space-y-2">
          <p>Потрібна авторизація.</p>
          <Link className="underline" href="/sign-in">Перейти на вхід</Link>
        </div>
      </main>
    );
  }

  const userId = (session.user as any).id ?? session.user?.id!;
  const now = new Date();

  // Дані
  const [events, waitlist, activeClients] = await Promise.all([
    listCalendarEvents(userId), // з твоєї lib/google
    prisma.waitlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count({
      where: { therapistId: userId, status: "ACTIVE" },
    }),
  ]);

  // Календар (сітка)
  const y = now.getFullYear();
  const m = now.getMonth();
  const weeks = getMonthMatrix(y, m);

  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const startIso = ev.start?.dateTime ?? ev.start?.date;
    if (!startIso) continue;
    const d = new Date(startIso);
    const key = toDateOnlyKey(d);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(ev);
  }

  // Хелпери
  const weekBounds = (() => {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);
    return { monday, sunday };
  })();

  const sessionsThisWeek = events.filter((e) => {
    const s = e.start?.dateTime ?? e.start?.date;
    if (!s) return false;
    const d = new Date(s);
    return d >= weekBounds.monday && d < weekBounds.sunday;
  }).length;

  const sessionsToday = events.filter((e) => {
    const s = e.start?.dateTime ?? e.start?.date;
    if (!s) return false;
    const d = new Date(s);
    return toDateOnlyKey(d) === toDateOnlyKey(now);
  }).length;

  const waitlistPending = waitlist.filter((w) => w.status === "PENDING").length;

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  };

  return (
    <main className="min-h-dvh p-6 space-y-8 bg-slate-50">
      {/* Хедер */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
          <div className="text-sm text-slate-500">
            {now.toLocaleDateString("uk-UA", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-4" /> Профіль: {session.user?.name ?? "користувач"}
          </span>

          <form action={handleSignOut}>
            <button type="submit" className="underline text-sm">
              Вийти
            </button>
          </form>
        </div>
      </header>

      {/* KPI */}
      {/* <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi
          title="Активних клієнтів"
          value={activeClients}
          hint="в роботі"
          tint="blue"
          icon={<Users className="size-5" />}
        />
        <Kpi
          title="Сесій цього тижня"
          value={sessionsThisWeek}
          hint="+2 від минулого"
          tint="green"
          icon={<CalendarDays className="size-5" />}
        />
        <Kpi
          title="Сьогодні сесій"
          value={sessionsToday}
          hint="заплановано"
          tint="pink"
          icon={<Clock className="size-5" />}
        />
        <Kpi
          title="Лист очікування"
          value={waitlist.length}
          hint={`потенційних: ${waitlistPending}`}
          tint="amber"
          icon={<Users className="size-5" />}
        />
      </section> */}

      {/* Дві колонки: Сесії на сьогодні / Лист очікування */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Сесії на сьогодні */}
        {/* <Card className="p-5 "> */}
        {/* <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center rounded-xl p-2 ring-1 bg-violet-50 text-violet-700 ring-violet-100">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-600">Сесії на сьогодні</h2>
                <div className="text-sm text-slate-500">Заплановані зустрічі</div>
              </div>
            </div>
          </div> */}

        {/* <SessionsPanel
            events={events as any}
            nowIso={now.toISOString()}
            title="Сесії"
          />
        </Card> */}

        {/* Сесії на сьогодні */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center rounded-xl p-2 ring-1 bg-violet-50 text-violet-700 ring-violet-100">
                <Calendar1 className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-600">Розклад на сьогодні</h2>
                <div className="text-sm text-slate-500">Заплановані зустрічі</div>
              </div>
            </div>
          </div>

          <ul className="space-y-3">
            {events
              .filter((e) => {
                const s = e.start?.dateTime ?? e.start?.date;
                if (!s) return false;
                return toDateOnlyKey(new Date(s)) === toDateOnlyKey(now);
              })
              .slice(0, 6)
              .map((ev) => {
                const s = ev.start?.dateTime ?? ev.start?.date;
                const e = ev.end?.dateTime ?? ev.end?.date;
                const ds = s ? new Date(s) : null;
                const de = e ? new Date(e) : null;
                const isTimed = Boolean(ev.start?.dateTime);

                const time = isTimed
                  ? `${ds!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${(de ?? ds)!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Весь день";

                const durationMin =
                  isTimed && ds && de ? Math.max(0, Math.round((+de - +ds) / 60000)) : undefined;

                return (
                  <li key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="font-medium text-slate-600">{ev.summary ?? "Без назви"}</div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-4" />
                        {time}
                      </span>
                      {durationMin ? (
                        <span className="inline-flex items-center gap-1">• {durationMin} хв</span>
                      ) : null}
                    </div>
                    {ev.description ? (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{ev.description}</p>
                    ) : null}
                  </li>
                );
              })}

            {sessionsToday === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                На сьогодні нічого не заплановано.
              </li>
            )}
          </ul>
        </Card>

        {/* Лист очікування */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center rounded-xl p-2 ring-1 bg-amber-50 text-amber-700 ring-amber-100">
                <Users className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-600">Лист очікування</h2>
                <div className="text-sm text-slate-500">Потенційні клієнти</div>
              </div>
            </div>


            <form action="/api/waitlist" method="post" className="md:hidden">
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                <Plus className="size-4" /> Додати
              </button>
            </form>
          </div>

          <ul className="space-y-3">
            {waitlist.map((w) => (
              <li key={w.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      {w.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-4" /> {w.phone}
                        </span>
                      ) : null}
                      {w.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-4" /> {w.email}
                        </span>
                      ) : null}
                      <span className="text-slate-400">
                        Додано: {new Date(w.createdAt).toLocaleDateString("uk-UA")}
                      </span>
                    </div>
                    {w.note ? <p className="mt-2 text-sm text-slate-600">{w.note}</p> : null}
                  </div>

                  {/* Статус + дії */}
                  <form action={`/api/waitlist/${w.id}`} method="post" className="flex items-center gap-2">
                    <select
                      name="status"
                      defaultValue={w.status}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="PENDING">Очікує</option>
                      <option value="CONTACTED">Звʼязались</option>
                      <option value="CONVERTED">Записали</option>
                      <option value="DROPPED">Відмова</option>
                    </select>
                    <input type="hidden" name="_method" value="PATCH" />
                    <button type="submit" className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">
                      Зберегти
                    </button>
                  </form>
                </div>

                {/* Нотатка */}
                <form action={`/api/waitlist/${w.id}`} method="post" className="mt-3 flex items-center gap-2">
                  <input
                    name="note"
                    defaultValue={w.note ?? ""}
                    placeholder="Нотатка"
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />
                  <input type="hidden" name="_method" value="PATCH" />
                  <button type="submit" className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">
                    Зберегти нотатку
                  </button>
                </form>

                {/* Видалення */}
                <form action={`/api/waitlist/${w.id}`} method="post" className="mt-2">
                  <input type="hidden" name="_method" value="DELETE" />
                  <button className="rounded-md border px-3 py-1 text-sm text-rose-700 hover:bg-rose-50">
                    Видалити
                  </button>
                </form>
              </li>
            ))}

            {waitlist.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                Лист очікування порожній.
              </li>
            )}
          </ul>
        </Card>
      </section>

      {/* Календар (сітка місяця) */}
      {/* <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Календар — {now.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })}
          </h2>
          <span className="text-sm text-slate-500">Дані з Google Calendar</span>
        </div>

        <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-slate-200">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
            <div key={d} className="bg-white p-2 text-center text-xs font-medium text-slate-500">
              {d}
            </div>
          ))}

          {weeks.flat().map(({ date, inCurrentMonth }) => {
            const key = toDateOnlyKey(date);
            const dayEvents = byDate.get(key) ?? [];
            const isToday = key === toDateOnlyKey(now);
            return (
              <div
                key={key + String(inCurrentMonth)}
                className={[
                  "min-h-28 bg-white p-2 text-slate-500",
                  inCurrentMonth ? "opacity-100" : "opacity-50",
                  isToday ? "ring-2 ring-violet-500" : "",
                ].join(" ")}
              >
                <div className="text-xs font-medium">{date.getDate()}</div>
                <div className="mt-2 space-y-1 text-slate-500">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const s = ev.start?.dateTime ?? ev.start?.date;
                    const d = s ? new Date(s) : null;
                    const isTimed = Boolean(ev.start?.dateTime);
                    const time = isTimed ? d!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Весь день";
                    return (
                      <a
                        key={ev.id}
                        href={ev.htmlLink ?? "#"}
                        target="_blank"
                        className="block truncate rounded-md border text-slate-600 px-2 py-1 text-xs hover:bg-violet-50"
                      >
                        <span className="font-medium text-slate-500">{time}</span> · {ev.summary ?? "Без назви"}
                      </a>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-slate-500">+{dayEvents.length - 3} ще…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card> */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center justify-center rounded-xl p-2 ring-1 bg-violet-50 text-violet-700 ring-violet-100">
            <CalendarDays className="size-5" />
          </div>
          <h2 className="text-lg font-semibold  text-slate-600">Календар</h2>
        </div>

        {/* @ts-expect-error Server Component */}
        <CalendarSection userId={userId} />
      </Card>
    </main>
  );
}

// lib/calendar.ts
export type CalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  attendees?: Array<{ email: string; responseStatus?: string }>;
};

export function toDateOnlyKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getMonthMatrix(year: number, monthIndex0: number) {
  // monthIndex0: 0..11
  const first = new Date(year, monthIndex0, 1);
  const startWeekday = (first.getDay() + 6) % 7; // робочий тиждень з Пн (0..6)
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();

  const cells: Array<{ date: Date; inCurrentMonth: boolean }> = [];
  // попередні дні
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(year, monthIndex0, 1 - (startWeekday - i));
    cells.push({ date: d, inCurrentMonth: false });
  }
  // місяць
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, monthIndex0, d), inCurrentMonth: true });
  }
  // наступні, щоб кратно 7
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ date: d, inCurrentMonth: false });
  }

  // тижні
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

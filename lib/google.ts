// lib/google.ts
// import { prisma } from "@/lib/prisma";

// async function refreshGoogleAccessToken(refresh_token: string) {
//   const body = new URLSearchParams({
//     client_id: process.env.GOOGLE_CLIENT_ID!,
//     client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//     grant_type: "refresh_token",
//     refresh_token,
//   });
//   const resp = await fetch("https://oauth2.googleapis.com/token", {
//     method: "POST",
//     headers: { "content-type": "application/x-www-form-urlencoded" },
//     body,
//   });
//   if (!resp.ok) throw new Error(`Failed to refresh: ${resp.status} ${await resp.text()}`);
//   const json = await resp.json() as { access_token: string; expires_in: number };
//   const expires_at = Math.floor(Date.now() / 1000) + json.expires_in;
//   return { access_token: json.access_token, expires_at };
// }

// async function getValidAccessToken(userId: string) {
//   const acc = await prisma.account.findFirst({
//     where: { userId, provider: "google" },
//     select: { id: true, access_token: true, refresh_token: true, expires_at: true },
//   });
//   if (!acc?.access_token) throw new Error("No Google tokens");

//   const now = Math.floor(Date.now() / 1000);
//   if (acc.expires_at && acc.expires_at > now + 60) return acc.access_token;

//   if (!acc.refresh_token) throw new Error("No refresh_token");
//   const { access_token, expires_at } = await refreshGoogleAccessToken(acc.refresh_token);
//   await prisma.account.update({ where: { id: acc.id }, data: { access_token, expires_at } });
//   return access_token;
// }

// export type CalendarEvent = {
//   id: string;
//   summary?: string;
//   description?: string;
//   htmlLink?: string;
//   start?: { dateTime?: string; date?: string; timeZone?: string };
//   end?: { dateTime?: string; date?: string; timeZone?: string };
//   attendees?: Array<{ email: string; responseStatus?: string }>;
// };

// export async function listEvents(
//   userId: string,
//   opts: { calendarId?: string; q?: string; timeMin?: string; timeMax?: string } = {}
// ) {
//   const accessToken = await getValidAccessToken(userId);
//   const calendarId = encodeURIComponent(opts.calendarId || "primary");

//   const params = new URLSearchParams({
//     singleEvents: "true",
//     orderBy: "startTime",
//     maxResults: "250",
//   });
//   const now = new Date();
//   const min = opts.timeMin ?? new Date(now.getTime() - 7 * 86400_000).toISOString();
//   const max = opts.timeMax ?? new Date(now.getTime() + 30 * 86400_000).toISOString();
//   params.set("timeMin", min);
//   params.set("timeMax", max);
//   if (opts.q) params.set("q", opts.q);

//   const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` + params.toString();
//   const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
//   if (!resp.ok) throw new Error(`Google list error: ${resp.status} ${await resp.text()}`);
//   const json = await resp.json();
//   return (json.items ?? []) as CalendarEvent[];
// }

// export async function createEvent(userId: string, input: {
//   calendarId?: string;
//   summary: string;
//   description?: string;
//   start: { dateTime?: string; date?: string; timeZone?: string };
//   end:   { dateTime?: string; date?: string; timeZone?: string };
//   attendees?: Array<{ email: string }>;
//   location?: string;
// }) {
//   const accessToken = await getValidAccessToken(userId);
//   const calendarId = encodeURIComponent(input.calendarId || "primary");

//   // БЕЗПЕЧНА ВАЛІДАЦІЯ: або dateTime, або date
//   const hasDateTime = Boolean(input.start?.dateTime && input.end?.dateTime);
//   const hasDate = Boolean(input.start?.date && input.end?.date);
//   if (!hasDateTime && !hasDate) throw new Error("start/end must be dateTime or date");

//   const body = {
//     summary: input.summary,
//     description: input.description,
//     location: input.location,
//     start: input.start,
//     end: input.end,
//     attendees: input.attendees,
//   };

//   const res = await fetch(
//     `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(body),
//     }
//   );

//   if (!res.ok) throw new Error(`Create event error: ${res.status} ${await res.text()}`);
//   return res.json();

// }
// export async function listCalendarEvents(userId: string) {
//   // alias для зворотної сумісності
//   return listEvents(userId);
// }

// // lib/google.ts
// import { prisma } from "@/lib/prisma";

// /** ----------------- Токени Google ------------------- **/

// type GoogleTokens = {
//   access_token: string;
//   refresh_token?: string | null;
//   expires_at?: number | null; // unix seconds
// };

// // рефреш access_token за refresh_token
// async function refreshGoogleAccessToken(tokens: GoogleTokens) {
//   if (!tokens.refresh_token) throw new Error("No refresh_token");

//   const body = new URLSearchParams({
//     client_id: process.env.GOOGLE_CLIENT_ID!,
//     client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//     grant_type: "refresh_token",
//     refresh_token: tokens.refresh_token!,
//   });

//   const resp = await fetch("https://oauth2.googleapis.com/token", {
//     method: "POST",
//     headers: { "content-type": "application/x-www-form-urlencoded" },
//     body,
//   });

//   if (!resp.ok) {
//     throw new Error(`Failed to refresh token: ${resp.status} ${await resp.text()}`);
//   }

//   const json = (await resp.json()) as {
//     access_token: string;
//     expires_in: number;
//     token_type: "Bearer";
//     scope?: string;
//   };

//   const expires_at = Math.floor(Date.now() / 1000) + json.expires_in;
//   return { access_token: json.access_token, expires_at };
// }

// /**
//  * Дістає актуальний access_token з нашої таблиці Account.
//  * Якщо протух — рефрешить і оновлює в БД.
//  */
// export async function getValidGoogleAccessToken(userId: string) {
//   const acc = await prisma.account.findFirst({
//     where: { userId, provider: "google" },
//     select: { id: true, access_token: true, refresh_token: true, expires_at: true },
//   });

//   if (!acc?.access_token) {
//     throw new Error("No Google account tokens for user");
//   }

//   const now = Math.floor(Date.now() / 1000);
//   if (acc.expires_at && acc.expires_at > now + 60) {
//     // токен ще живий
//     return acc.access_token;
//   }

//   // треба рефрешити
//   const { access_token, expires_at } = await refreshGoogleAccessToken({
//     access_token: acc.access_token!,
//     refresh_token: acc.refresh_token,
//     expires_at: acc.expires_at,
//   });

//   await prisma.account.update({
//     where: { id: acc.id },
//     data: { access_token, expires_at },
//   });

//   return access_token;
// }

// /** ----------------- Типи подій / календарів ------------------- **/

// export type CalendarEvent = {
//   id: string;
//   summary?: string;
//   description?: string;
//   htmlLink?: string;
//   start?: { dateTime?: string; date?: string; timeZone?: string };
//   end?: { dateTime?: string; date?: string; timeZone?: string };
//   attendees?: Array<{ email: string; responseStatus?: string }>;
// };

// export type GoogleCalendarListEntry = {
//   id: string;
//   summary?: string;
//   description?: string;
//   primary?: boolean;
//   accessRole?: string;
//   backgroundColor?: string;
//   foregroundColor?: string;
//   selected?: boolean;
// };

// /** ----------------- Список подій ------------------- **/

// export async function listEvents(
//   userId: string,
//   opts: {
//     calendarId?: string;
//     q?: string;
//     timeMin?: string;
//     timeMax?: string;
//   } = {}
// ): Promise<CalendarEvent[]> {
//   const accessToken = await getValidGoogleAccessToken(userId);
//   const calendarId = encodeURIComponent(opts.calendarId || "primary");

//   const params = new URLSearchParams({
//     singleEvents: "true",
//     orderBy: "startTime",
//     maxResults: "250",
//   });

//   const now = new Date();
//   const min = opts.timeMin ?? new Date(now.getTime() - 7 * 86400_000).toISOString();
//   const max = opts.timeMax ?? new Date(now.getTime() + 30 * 86400_000).toISOString();
//   params.set("timeMin", min);
//   params.set("timeMax", max);

//   if (opts.q) params.set("q", opts.q);

//   const url =
//     `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
//     params.toString();

//   const resp = await fetch(url, {
//     headers: { Authorization: `Bearer ${accessToken}` },
//   });

//    if (!resp.ok) {
//     const text = await resp.text();
//     console.error("[Google Calendar listEvents ERROR]", {
//       status: resp.status,
//       calendarId,
//       url,
//       body: text,
//     });

//     // щоб UI не падав наглухо — повернемо просто пустий список
//     throw new Error(`Google list error: ${resp.status} ${text}`);
//   }

//   const json = await resp.json();
//   return (json.items ?? []) as CalendarEvent[];
// }

// /**
//  * Обгортка під стару назву, щоб не ламати існуючий код:
//  * listCalendarEvents(userId) → події з primary календаря за -7..+30 днів.
//  */
// export async function listCalendarEvents(userId: string): Promise<CalendarEvent[]> {
//   return listEvents(userId);
// }

// /** ----------------- Створення події ------------------- **/

// export async function createEvent(
//   userId: string,
//   input: {
//     calendarId?: string;
//     summary: string;
//     description?: string;
//     start: { dateTime?: string; date?: string; timeZone?: string };
//     end: { dateTime?: string; date?: string; timeZone?: string };
//     attendees?: Array<{ email: string }>;
//     location?: string;
//   }
// ) {
//   const accessToken = await getValidGoogleAccessToken(userId);
//   const calendarId = encodeURIComponent(input.calendarId || "primary");

//   // або dateTime, або date (ал-дей)
//   const hasDateTime = Boolean(input.start?.dateTime && input.end?.dateTime);
//   const hasDate = Boolean(input.start?.date && input.end?.date);
//   if (!hasDateTime && !hasDate) {
//     throw new Error("start/end must be dateTime or date");
//   }

//   const body = {
//     summary: input.summary,
//     description: input.description,
//     location: input.location,
//     start: input.start,
//     end: input.end,
//     attendees: input.attendees,
//   };

//   const res = await fetch(
//     `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(body),
//     }
//   );

//   if (!res.ok) {
//     throw new Error(`Create event error: ${res.status} ${await res.text()}`);
//   }

//   return res.json();
// }

// /** ----------------- Список календарів ------------------- **/

// export async function listCalendars(
//   userId: string
// ): Promise<GoogleCalendarListEntry[]> {
//   const accessToken = await getValidGoogleAccessToken(userId);

//   const params = new URLSearchParams({
//     minAccessRole: "reader",
//     maxResults: "250",
//   });

//   const url =
//     "https://www.googleapis.com/calendar/v3/users/me/calendarList?" +
//     params.toString();

//   const resp = await fetch(url, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//     cache: "no-store",
//   });

//   if (!resp.ok) {
//     throw new Error(`Google calendarList error: ${resp.status} ${await resp.text()}`);
//   }

//   const json = await resp.json();
//   return (json.items ?? []) as GoogleCalendarListEntry[];
// }

// lib/google.ts
import { prisma } from "@/lib/prisma";

/** ----------------- Токени Google ------------------- **/

type GoogleTokens = {
  access_token: string;
  refresh_token?: string | null;
  expires_at?: number | null; // unix seconds
};

// рефреш access_token за refresh_token
async function refreshGoogleAccessToken(tokens: GoogleTokens) {
  if (!tokens.refresh_token) throw new Error("No refresh_token");

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token!,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    throw new Error(
      `Failed to refresh token: ${resp.status} ${await resp.text()}`
    );
  }

  const json = (await resp.json()) as {
    access_token: string;
    expires_in: number;
    token_type: "Bearer";
    scope?: string;
  };

  const expires_at = Math.floor(Date.now() / 1000) + json.expires_in;
  return { access_token: json.access_token, expires_at };
}

/**
 * Дістає актуальний access_token з таблиці Account.
 * Якщо протух — рефрешить і оновлює в БД.
 * opts.forceRefresh = true — примусовий рефреш навіть якщо expires_at ще не настав.
 */
export async function getValidGoogleAccessToken(
  userId: string,
  opts?: { forceRefresh?: boolean }
) {
  const acc = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!acc?.access_token) {
    throw new Error("No Google account tokens for user");
  }

  const now = Math.floor(Date.now() / 1000);

  // якщо НЕ просили форс-рефреш і токен ще живий — просто повертаємо
  if (!opts?.forceRefresh && acc.expires_at && acc.expires_at > now + 60) {
    return acc.access_token;
  }

  if (!acc.refresh_token) {
    throw new Error("No refresh_token");
  }

  // треба рефрешити
  const { access_token, expires_at } = await refreshGoogleAccessToken({
    access_token: acc.access_token!,
    refresh_token: acc.refresh_token,
    expires_at: acc.expires_at,
  });

  await prisma.account.update({
    where: { id: acc.id },
    data: { access_token, expires_at },
  });

  return access_token;
}

/** ----------------- Типи подій / календарів ------------------- **/

export type CalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: Array<{ email: string; responseStatus?: string }>;
};

export type GoogleCalendarListEntry = {
  id: string;
  summary?: string;
  description?: string;
  primary?: boolean;
  accessRole?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
};

/** ----------------- Список подій ------------------- **/

export async function listEvents(
  userId: string,
  opts: {
    calendarId?: string;
    q?: string;
    timeMin?: string;
    timeMax?: string;
  } = {}
): Promise<CalendarEvent[]> {
  const calendarId = encodeURIComponent(opts.calendarId || "primary");

  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const now = new Date();
 const min = opts.timeMin ?? new Date(now.getTime() - 30 * 86400_000).toISOString();
  const max = opts.timeMax ?? new Date(now.getTime() + 365 * 86400_000).toISOString();
  params.set("timeMin", min);
  params.set("timeMax", max);

  if (opts.q) params.set("q", opts.q);

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
    params.toString();

  // 1-й запит — з поточним токеном
  let accessToken = await getValidGoogleAccessToken(userId);
  let resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Якщо токен виявився невалідним — форс-рефреш і одна повторна спроба
  if (resp.status === 401) {
    console.warn(
      "[Google Calendar] 401 on listEvents, trying force refresh..."
    );

    accessToken = await getValidGoogleAccessToken(userId, {
      forceRefresh: true,
    });

    resp = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!resp.ok) {
    const text = await resp.text();
    console.error("[Google Calendar listEvents ERROR]", {
      status: resp.status,
      calendarId,
      url,
      body: text,
    });
    throw new Error(`Google list error: ${resp.status} ${text}`);
  }

  const json = await resp.json();
  return (json.items ?? []) as CalendarEvent[];
}

/**
 * Обгортка під стару назву, щоб не ламати існуючий код:
 * listCalendarEvents(userId) → події з primary календаря за -7..+30 днів.
 */
export async function listCalendarEvents(
  userId: string
): Promise<CalendarEvent[]> {
  return listEvents(userId);
}

/** ----------------- Створення події ------------------- **/

export async function createEvent(
  userId: string,
  input: {
    calendarId?: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    attendees?: Array<{ email: string }>;
    location?: string;
  }
) {
  const accessToken = await getValidGoogleAccessToken(userId);
  const calendarId = encodeURIComponent(input.calendarId || "primary");

  // або dateTime, або date (all-day)
  const hasDateTime = Boolean(input.start?.dateTime && input.end?.dateTime);
  const hasDate = Boolean(input.start?.date && input.end?.date);
  if (!hasDateTime && !hasDate) {
    throw new Error("start/end must be dateTime or date");
  }

  const body = {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: input.start,
    end: input.end,
    attendees: input.attendees,
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`Create event error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

/** ----------------- Список календарів ------------------- **/

export async function listCalendars(
  userId: string
): Promise<GoogleCalendarListEntry[]> {
  const accessToken = await getValidGoogleAccessToken(userId);

  const params = new URLSearchParams({
    minAccessRole: "reader",
    maxResults: "250",
  });

  const url =
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?" +
    params.toString();

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(
      `Google calendarList error: ${resp.status} ${await resp.text()}`
    );
  }

  const json = await resp.json();
  return (json.items ?? []) as GoogleCalendarListEntry[];
}

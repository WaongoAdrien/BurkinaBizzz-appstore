// lib/openingHours.ts — helpers for the weekly opening-hours schedule and live open/closed status

import { DayHours, OpeningHours } from '../types';

export const DAY_ORDER: (keyof OpeningHours)[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

export const DAY_LABELS_FR: Record<keyof OpeningHours, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

// Date#getUTCDay(): 0=Sunday...6=Saturday
const JS_DAY_TO_KEY: (keyof OpeningHours)[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export function defaultOpeningHours(): OpeningHours {
  const open = (o: string, c: string): DayHours => ({ open: o, close: c, closed: false });
  return {
    monday: open('08:00', '18:00'),
    tuesday: open('08:00', '18:00'),
    wednesday: open('08:00', '18:00'),
    thursday: open('08:00', '18:00'),
    friday: open('08:00', '18:00'),
    saturday: open('09:00', '13:00'),
    sunday: { closed: true },
  };
}

const toMinutes = (t?: string): number | null => {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
};

// Africa/Ouagadougou is UTC+0 year-round (no DST), so the UTC wall clock is local time there —
// this must NOT use the device's local timezone, so diaspora users see the same status as locals.
function nowInOuagadougou(): { dayKey: keyof OpeningHours; minutes: number } {
  const now = new Date();
  return {
    dayKey: JS_DAY_TO_KEY[now.getUTCDay()],
    minutes: now.getUTCHours() * 60 + now.getUTCMinutes(),
  };
}

export interface BusinessOpenStatus {
  isOpen: boolean;
}

function isOpenDuring(day: DayHours | undefined, minutes: number, isToday: boolean): boolean {
  if (!day || day.closed) return false;
  const openMin = toMinutes(day.open);
  const closeMin = toMinutes(day.close);
  if (openMin === null || closeMin === null) return false;
  if (closeMin === openMin) return true; // same open/close time = open 24h
  if (closeMin > openMin) {
    // normal same-day span
    return isToday && minutes >= openMin && minutes < closeMin;
  }
  // overnight span (close earlier than open, e.g. 20:00 -> 02:00)
  return isToday ? minutes >= openMin : minutes < closeMin;
}

export function getBusinessOpenStatus(openingHours?: OpeningHours): BusinessOpenStatus | null {
  if (!openingHours) return null;
  const { dayKey, minutes } = nowInOuagadougou();
  const dayIdx = DAY_ORDER.indexOf(dayKey);
  const prevKey = DAY_ORDER[(dayIdx + 6) % 7];

  const openToday = isOpenDuring(openingHours[dayKey], minutes, true);
  // an overnight span started yesterday can still be open now, past midnight
  const openFromYesterday = isOpenDuring(openingHours[prevKey], minutes, false);

  return { isOpen: openToday || openFromYesterday };
}

export function formatStatusLabel(status: BusinessOpenStatus | null): string {
  if (!status) return 'Horaires non renseignés';
  return status.isOpen ? 'Ouvert' : 'Fermé';
}

// Today's day key in Africa/Ouagadougou time, used to highlight the current row in a weekly schedule display.
export function getTodayDayKey(): keyof OpeningHours {
  return nowInOuagadougou().dayKey;
}

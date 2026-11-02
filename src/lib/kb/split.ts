// Splits a merged ticket into the problems it really holds. Built on causes.ts, computed from the data.
// A report belongs to its tenant's cause (causeOf), except the reports the desk read as a one-day
// move (desk-notes.json): their bodies show a date shifted by one day, not month and day swapped,
// so they are a problem of their own, not part of the cause their tenant would give them.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = 'parser' | 'hint' | 'oneDayMove' | 'unplaced';

export const PROBLEM_LABEL: Record<ProblemKey, string> = {
  parser: 'Shared parser reads day-first dates month first',
  hint: 'booking-v3 form hint tells day-first tenants MM/DD/YYYY',
  oneDayMove: 'Dates move by one day: a time-zone shift, not a flip',
  unplaced: 'No cause: tenant missing or not day-first',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDay: readonly string[]): ProblemKey {
  if (oneDay.includes(r.id)) return 'oneDayMove';
  return causeOf(r, t) ?? 'unplaced';
}

export type Problem = { key: ProblemKey; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined, oneDay: readonly string[]): Problem[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemKey, Report[]>();
  for (const r of merged) {
    const k = problemOf(r, tenantOf(r), oneDay);
    by.set(k, [...(by.get(k) ?? []), r]);
  }
  return [...by.entries()]
    .map(([key, reports]) => {
      const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { key, reports, tenants: new Set(reports.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

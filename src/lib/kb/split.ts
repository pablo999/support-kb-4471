// Splits a merged ticket into the problems it really holds. Built on causes.ts, computed from the data.
// Counts follow the desk's own view: every report is counted under its tenant's cause (causeOf).
// The reports the desk read as a one-day move (desk-notes.json) are a problem of their own: their
// bodies show a date shifted by one day, not month and day swapped. They stay counted where the
// desk files them, and the one-day problem lists them again, marked with the cause they sit under.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = 'parser' | 'hint' | 'oneDayMove' | 'unplaced';

export const PROBLEM_LABEL: Record<ProblemKey, string> = {
  parser: 'Shared parser reads day-first dates month first',
  hint: 'booking-v3 form hint tells day-first tenants MM/DD/YYYY',
  oneDayMove: 'Dates move by one day: a time-zone shift, not a flip',
  unplaced: 'No cause: tenant missing or not day-first',
};

export type Problem = {
  key: ProblemKey;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For oneDayMove: the cause(s) the desk files these reports under, with how many.
  filedUnder?: Record<string, number>;
};

const summary = (key: ProblemKey, reports: Report[]): Problem => {
  const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
  return { key, reports, tenants: new Set(reports.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
};

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined, oneDay: readonly string[]): Problem[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const cause = (r: Report): ProblemKey => causeOf(r, tenantOf(r)) ?? 'unplaced';
  const by = new Map<ProblemKey, Report[]>();
  for (const r of merged) by.set(cause(r), [...(by.get(cause(r)) ?? []), r]);
  const problems = [...by.entries()].map(([k, rs]) => summary(k, rs)).sort((a, b) => b.reports.length - a.reports.length);
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) {
    const p = summary('oneDayMove', moved);
    p.filedUnder = moved.reduce<Record<string, number>>((n, r) => ({ ...n, [cause(r)]: (n[cause(r)] ?? 0) + 1 }), {});
    problems.push(p);
  }
  return problems;
}

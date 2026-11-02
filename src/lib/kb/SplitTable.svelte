<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEM_LABEL, splitTicket, type ProblemKey } from '#lib/kb/split';

  // issues: problem key → GitHub issue number in `repo` (owner/name).
  let { ticket, repo, issues = {} }: { ticket: number; repo: string; issues?: Partial<Record<ProblemKey, number>> } = $props();

  const rows = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const problems = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{rows}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong> {problems.length === 1 ? 'problem' : 'problems'}
</p>

<p class="under">Counted as the desk counts them: each report under its tenant's cause. A report read as a one-day move stays counted where it is filed.</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each problems as p (p.key)}
      <tr>
        <td>{PROBLEM_LABEL[p.key]} <code>{p.key}</code></td>
        <td>{p.reports.length}{#if p.filedUnder}<span class="under"> · {Object.entries(p.filedUnder).map(([c, n]) => `${n} filed under ${c}`).join(', ')}</span>{/if}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if issues[p.key]}<a href="https://github.com/{repo}/issues/{issues[p.key]}">{repo}#{issues[p.key]}</a>{:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .under { color: var(--muted); font-size: 0.85em; }
</style>

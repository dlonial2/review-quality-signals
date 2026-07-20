'use client';

import { useMemo, useState } from 'react';
import { preflightRuns, signalCatalog, summarizeSignals } from '@/lib/qualitySignals';

const severityStyle = {
  blocker: 'bg-rose-50 text-rose-700 border-rose-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function HomePage() {
  const [selectedRule, setSelectedRule] = useState('ATT-002');
  const [scope, setScope] = useState<'14 days' | '7 days'>('14 days');
  const runs = scope === '14 days' ? preflightRuns : preflightRuns.slice(0, 6);
  const summary = useMemo(() => summarizeSignals(runs), [runs]);
  const selected = summary.counts.find((signal) => signal.ruleId === selectedRule) ?? summary.counts[0];
  const affectedRuns = runs.filter((run) => run.findings.includes(selected.ruleId));

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-slate-900">
      <header className="border-b border-slate-200 bg-[#102b28] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-300/10 px-2.5 py-1">Independent prototype</span>
              <span>Mock data</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Review Quality Signals</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Turn structured pre-review findings into a feedback loop for better templates, schemas, and lab workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">Cell Line Development</span>
            <select aria-label="Time range" value={scope} onChange={(event) => setScope(event.target.value as '14 days' | '7 days')} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none">
              <option className="text-slate-900">14 days</option>
              <option className="text-slate-900">7 days</option>
            </select>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 sm:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Preflight runs" value={summary.totalRuns.toString()} note="deterministic checks completed" />
          <Metric label="First-pass ready" value={`${summary.firstPassRate}%`} note={`${summary.totalRuns - runs.filter((run) => run.findings.length > 0).length} entries with no findings`} tone="emerald" />
          <Metric label="Median time to ready" value={`${summary.medianMinutesToReady}m`} note="from first check to clear" />
          <Metric label="Findings generated" value={summary.totalFindings.toString()} note="rule outcomes, not entry content" tone="amber" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recurring friction</p>
                <h2 className="mt-1 text-xl font-semibold">Findings by deterministic rule</h2>
              </div>
              <p className="text-xs text-slate-500">Select a rule to inspect evidence</p>
            </div>
            <div className="divide-y divide-slate-100">
              {summary.counts.map((signal) => (
                <button key={signal.ruleId} onClick={() => setSelectedRule(signal.ruleId)} className={`grid w-full gap-4 px-6 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-[1fr_160px_70px] sm:items-center ${selected.ruleId === signal.ruleId ? 'bg-emerald-50/60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 rounded-md border px-2 py-1 font-mono text-[11px] ${severityStyle[signal.severity]}`}>{signal.ruleId}</span>
                    <div><p className="text-sm font-medium">{signal.label}</p><p className="mt-1 text-xs text-slate-500">{signal.category} · {signal.field}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${signal.rate}%` }} /></div>
                    <span className="w-9 text-right text-xs font-semibold">{signal.rate}%</span>
                  </div>
                  <p className="text-right font-mono text-sm text-slate-600">{signal.count}/{summary.totalRuns}</p>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Highest-leverage intervention</p>
            <div className="mt-4 flex items-center gap-2"><span className={`rounded-md border px-2 py-1 font-mono text-[11px] ${severityStyle[selected.severity]}`}>{selected.ruleId}</span><span className="text-xs text-slate-500">{selected.count} affected entries</span></div>
            <h2 className="mt-4 text-2xl font-semibold leading-tight">{selected.label}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">This rule appeared in <strong className="text-slate-900">{selected.rate}%</strong> of preflight runs. Affected entries took a median of <strong className="text-slate-900">{selected.medianMinutes} minutes</strong> to become review-ready.</p>
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Suggested workflow change</p>
              <p className="mt-2 text-sm leading-6 text-emerald-950">{selected.recommendation}</p>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Why this—not individual blame</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The signal is repeated across {new Set(affectedRuns.map((run) => run.scientist)).size} scientists, suggesting a workflow design issue rather than a person-specific mistake.</p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Evidence</p><h2 className="mt-1 text-xl font-semibold">Recent preflight runs</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-6 py-3 font-medium">Entry</th><th className="px-4 py-3 font-medium">Scientist</th><th className="px-4 py-3 font-medium">Completed</th><th className="px-4 py-3 font-medium">Findings</th><th className="px-6 py-3 text-right font-medium">Time to ready</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{runs.slice(0, 8).map((run) => <tr key={run.id} className={run.findings.includes(selected.ruleId) ? 'bg-emerald-50/40' : ''}><td className="px-6 py-3.5"><p className="font-medium">{run.entry}</p><p className="mt-0.5 font-mono text-[11px] text-slate-400">{run.id}</p></td><td className="px-4 py-3.5 text-slate-600">{run.scientist}</td><td className="px-4 py-3.5 text-slate-600">{run.completedAt}</td><td className="px-4 py-3.5"><div className="flex flex-wrap gap-1">{run.findings.length ? run.findings.map((rule) => <span key={rule} className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${rule === selected.ruleId ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{rule}</span>) : <span className="text-xs text-emerald-700">Ready</span>}</div></td><td className="px-6 py-3.5 text-right font-mono text-slate-600">{run.minutesToReady}m</td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Prototype boundary</p>
            <h2 className="mt-2 text-lg font-semibold">A complement, not a replacement</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Benchling already supports entry validation, Notebook Check, review processes, audit history, and Insights. This concept explores one narrow extension: persisting privacy-conscious rule outcomes to reveal recurring pre-review friction.</p>
            <dl className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm">
              <div><dt className="font-medium">Input</dt><dd className="mt-1 text-slate-500">Rule ID, severity, timestamps, project context</dd></div>
              <div><dt className="font-medium">Excluded</dt><dd className="mt-1 text-slate-500">Scientific values, notes, and attachment contents</dd></div>
              <div><dt className="font-medium">Integration path</dt><dd className="mt-1 text-slate-500">Benchling events + REST API; warehouse/Insights for production analytics</dd></div>
            </dl>
            <p className="mt-5 text-[11px] leading-5 text-slate-400">Concept based only on public documentation. It does not imply knowledge of Benchling’s internal roadmap or customer configurations.</p>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, note, tone = 'slate' }: { label: string; value: string; note: string; tone?: 'slate' | 'emerald' | 'amber' }) {
  const valueColor = tone === 'emerald' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-900';
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-3 text-4xl font-semibold tracking-tight ${valueColor}`}>{value}</p><p className="mt-2 text-xs text-slate-500">{note}</p></div>;
}

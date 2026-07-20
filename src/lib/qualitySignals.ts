export type SignalSeverity = 'blocker' | 'warning';

export type QualitySignal = {
  ruleId: string;
  label: string;
  severity: SignalSeverity;
  category: 'Evidence' | 'Results' | 'Metadata' | 'Review';
  field: string;
  recommendation: string;
};

export type PreflightRun = {
  id: string;
  entry: string;
  project: string;
  scientist: string;
  completedAt: string;
  minutesToReady: number;
  findings: string[];
};

export const signalCatalog: QualitySignal[] = [
  { ruleId: 'ATT-002', label: 'Raw data not checked in', severity: 'blocker', category: 'Evidence', field: 'Attachments · check-in state', recommendation: 'Add a required raw-data attachment block to the assay template.' },
  { ruleId: 'RESULT-004', label: 'Result rows still in draft', severity: 'blocker', category: 'Results', field: 'Viability results · row status', recommendation: 'Add an end-of-run prompt to submit all structured result rows.' },
  { ruleId: 'META-003', label: 'Protocol version missing', severity: 'warning', category: 'Metadata', field: 'Entry metadata · protocol version', recommendation: 'Pre-populate protocol version from the approved assay template.' },
  { ruleId: 'UNIT-007', label: 'Cell-density unit mismatch', severity: 'blocker', category: 'Results', field: 'Cell count · density unit', recommendation: 'Replace free text with the schema-controlled cells/mL unit.' },
  { ruleId: 'REVIEW-002', label: 'Reviewer lacks project access', severity: 'blocker', category: 'Review', field: 'Review process · reviewer', recommendation: 'Validate reviewer eligibility when the review process is selected.' },
];

export const preflightRuns: PreflightRun[] = [
  { id: 'run_1042', entry: 'CHO Viability — Run 042', project: 'Cell Line Development', scientist: 'Maya Chen', completedAt: 'Jul 18, 2:14 PM', minutesToReady: 34, findings: ['ATT-002', 'RESULT-004'] },
  { id: 'run_1041', entry: 'CHO Viability — Run 041', project: 'Cell Line Development', scientist: 'Jon Bell', completedAt: 'Jul 18, 11:03 AM', minutesToReady: 27, findings: ['ATT-002'] },
  { id: 'run_1040', entry: 'CHO Viability — Run 040', project: 'Cell Line Development', scientist: 'Maya Chen', completedAt: 'Jul 17, 4:46 PM', minutesToReady: 19, findings: ['META-003'] },
  { id: 'run_1039', entry: 'CHO Viability — Run 039', project: 'Cell Line Development', scientist: 'Priya Shah', completedAt: 'Jul 17, 1:20 PM', minutesToReady: 41, findings: ['ATT-002', 'UNIT-007'] },
  { id: 'run_1038', entry: 'CHO Viability — Run 038', project: 'Cell Line Development', scientist: 'Jon Bell', completedAt: 'Jul 16, 3:08 PM', minutesToReady: 22, findings: ['RESULT-004'] },
  { id: 'run_1037', entry: 'CHO Viability — Run 037', project: 'Cell Line Development', scientist: 'Priya Shah', completedAt: 'Jul 16, 10:41 AM', minutesToReady: 16, findings: [] },
  { id: 'run_1036', entry: 'CHO Viability — Run 036', project: 'Cell Line Development', scientist: 'Maya Chen', completedAt: 'Jul 15, 5:12 PM', minutesToReady: 38, findings: ['ATT-002', 'REVIEW-002'] },
  { id: 'run_1035', entry: 'CHO Viability — Run 035', project: 'Cell Line Development', scientist: 'Jon Bell', completedAt: 'Jul 15, 12:31 PM', minutesToReady: 13, findings: [] },
  { id: 'run_1034', entry: 'CHO Viability — Run 034', project: 'Cell Line Development', scientist: 'Priya Shah', completedAt: 'Jul 14, 4:02 PM', minutesToReady: 29, findings: ['ATT-002'] },
  { id: 'run_1033', entry: 'CHO Viability — Run 033', project: 'Cell Line Development', scientist: 'Maya Chen', completedAt: 'Jul 14, 9:17 AM', minutesToReady: 25, findings: ['META-003', 'RESULT-004'] },
  { id: 'run_1032', entry: 'CHO Viability — Run 032', project: 'Cell Line Development', scientist: 'Priya Shah', completedAt: 'Jul 11, 3:44 PM', minutesToReady: 11, findings: [] },
  { id: 'run_1031', entry: 'CHO Viability — Run 031', project: 'Cell Line Development', scientist: 'Jon Bell', completedAt: 'Jul 11, 10:06 AM', minutesToReady: 31, findings: ['ATT-002', 'UNIT-007'] },
];

export function summarizeSignals(runs: PreflightRun[], catalog = signalCatalog) {
  const totalRuns = runs.length;
  const runsWithFindings = runs.filter((run) => run.findings.length > 0).length;
  const counts = catalog.map((signal) => {
    const affectedRuns = runs.filter((run) => run.findings.includes(signal.ruleId));
    return {
      ...signal,
      count: affectedRuns.length,
      rate: Math.round((affectedRuns.length / totalRuns) * 100),
      medianMinutes: median(affectedRuns.map((run) => run.minutesToReady)),
    };
  }).sort((a, b) => b.count - a.count);

  return {
    totalRuns,
    firstPassRate: Math.round(((totalRuns - runsWithFindings) / totalRuns) * 100),
    medianMinutesToReady: median(runs.map((run) => run.minutesToReady)),
    totalFindings: runs.reduce((sum, run) => sum + run.findings.length, 0),
    counts,
  };
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

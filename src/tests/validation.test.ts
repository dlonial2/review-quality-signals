import { describe, expect, it } from 'vitest';
import { cleanExperiment } from '@/data/cleanExperiment';
import { problematicExperiment } from '@/data/mockExperiment';
import { protocolConfig } from '@/data/protocolConfig';
import { buildAuditSummary, validateExperiment } from '@/lib/validation/validateExperiment';
import { calculateHealthScore, getReviewStatus } from '@/lib/scoring/calculateHealthScore';
import { parseExperimentInput, sanitizeExperiment } from '@/lib/validation/schema';
import { preflightRuns, signalCatalog, summarizeSignals } from '@/lib/qualitySignals';

describe('validation engine', () => {
  it('validates required metadata fields', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'REQ-META-001' && issue.severity === 'blocker')).toBe(true);
  });

  it('detects missing controls', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'CTRL-002' && issue.severity === 'blocker')).toBe(true);
  });

  it('detects conflicting duplicate sample IDs', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'SAMP-002')).toBe(true);
  });

  it('detects unit mismatch', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'MEAS-001')).toBe(true);
  });

  it('detects invalid numerical range', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'RANGE-001')).toBe(true);
  });

  it('validates attachment check-in', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'ATT-002' && issue.severity === 'warning')).toBe(true);
  });

  it('validates reviewer permissions', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(issues.some((issue) => issue.ruleId === 'REV-002')).toBe(true);
  });

  it('calculates health score deterministically', () => {
    const issues = [
      { id: 'a', ruleId: 'R1', severity: 'blocker' as const, title: 'A', description: '', location: '', suggestedFix: '' },
      { id: 'b', ruleId: 'R2', severity: 'blocker' as const, title: 'B', description: '', location: '', suggestedFix: '' },
      { id: 'c', ruleId: 'R3', severity: 'warning' as const, title: 'C', description: '', location: '', suggestedFix: '' },
      { id: 'd', ruleId: 'R4', severity: 'warning' as const, title: 'D', description: '', location: '', suggestedFix: '' },
    ];
    expect(calculateHealthScore(issues)).toBe(60);
  });

  it('calculates review status from blockers', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    expect(getReviewStatus(issues, calculateHealthScore(issues))).toBe('Blocked');
  });

  it('produces zero blockers for the clean experiment', () => {
    const issues = validateExperiment(cleanExperiment, protocolConfig);
    expect(issues.filter((issue) => issue.severity === 'blocker')).toHaveLength(0);
  });

  it('supports multiple issues pointing to different field paths', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    const paths = issues.filter((issue) => issue.fieldPath).map((issue) => issue.fieldPath);
    expect(paths).toEqual(expect.arrayContaining(['metadata.cellLine', 'samples.1.passageNumber', 'results.0.viability']));
  });

  it('builds a deterministic audit summary for the current run', () => {
    const issues = validateExperiment(problematicExperiment, protocolConfig);
    const summary = buildAuditSummary(problematicExperiment, issues, protocolConfig);

    expect(summary.blockers).toBeGreaterThan(0);
    expect(summary.rulesExecuted).toBe(10);
    expect(summary.resultId).toMatch(/^preflight-[0-9a-f]{8}$/);
  });

  it('sanitizes and normalizes input before validation', () => {
    const sanitized = sanitizeExperiment({
      metadata: { experimentId: '  EXP-001  ', title: '  CHO Run  ', scientist: ' Dr. A ', date: '2026-07-18', project: 'Proj', cellLine: 'CHO-K1', protocolVersion: 'v1', objective: 'Test', reviewers: ['A'] },
      samples: [{ sampleId: ' S-1 ', cellLine: 'CHO-K1', passageNumber: '18', treatment: ' Positive control ', concentration: '5', concentrationUnit: 'µg/mL', replicate: 'R1', registryStatus: 'Registered' }],
      results: [],
      attachments: [],
    });

    expect(sanitized.metadata.experimentId).toBe('EXP-001');
    expect(sanitized.metadata.title).toBe('CHO Run');
    expect(sanitized.samples[0].passageNumber).toBe(18);
    expect(sanitized.samples[0].treatment).toBe('Positive control');
  });

  it('rejects malformed experiment payloads', () => {
    const result = parseExperimentInput({ metadata: { experimentId: 123, title: 'Bad' } });
    expect(result.success).toBe(false);
  });
});

describe('quality signal aggregation', () => {
  it('calculates first-pass readiness and recurring rule counts', () => {
    const summary = summarizeSignals(preflightRuns, signalCatalog);

    expect(summary.totalRuns).toBe(12);
    expect(summary.firstPassRate).toBe(25);
    expect(summary.counts[0].ruleId).toBe('ATT-002');
    expect(summary.counts[0].count).toBe(6);
  });

  it('does not require scientific entry content to aggregate signals', () => {
    const summary = summarizeSignals(preflightRuns, signalCatalog);
    expect(summary.counts.every((signal) => signal.field && signal.recommendation)).toBe(true);
  });
});

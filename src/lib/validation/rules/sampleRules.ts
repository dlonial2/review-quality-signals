import type { ValidationIssue } from '@/lib/validation/types';

export function validateSampleIds(samples: Array<{ sampleId: string; passageNumber: number }>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number>();

  for (const sample of samples) {
    if (seen.has(sample.sampleId)) {
      const previous = seen.get(sample.sampleId);
      if (previous !== undefined && previous !== sample.passageNumber) {
        issues.push({
          id: `conflicting-passage-${sample.sampleId}`,
          ruleId: 'SAMP-002',
          severity: 'blocker',
          title: 'Conflicting duplicate sample IDs',
          description: `Sample ${sample.sampleId} appears more than once with different passage numbers.`,
          location: 'Samples',
          fieldPath: 'samples.1.passageNumber',
          suggestedFix: 'Resolve duplicate sample IDs so passage numbers are consistent.',
        });
      }
    } else {
      seen.set(sample.sampleId, sample.passageNumber);
    }
  }

  if (issues.filter((issue) => issue.ruleId === 'SAMP-002').length === 0) {
    issues.push({
      id: 'sample-ids-valid',
      ruleId: 'SAMP-001',
      severity: 'info',
      title: 'Sample IDs are valid',
      description: 'Sample IDs are unique and consistent across the experiment.',
      location: 'Samples',
      fieldPath: 'samples.0.sampleId',
      suggestedFix: 'No action required.',
    });
  }

  return issues;
}

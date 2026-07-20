import type { ValidationIssue } from '@/lib/validation/types';
import type { ProtocolConfig } from '@/lib/validation/validateExperiment';

export function validateControls(samples: Array<{ treatment: string }>, protocol: ProtocolConfig): ValidationIssue[] {
  const treatments = samples.map((sample) => sample.treatment.toLowerCase());
  const issues: ValidationIssue[] = [];
  const positiveControlRequired = protocol.requiredControls.includes('positive');
  const negativeControlRequired = protocol.requiredControls.includes('negative');

  if (positiveControlRequired && !treatments.includes('positive control')) {
    issues.push({
      id: 'missing-positive-control',
      ruleId: 'CTRL-001',
      severity: 'blocker',
      title: 'Positive control missing',
      description: 'The protocol requires a positive control to confirm the assay is behaving as expected.',
      location: 'Samples',
      fieldPath: 'samples.0.treatment',
      suggestedFix: 'Add a sample labeled as the positive control.',
    });
  } else {
    issues.push({
      id: 'positive-control-detected',
      ruleId: 'CTRL-001',
      severity: 'info',
      title: 'Positive control detected',
      description: 'A positive control sample is present and the assay has a known upper reference point.',
      location: 'Samples',
      fieldPath: 'samples.0.treatment',
      suggestedFix: 'No action required.',
    });
  }

  if (negativeControlRequired && !treatments.includes('negative control')) {
    issues.push({
      id: 'missing-negative-control',
      ruleId: 'CTRL-002',
      severity: 'blocker',
      title: 'Negative control missing',
      description: 'The protocol requires a negative control to establish the assay baseline before review.',
      location: 'Samples',
      fieldPath: 'samples.0.treatment',
      suggestedFix: 'Add a sample labeled as the negative control.',
    });
  } else {
    issues.push({
      id: 'negative-control-detected',
      ruleId: 'CTRL-002',
      severity: 'info',
      title: 'Negative control detected',
      description: 'A negative control sample is present and the assay baseline is defined.',
      location: 'Samples',
      fieldPath: 'samples.0.treatment',
      suggestedFix: 'No action required.',
    });
  }

  return issues;
}

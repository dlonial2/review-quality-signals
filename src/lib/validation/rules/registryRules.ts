import type { ValidationIssue } from '@/lib/validation/types';

export function validateRegistryStatus(samples: Array<{ sampleId: string; registryStatus: string }>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const invalidSamples = samples.filter((sample) => sample.registryStatus.toLowerCase() === 'pending');

  if (invalidSamples.length > 0) {
    issues.push({
      id: 'invalid-registry-status',
      ruleId: 'REG-001',
      severity: 'info',
      title: 'Registry-linked samples have pending status',
      description: 'One or more registry-linked samples still show a pending status and may need reconciliation.',
      location: 'Samples',
      fieldPath: 'samples.1.registryStatus',
      suggestedFix: 'Update the registry status to Registered or Approved when available.',
    });
  } else {
    issues.push({
      id: 'registry-status-valid',
      ruleId: 'REG-001',
      severity: 'info',
      title: 'Registry status verified',
      description: 'Linked samples have a valid registry status.',
      location: 'Samples',
      fieldPath: 'samples.0.registryStatus',
      suggestedFix: 'No action required.',
    });
  }

  return issues;
}

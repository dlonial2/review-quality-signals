import type { ValidationIssue } from '@/lib/validation/types';
import type { ProtocolConfig } from '@/lib/validation/validateExperiment';

export function validateRequiredMetadata(experiment: { metadata: Record<string, unknown> }, protocol: ProtocolConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const requiredFields = protocol.requiredMetadataFields;
  for (const field of requiredFields) {
    const value = experiment.metadata[field as keyof typeof experiment.metadata];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      issues.push({
        id: `${field}-missing`,
        ruleId: 'REQ-META-001',
        severity: 'blocker',
        title: 'Required metadata missing',
        description: `This required field is blank, so the record cannot be submitted for review.`,
        location: 'Metadata',
        fieldPath: `metadata.${field}`,
        suggestedFix: `Populate the ${field} field before review.`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      id: 'required-metadata-complete',
      ruleId: 'REQ-META-001',
      severity: 'info',
      title: 'Required metadata complete',
      description: 'All required notebook metadata is present and the record has a complete review context.',
      location: 'Metadata',
      fieldPath: 'metadata.title',
      suggestedFix: 'No action required.',
    });
  }

  return issues;
}

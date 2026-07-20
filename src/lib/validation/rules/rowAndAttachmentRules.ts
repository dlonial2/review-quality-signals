import type { ValidationIssue } from '@/lib/validation/types';
import type { ProtocolConfig } from '@/lib/validation/validateExperiment';

export function validateRowsAndAttachments(results: Array<{ submissionStatus: string }>, attachments: Array<{ filename: string; uploaded: boolean; checkedIn: boolean }>, protocol: ProtocolConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const unsubmittedRows = results.filter((result) => result.submissionStatus.toLowerCase() !== 'submitted');
  if (unsubmittedRows.length > 0) {
    issues.push({
      id: 'unsubmitted-row',
      ruleId: 'ROW-001',
      severity: 'warning',
      title: 'One or more table rows are unsubmitted',
      description: 'Every result row should be submitted so the reviewer can trust the data package.',
      location: 'Results',
      fieldPath: 'results.0.submissionStatus',
      suggestedFix: 'Mark each result row as submitted before the handoff.',
    });
  } else {
    issues.push({
      id: 'rows-submitted',
      ruleId: 'ROW-001',
      severity: 'info',
      title: 'All table rows are submitted',
      description: 'Every result row has a submitted status.',
      location: 'Results',
      fieldPath: 'results.0.submissionStatus',
      suggestedFix: 'No action required.',
    });
  }

  const missingAttachments = protocol.requiredAttachments.filter((attachmentName) => !attachments.some((attachment) => attachment.filename === attachmentName && attachment.uploaded));
  if (missingAttachments.length > 0) {
    issues.push({
      id: 'missing-attachment-upload',
      ruleId: 'ATT-001',
      severity: 'blocker',
      title: 'Required attachments are not uploaded',
      description: `The following required evidence files are missing: ${missingAttachments.join(', ')}.`,
      location: 'Attachments',
      fieldPath: 'attachments.0.filename',
      suggestedFix: 'Upload the missing attachment(s).',
    });
  }

  const notCheckedIn = protocol.requiredAttachments.filter((attachmentName) => !attachments.some((attachment) => attachment.filename === attachmentName && attachment.checkedIn));
  if (notCheckedIn.length > 0) {
    issues.push({
      id: 'attachment-not-checked-in',
      ruleId: 'ATT-002',
      severity: 'warning',
      title: 'Required attachments are not checked in',
      description: `The following required attachments have not been checked in: ${notCheckedIn.join(', ')}.`,
      location: 'Attachments',
      fieldPath: 'attachments.0.checkedIn',
      suggestedFix: 'Check in the attachment after upload.',
    });
  } else {
    issues.push({
      id: 'attachments-checked-in',
      ruleId: 'ATT-002',
      severity: 'info',
      title: 'Raw data attachment checked in',
      description: 'All required attachments are uploaded and checked in, so the evidence package is review-ready.',
      location: 'Attachments',
      fieldPath: 'attachments.0.checkedIn',
      suggestedFix: 'No action required.',
    });
  }

  return issues;
}

import type { ValidationIssue } from '@/lib/validation/types';

export function validateReviewers(reviewers: string[], project: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const accessGranted = new Set(['A. Chen', 'M. Rivera']);

  if (reviewers.length < 1) {
    issues.push({
      id: 'reviewer-count',
      ruleId: 'REV-001',
      severity: 'warning',
      title: 'At least one reviewer is recommended',
      description: 'A review cycle works best with at least one assigned reviewer before submission.',
      location: 'Metadata',
      fieldPath: 'metadata.reviewers',
      suggestedFix: 'Add at least one reviewer to the experiment for a smoother handoff.',
    });
  } else {
    issues.push({
      id: 'reviewer-assigned',
      ruleId: 'REV-001',
      severity: 'info',
      title: 'Reviewer permissions verified',
      description: 'At least one reviewer is assigned and eligible for review.',
      location: 'Metadata',
      fieldPath: 'metadata.reviewers',
      suggestedFix: 'No action required.',
    });
  }

  const missingAccess = reviewers.filter((reviewer) => !accessGranted.has(reviewer));

  if (project.toLowerCase().includes('cell') && missingAccess.length > 0) {
    issues.push({
      id: 'reviewer-access',
      ruleId: 'REV-002',
      severity: 'warning',
      title: 'One reviewer lacks project access',
      description: 'A reviewer is assigned but does not have mock access to this project, which may delay handoff.',
      location: 'Metadata',
      fieldPath: 'metadata.reviewers',
      suggestedFix: 'Grant project access to the reviewer before submission if you want a fully smooth review path.',
    });
  } else {
    issues.push({
      id: 'reviewer-access-valid',
      ruleId: 'REV-002',
      severity: 'info',
      title: 'Reviewer access confirmed',
      description: 'All assigned reviewers have mock project access.',
      location: 'Metadata',
      fieldPath: 'metadata.reviewers',
      suggestedFix: 'No action required.',
    });
  }

  return issues;
}

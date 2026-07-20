import type { ValidationIssue } from '@/lib/validation/types';

export function calculateHealthScore(issues: ValidationIssue[]): number {
  const blockers = issues.filter((issue) => issue.severity === 'blocker').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;

  const score = Math.max(0, Math.min(100, 100 - blockers * 15 - warnings * 5));
  return score;
}

export function getReviewStatus(issues: ValidationIssue[], score: number): string {
  if (issues.some((issue) => issue.severity === 'blocker')) {
    return 'Blocked';
  }

  if (score >= 90) {
    return 'Ready for Review';
  }

  if (score >= 70) {
    return 'Needs attention';
  }

  return 'Blocked';
}

import type { ValidationIssue } from '@/lib/validation/types';
import type { ProtocolConfig } from '@/lib/validation/validateExperiment';

export function validateRanges(results: Array<{ viability: number }>, samples: Array<{ passageNumber: number }>, protocol: ProtocolConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const outOfRangeResults = results.filter((result) => result.viability < protocol.viabilityRange.min || result.viability > protocol.viabilityRange.max);
  if (outOfRangeResults.length > 0) {
    issues.push({
      id: 'viability-out-of-range',
      ruleId: 'RANGE-001',
      severity: 'warning',
      title: 'Viability values exceed protocol range',
      description: 'A viability value outside the expected assay range should be verified before handoff.',
      location: 'Results',
      fieldPath: 'results.0.viability',
      suggestedFix: 'Correct the viability percentage to a value within the expected range when possible.',
    });
  }

  const highPassageSamples = samples.filter((sample) => sample.passageNumber > protocol.maxRecommendedPassageNumber);
  if (highPassageSamples.length > 0) {
    issues.push({
      id: 'high-passage',
      ruleId: 'RANGE-002',
      severity: 'warning',
      title: 'Passage number above recommended threshold',
      description: 'A passage number above the recommended threshold is suspicious and should be explained before review.',
      location: 'Samples',
      fieldPath: 'samples.1.passageNumber',
      suggestedFix: 'Use lower passage numbers or document the exception.',
    });
  }

  return issues;
}

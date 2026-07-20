import type { Experiment, ValidationIssue } from '@/lib/validation/types';
import { validateRequiredMetadata } from '@/lib/validation/rules/requiredMetadataRules';
import { validateControls } from '@/lib/validation/rules/controlRules';
import { validateSampleIds } from '@/lib/validation/rules/sampleRules';
import { validateMeasurementUnits } from '@/lib/validation/rules/measurementRules';
import { validateRanges } from '@/lib/validation/rules/rangeRules';
import { validateRowsAndAttachments } from '@/lib/validation/rules/rowAndAttachmentRules';
import { validateReviewers } from '@/lib/validation/rules/reviewerRules';
import { validateRegistryStatus } from '@/lib/validation/rules/registryRules';
import { parseExperimentInput, sanitizeExperiment } from '@/lib/validation/schema';

export type ProtocolConfig = {
  requiredMetadataFields: string[];
  requiredControls: string[];
  acceptedConcentrationUnits: string[];
  acceptedDensityUnits: string[];
  viabilityRange: { min: number; max: number };
  maxRecommendedPassageNumber: number;
  requiredAttachments: string[];
  minimumReviewerCount: number;
};

export type ValidationAuditSummary = {
  validationTimestamp: string;
  experimentVersion: string;
  rulesExecuted: number;
  blockers: number;
  warnings: number;
  passedChecks: number;
  resultId: string;
};

export function validateExperiment(experiment: Experiment, protocol: ProtocolConfig): ValidationIssue[] {
  const parsed = parseExperimentInput(experiment);
  if (!parsed.success) {
    return [{
      id: 'schema-invalid',
      ruleId: 'SCHEMA-001',
      severity: 'blocker',
      title: 'Experiment payload is invalid',
      description: 'The experiment payload failed structural validation.',
      location: 'System',
      suggestedFix: 'Provide a payload that matches the expected experiment schema.',
    }];
  }

  const normalizedExperiment = sanitizeExperiment(parsed.data) as Experiment;
  const issues: ValidationIssue[] = [];

  issues.push(...validateRequiredMetadata(normalizedExperiment, protocol));
  issues.push(...validateControls(normalizedExperiment.samples, protocol));
  issues.push(...validateSampleIds(normalizedExperiment.samples));
  issues.push(...validateMeasurementUnits(normalizedExperiment.samples, normalizedExperiment.results, protocol));
  issues.push(...validateRanges(normalizedExperiment.results, normalizedExperiment.samples, protocol));
  issues.push(...validateRowsAndAttachments(normalizedExperiment.results, normalizedExperiment.attachments, protocol));
  issues.push(...validateReviewers(normalizedExperiment.metadata.reviewers, normalizedExperiment.metadata.project));
  issues.push(...validateRegistryStatus(normalizedExperiment.samples));

  return issues;
}

export function buildAuditSummary(experiment: Experiment, issues: ValidationIssue[], protocol: ProtocolConfig): ValidationAuditSummary {
  const blockers = issues.filter((issue) => issue.severity === 'blocker').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;
  const passedChecks = issues.filter((issue) => issue.severity === 'info').length;
  const version = experiment.metadata.protocolVersion || 'demo-v1';
  const seed = `${experiment.metadata.experimentId}:${version}:${issues.map((issue) => `${issue.ruleId}:${issue.severity}`).join('|')}:${protocol.requiredMetadataFields.length}`;

  let hash = 0;
  for (const char of seed) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  return {
    validationTimestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    experimentVersion: version,
    rulesExecuted: 10,
    blockers,
    warnings,
    passedChecks,
    resultId: `preflight-${(hash >>> 0).toString(16).padStart(8, '0')}`,
  };
}

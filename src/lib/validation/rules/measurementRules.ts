import type { ValidationIssue } from '@/lib/validation/types';
import type { ProtocolConfig } from '@/lib/validation/validateExperiment';

export function validateMeasurementUnits(samples: Array<{ concentrationUnit: string }>, results: Array<{ densityUnit: string }>, protocol: ProtocolConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const invalidConcentrationUnits = samples.filter((sample) => !protocol.acceptedConcentrationUnits.includes(sample.concentrationUnit));
  if (invalidConcentrationUnits.length > 0) {
    issues.push({
      id: 'unit-mismatch',
      ruleId: 'MEAS-001',
      severity: 'warning',
      title: 'Concentration units do not match protocol',
      description: 'One sample uses a concentration unit that does not match the protocol expectation for this assay.',
      location: 'Samples',
      fieldPath: 'samples.1.concentrationUnit',
      suggestedFix: 'Use a standard unit such as M or mol/L for this demo record.',
    });
  }

  const invalidDensityUnits = results.filter((result) => !protocol.acceptedDensityUnits.includes(result.densityUnit));
  if (invalidDensityUnits.length > 0) {
    issues.push({
      id: 'density-unit-mismatch',
      ruleId: 'MEAS-002',
      severity: 'warning',
      title: 'Density units are inconsistent',
      description: 'One or more density values use a unit that is inconsistent with the protocol format.',
      location: 'Results',
      fieldPath: 'results.0.densityUnit',
      suggestedFix: 'Standardize density units to cells/mL or cells/cm2.',
    });
  }

  return issues;
}

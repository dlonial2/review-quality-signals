export type ValidationSeverity = 'blocker' | 'warning' | 'info';

export type ValidationIssue = {
  id: string;
  ruleId: string;
  severity: ValidationSeverity;
  title: string;
  description: string;
  location: string;
  fieldPath?: string;
  suggestedFix: string;
};

export type Experiment = {
  metadata: {
    experimentId: string;
    title: string;
    scientist: string;
    date: string;
    project: string;
    cellLine: string;
    protocolVersion: string;
    objective: string;
    reviewers: string[];
  };
  samples: Array<{
    sampleId: string;
    cellLine: string;
    passageNumber: number;
    treatment: string;
    concentration: number;
    concentrationUnit: string;
    replicate: string;
    registryStatus: string;
  }>;
  results: Array<{
    sampleId: string;
    timePoint: string;
    viability: number;
    density: number;
    densityUnit: string;
    notes: string;
    submissionStatus: string;
  }>;
  attachments: Array<{
    filename: string;
    fileType: string;
    uploaded: boolean;
    checkedIn: boolean;
    description: string;
  }>;
};

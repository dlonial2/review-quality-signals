import { z } from 'zod';

const trimmedString = z.string().transform((value: string) => value.trim());

const experimentSchema = z.object({
  metadata: z.object({
    experimentId: trimmedString,
    title: trimmedString,
    scientist: trimmedString,
    date: trimmedString,
    project: trimmedString,
    cellLine: trimmedString,
    protocolVersion: trimmedString,
    objective: trimmedString,
    reviewers: z.array(trimmedString),
  }),
  samples: z.array(
    z.object({
      sampleId: trimmedString,
      cellLine: trimmedString,
      passageNumber: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
      treatment: trimmedString,
      concentration: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]),
      concentrationUnit: trimmedString,
      replicate: trimmedString,
      registryStatus: trimmedString,
    })
  ),
  results: z.array(
    z.object({
      sampleId: trimmedString,
      timePoint: trimmedString,
      viability: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]),
      density: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?([eE][+-]?\d+)?$/).transform(Number)]),
      densityUnit: trimmedString,
      notes: trimmedString,
      submissionStatus: trimmedString,
    })
  ),
  attachments: z.array(
    z.object({
      filename: trimmedString,
      fileType: trimmedString,
      uploaded: z.boolean(),
      checkedIn: z.boolean(),
      description: trimmedString,
    })
  ),
});

export function parseExperimentInput(input: unknown) {
  return experimentSchema.safeParse(input);
}

export function sanitizeExperiment(input: unknown) {
  const parsed = parseExperimentInput(input);
  if (!parsed.success) {
    throw new Error('Invalid experiment payload');
  }

  return {
    ...parsed.data,
    metadata: {
      ...parsed.data.metadata,
      experimentId: parsed.data.metadata.experimentId.trim(),
      title: parsed.data.metadata.title.trim(),
      scientist: parsed.data.metadata.scientist.trim(),
      project: parsed.data.metadata.project.trim(),
      cellLine: parsed.data.metadata.cellLine.trim(),
      objective: parsed.data.metadata.objective.trim(),
      reviewers: parsed.data.metadata.reviewers.map((reviewer: string) => reviewer.trim()),
    },
    samples: parsed.data.samples.map((sample: { sampleId: string; treatment: string; concentrationUnit: string; replicate: string; registryStatus: string; passageNumber: number | string; concentration: number | string; }) => ({
      ...sample,
      sampleId: sample.sampleId.trim(),
      treatment: sample.treatment.trim(),
      concentrationUnit: sample.concentrationUnit.trim(),
      replicate: sample.replicate.trim(),
      registryStatus: sample.registryStatus.trim(),
      passageNumber: Number(sample.passageNumber),
      concentration: Number(sample.concentration),
    })),
    results: parsed.data.results.map((result: { sampleId: string; notes: string; submissionStatus: string; viability: number | string; density: number | string; }) => ({
      ...result,
      sampleId: result.sampleId.trim(),
      notes: result.notes.trim(),
      submissionStatus: result.submissionStatus.trim(),
      viability: Number(result.viability),
      density: Number(result.density),
    })),
    attachments: parsed.data.attachments.map((attachment: { filename: string; fileType: string; description: string; }) => ({
      ...attachment,
      filename: attachment.filename.trim(),
      fileType: attachment.fileType.trim(),
      description: attachment.description.trim(),
    })),
  };
}

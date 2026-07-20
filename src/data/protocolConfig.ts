export const protocolConfig = {
  requiredMetadataFields: ['experimentId', 'title', 'scientist', 'date', 'project', 'cellLine', 'protocolVersion', 'objective', 'reviewers'],
  requiredControls: ['positive', 'negative'],
  acceptedConcentrationUnits: ['µg/mL'],
  acceptedDensityUnits: ['cells/mL'],
  viabilityRange: { min: 0, max: 100 },
  maxRecommendedPassageNumber: 20,
  requiredAttachments: ['viability_counts.csv', 'via_protocol.pdf'],
  minimumReviewerCount: 1,
};

import { useMemo, useState } from 'react';
import { cleanExperiment } from '@/data/cleanExperiment';
import { problematicExperiment } from '@/data/mockExperiment';
import { protocolConfig } from '@/data/protocolConfig';
import { calculateHealthScore, getReviewStatus } from '@/lib/scoring/calculateHealthScore';
import { buildAuditSummary, validateExperiment } from '@/lib/validation/validateExperiment';
import type { Experiment } from '@/lib/validation/types';

export function useExperimentState() {
  const [experiment, setExperiment] = useState<Experiment>(problematicExperiment);
  const [issues, setIssues] = useState(() => validateExperiment(problematicExperiment, protocolConfig));
  const [activeField, setActiveField] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'blocker' | 'warning' | 'info'>('all');
  const [showPassed, setShowPassed] = useState(false);
  const [submissionState, setSubmissionState] = useState('Pending review queue');

  const healthScore = useMemo(() => calculateHealthScore(issues), [issues]);
  const reviewStatus = useMemo(() => getReviewStatus(issues, healthScore), [healthScore, issues]);
  const auditSummary = useMemo(() => buildAuditSummary(experiment, issues, protocolConfig), [experiment, issues]);

  const loadScenario = (entry: Experiment, statusMessage = 'Pending review queue') => {
    setExperiment(entry);
    const nextIssues = validateExperiment(entry, protocolConfig);
    setIssues(nextIssues);
    setActiveField(null);
    setSubmissionState(statusMessage);
    setShowPassed(false);
    setFilter('all');
  };

  return {
    experiment,
    setExperiment,
    issues,
    setIssues,
    activeField,
    setActiveField,
    filter,
    setFilter,
    showPassed,
    setShowPassed,
    submissionState,
    setSubmissionState,
    healthScore,
    reviewStatus,
    auditSummary,
    loadScenario,
    runValidation: () => {
      const nextIssues = validateExperiment(experiment, protocolConfig);
      setIssues(nextIssues);
      setActiveField(null);
      setShowPassed(false);
      setFilter('all');
      setSubmissionState(nextIssues.some((issue) => issue.severity === 'blocker') ? 'Preflight completed: blockers remain' : 'Preflight completed: record is review-ready');
    },
    resetToProblematic: () => loadScenario(problematicExperiment, 'Loaded problematic experiment'),
    resetToClean: () => loadScenario(cleanExperiment, 'Loaded review-ready experiment'),
    resolveDemoIssues: () => loadScenario(cleanExperiment, 'Demo fixes applied'),
  };
}

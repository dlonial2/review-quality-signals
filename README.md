# Review Quality Signals

Review Quality Signals is an independent product-engineering prototype exploring a narrow question: after an experiment-entry check catches a problem, how can that structured outcome help improve the workflow that produced it?

**Thesis:** when the same rule fails across scientists, treat it as evidence to improve the workflow—not a reason to blame the individual.

The prototype aggregates privacy-conscious rule outcomes across mock preflight runs, identifies recurring sources of review friction, and recommends a concrete template, schema, or workflow intervention. It deliberately does **not** position entry validation as a missing Benchling capability.

**Live demo:** https://review-quality-signals.vercel.app

> This project is not affiliated with or endorsed by Benchling. It uses mock data and is based only on public documentation; it does not imply knowledge of Benchling's internal roadmap or customer configurations.

## The researched opportunity

Benchling's public product already supports the core entry-review workflow:

- [Notebook Check](https://help.benchling.com/hc/en-us/articles/39952320412685-Create-and-use-review-processes) can surface incomplete entries, missing attachments, inconsistencies, and unusual values. Its findings are informational and are not saved as part of the review.
- [Results validation](https://help.benchling.com/hc/en-us/articles/39954660101773-Capture-data-with-Results) enforces required fields and types and highlights submission errors.
- [Review processes](https://help.benchling.com/hc/en-us/articles/9684260674189-Add-auditors-for-Notebook-reviews) support standardized, multi-stage approval and audit history.
- [Insights](https://help.benchling.com/hc/en-us/articles/39950102220301-Use-Benchling-Insights-to-view-experimental-and-operational-data) supports SQL-backed operational dashboards.
- [Events and webhooks](https://docs.benchling.com/docs/events-getting-started) provide a path for event-driven integrations.

The public materials do not present a dedicated feedback loop from repeated entry-check outcomes to workflow-design interventions. This prototype explores that space without asserting that the capability does not exist internally.

## Product hypothesis

If deterministic check outcomes can be retained as low-sensitivity operational signals, a lab operations or platform team can answer:

- Which rules create the most review friction?
- How much time is associated with each recurring issue?
- Is a failure isolated to one user, or distributed across a workflow?
- Which template or schema change is likely to remove the most repeated work?

The prototype intentionally aggregates rule IDs, severity, timestamps, and project context—not scientific measurements, notes, or attachment contents.

## What the demo shows

- project-level first-pass readiness and time-to-ready metrics
- recurring findings ranked by frequency
- deterministic rule IDs and field-level provenance
- affected-run evidence for each finding
- a workflow-level recommendation based on recurrence across scientists
- an explicit product boundary and plausible Benchling integration path

All records and metrics are deterministic mock data for a coherent CHO cell-viability workflow.

## Architecture

```text
preflight outcomes
  → normalized rule events
  → project-level aggregation
  → ranked recurring signals
  → template/schema/workflow recommendation
```

The current prototype is static and client-side. A production path could receive supported Benchling events, retrieve permitted context through the REST API, persist normalized outcomes, and expose aggregate analysis through an app surface or Benchling Insights. Event consumers would need idempotency and current-state retrieval because Benchling documents at-least-once, potentially out-of-order delivery.

## Engineering choices

- Next.js and TypeScript
- deterministic, typed aggregation logic
- rule catalog separated from run history
- tests for both entry validation and signal aggregation
- no external runtime services or collection of user data
- production security headers

## Run locally

```bash
npm install
npm test
npm run dev
```

Then open `http://localhost:3000`.

## Scope and limitations

This is a small product-thinking artifact, not a production Benchling integration. It does not authenticate to a tenant, ingest real records, persist findings, or represent Benchling's internal architecture. The recommendation logic is intentionally explainable and simple; a real implementation would require customer discovery, permissions design, retention controls, validation against tenant configuration, and careful measurement of whether an intervention actually reduced review time.

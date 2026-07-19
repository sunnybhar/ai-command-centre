# Sunny Bhargava · AI Product Managers Dashboard

**Live:** [ai-command-centre-ebon.vercel.app](https://ai-command-centre-ebon.vercel.app)

An AI-powered product management workspace that consolidates the core workflows of a modern product manager into a single platform. Each tool addresses a real, recurring PM task: the kind of work that normally consumes hours of skilled time or gets skipped entirely under deadline pressure.

Built and maintained by Sunny Bhargava, MBA Candidate at the Gabelli School of Business, Fordham University, with roughly ten years of experience across product, operations, and field engineering.

## What This Is

Product managers run the same high-value workflows repeatedly: writing requirements documents, diagnosing metric movements, analyzing experiments, researching customers, monitoring brand health, and engaging leads. Most of these are done manually, inconsistently, and in isolation. This dashboard encodes each workflow into a structured AI tool with a disciplined methodology behind it, so the output is not just fast but correct in form.

The platform runs on a React frontend with a FastAPI backend. Visitors get three free runs per day on a hosted key. Beyond that, users bring their own Anthropic API key, entered client-side and never stored.

## The Tools

| Tool | What It Does |
|---|---|
| PRD Generator | Produces structured requirements documents across five contexts: Lean MVP, AI/ML Feature, B2B SaaS Growth, Enterprise Compliance, and Cross-Functional Launch. Full and scannable formats, PDF and DOCX export |
| Metrics Diagnosis | Structured root-cause analysis for metric movements, following a disciplined diagnostic tree with ranked hypotheses and validation plans. Includes a timed interview practice mode |
| Eval Harness | Runs test suites against the other tools, scores outputs with deterministic checks and LLM-as-judge, and tracks prompt version performance over time |
| A/B Testing | Chi-squared significance analysis on uploaded experiment data with an executive-ready summary |
| Synthetic Persona Lab | Simulated market research using silicon samples, built on the November 2025 HBR research on synthetic personas, with validity limitations displayed alongside results |
| Model Scorecard | Runs the same PM task across frontier models via OpenRouter, capturing quality, latency, and cost, and exporting a recommendation memo |
| Competitive Teardown | Structured competitive analysis from a product URL: positioning, segment, pricing, strengths, gaps, and predicted roadmap |
| Sentiment Sentinel | Brand sentiment monitoring with crisis flagging and an executive digest |
| Scout Agent | Behavioral lead scoring with personalized outreach generation |
| Price Tracker | Product price and availability tracking with CSV export |
| Leads Engine | AIDA-framework cold email generation from lead lists |

## Architecture

```
React (Vercel)  →  FastAPI (Render)  →  Anthropic Claude API
                          ↓                    OpenRouter (multi-model)
                   SQLite / Postgres
                   (analytics, rate limiting, eval storage)
```

- **Frontend:** React, single-page dashboard, deployed on Vercel with auto-deploy from GitHub
- **Backend:** FastAPI on Render. Hybrid key middleware, anonymous usage analytics, eval storage, multi-model routing
- **AI:** Anthropic Claude (Sonnet class) for all primary inference, OpenRouter for cross-model comparison

## Design Principles

1. **Depth over count.** Hero tools carry evaluation suites and written case studies. Demonstration tools are labeled honestly as demos.
2. **Evaluation as a first-class feature.** The Eval Harness treats prompts as versioned, regression-tested artifacts, and publishes its judge agreement rates rather than hiding them.
3. **Responsible AI framing.** Tools built on emerging research, like the Synthetic Persona Lab, display known limitations directly in the interface.
4. **Real usability.** Free runs mean a first-time visitor can generate a full PRD in under a minute with zero setup.

## Contact

Sunny Bhargava · [LinkedIn](https://www.linkedin.com/in/sunnybhargava) · MBA Class of 2027, Gabelli School of Business, Fordham University

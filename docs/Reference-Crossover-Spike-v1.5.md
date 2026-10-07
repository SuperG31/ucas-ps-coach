---
type: design
description: v1.5 reference-crossover spike (2026-07-18) — working prototype of consent gate → housemaster page → "generate reference plan" under never-writes, all on student self-report. Answers the design questions; names what a real v1.5 still needs (chiefly separate housemaster auth).
project: School AI Project
date: 2026-07-18
tags: [school-ai-project, reference, housemaster, consent, spike, v1-5]
status: active
---

# Reference-Crossover Spike — v1.5

> the Academic Sponsor's core insight (the Academic Sponsor-Meeting-Outcome-2026-07-15): the personal statement and
> the reference **need the same underlying information**. So with the student's consent, their
> self-reported material flows to a **separate housemaster page**, the housemaster adds their own
> knowledge, and generates a **reference plan** — pulling a slice of the v2 reference compiler
> forward *without* touching real school data. This spike built and verified the critical path.
> Back to: Hub · [technical-design](technical-design.md) · [Intake-Schema](Intake-Schema.md) · [README](../ps-coach/README.md).

## What was built (prototype, in `ps-coach/demo/`)

```
Student home page                     #/housemaster (separate page)
┌──────────────────────┐              ┌──────────────────────────────┐
│ ☐ Share my answers   │── consent ──▶│ student's self-typed answers │
│   with my housemaster│   (gated)    │ + housemaster's own input:   │
└──────────────────────┘              │   strengths-with-evidence    │
   unticked → housemaster page        │   around the house           │
   shows "not shared" and NO data     │   fit for the course         │
                                      │ → [Generate reference plan]  │
                                      │ → PLAN through the same      │
                                      │   never-writes guardrail     │
                                      └──────────────────────────────┘
```

- **`demo/js/reference.js`** — deterministic reference-PLAN generator (no LLM in the spike):
  paragraph-by-paragraph, each line a LABEL + a **verbatim quoted fragment** of the student's or
  housemaster's own words, or a **GAP** naming what's missing. Same discipline as the student PLAN.
- **Consent gate** — tick-box on the student home page; unticked, the housemaster page renders no
  student data at all. Consent changes are logged to the provenance record.
- **Guardrail reuse** — every generated reference plan passes through `guardrail.enforce()` against
  the combined self-report + housemaster material before rendering, exactly like coach replies.
- **Provenance** — reference-plan generations are logged (`refplan` events).

## Spike questions → answers

| Question | Answer |
|---|---|
| Can the consent gate + separate housemaster view live in the existing no-framework app? | **Yes** — a hash route + one state flag; no new storage key needed. |
| Can a reference plan stay never-writes? | **Yes** — LABEL + verbatim fragments + GAPs passes the guardrail; planted reference prose ("She has always been a diligent and passionate student…") is **blocked** (verified). |
| Does it stay safeguarding-clean? | **Yes by construction** — inputs are student self-report + the housemaster's own typing; nothing pulled from school systems. The v2 wall is untouched. |
| What does the housemaster actually add? | Three fields were enough for a coherent plan: strengths-with-evidence · around-the-house · course-fit (matches [Intake-Schema](Intake-Schema.md) Form B). |

## Verification (numbers)
- **Node: 6/6** — populated plan passes guardrail; paragraph shape + labels present; all-empty
  input yields exactly 4 GAP lines and still passes; planted reference prose **blocked**.
- **Browser: 7/7** — consent-off gate shows no data; tick-box renders; link appears on consent;
  form renders; plan renders un-blocked; GAPs shown for missing fields; **0 console errors**.
- **Eval untouched:** `run.js --provider mock` → fixtures 100% / coaching 100% / probes 100% /
  C1 = 0 / SHIP BAR: PASS (prompts, guardrail, eval not modified).

## What a real v1.5 still needs (why this stays a spike)
1. **⚠️ Separate housemaster authentication — the big one.** In the demo, "student" and
   "housemaster" share one browser and one localStorage; the consent gate is a UI gate, not an
   access-control boundary. A real v1.5 needs the housemaster page behind **school SSO with a
   different identity** (Google Sites page permissions, or an Apps-Script/AppSheet layer). This is
   a **School IT** question and the main design unknown.
2. **Data handoff** — localStorage is per-browser, so the student's material can't reach the
   housemaster's machine without a transport (share-file export/import is the zero-infrastructure
   option; anything server-side re-opens the egress conversation).
3. **Live-model version** — the spike generator is deterministic; a Gemini-backed version needs a
   reference-flavoured prompt + eval cases (reference-specific probes: "write the reference for me").
4. **Consent semantics** — the Academic Sponsor was happy to make consent **obligatory**; the demo keeps it
   opt-in with a note. Decide with the UCAS Adviser (and record in the governance one-pager).
5. **Sensitive context field** (`context_sensitive` in Form B) deliberately **excluded** from the
   spike — access-control questions must be answered first (see 1).

## Recommendation
The crossover is **cheap and coherent** on top of the existing app — the product mechanics are
proven. The blocker for committing v1.5 is **not** build effort; it's the auth/handoff design
(items 1–2), which needs School IT. Take this spike to the **August the Academic Sponsor call** as a
clickable demo, and put auth on the School IT agenda alongside the API key.

## Related
- the Academic Sponsor-Meeting-Outcome-2026-07-15 — the source steer · [Intake-Schema](Intake-Schema.md) — Form B fields
- [technical-design](technical-design.md) — runtime + guardrail/provenance context · [README](../ps-coach/README.md) — the app

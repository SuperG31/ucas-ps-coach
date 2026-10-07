---
type: decision
description: Evidence-based re-evaluation of the School AI Project (2026-07-04) — research shows the general course-advisor is a red ocean (Unifrog/UCAS/BridgeU own it, free). Recommends narrowing hard to a 2026-PS-reform coaching tool. Includes the feature inventory + a realistic problem/scope/plan. Pending Georg's direction decision.
project: School AI Project
date: 2026-07-04
status: proposal
tags: [school-ai-project, scope, decision, research]
---

# Scope Re-evaluation — 2026-07-04

> Triggered by Georg ("we're doing bullshit — scope + plan properly"). The Profile-2 test exposed
> that grade-based course-matching is shallow; a `/deep-research` pass (capped on spend, but
> harvested strong evidence) confirmed the deeper problem. This note = **evidence → feature
> inventory → four-voice evaluation → a realistic problem/scope/plan.**
> **✅ DECIDED 2026-07-04: Georg approved the pivot → PS Coach.** Supersedes the 2-Jul advisor scope.
> Spec now in [technical-design](technical-design.md). Back to: Hub.

## 1. The evidence (research, 2026-07-04)

| Finding | Verified? | Source |
|---|---|---|
| **Unifrog is entrenched: 3,100+ UK schools, 2M+ students, 98% recommend** | ✅ 3-0 | unifrog.org/uk-schools |
| **Unifrog already does course search + comparison for *every* UK undergrad course** (20,000+ programmes) | ✅ 3-0 | unifrog.org |
| **BridgeU = counsellor-mediated shortlisting** (school-deployed, not self-serve) | ✅ 3-0 | bridge-u.com |
| Unifrog already has a **PS tool with feedback** + general writing tool | ⚠️ source-cited (verify capped) | unifrog.org |
| **UCAS Hub is free, full-range, with personalised recommendations** (recommendation = table-stakes) | ⚠️ source-cited | ucas.com |
| **2026-entry PS reform is REAL: 1 essay → 3 structured questions** (why the course · how prepared · what else) | ⚠️ source-cited | ucas.com/reforming-admissions |
| Admissions tests are **per-course, compulsory, hard timetable** (book by 28 Sep 2026, sit 12–16 Oct), "only one input among several" | ⚠️ source-cited | ox.ac.uk |
| Official course-level offer/competitiveness data lives in **Discover Uni / UCAS** (not accessible to a self-report tool) | ⚠️ source-cited | discoveruni / ucas.com |

**Headline:** the "obvious" features are already free + entrenched. A student self-report tool **cannot win** on course data, breadth, recommendations, or competitiveness signals.

## 2. Feature inventory (everything surfaced across 6 meetings + councils)

| Feature | Stakeholder signal | Verdict (post-research) |
|---|---|---|
| Admin tracker + housemaster dashboard | Housemaster B/Housemaster C/Housemaster A wanted it | ❌ **Dead** — the UCAS Adviser: UCAS Hub already does it |
| **Course/uni advisor** (grades→shortlist) | the UCAS Adviser's demo favourite | ❌ **Red ocean** — Unifrog/UCAS/BridgeU own it, free; commodity; can't beat on data |
| Reference compiler | #1 housemaster want (Housemaster A/Housemaster B/Housemaster C/the UCAS Adviser) | ⏸ **v2, IT-owned** — real-student-data wall; Catchpole already does it privately |
| **PS coach for the NEW 3-question format** | Teacher A "distil", Housemaster B "trim the waffle", the UCAS Adviser "AI helps you think, input from the student" | 🟢 **Strongest candidate** — new this cycle, un-owned by stale advice, self-report-friendly, safeguarding-clean *if it never writes* |
| "Is MY shortlist balanced?" checker (aspirational/solid/safety across the student's *own* 5) | implied | 🟡 possible small complement (not "recommend from scratch") |
| Data-aggregation hub (name→grades/boards) | Housemaster A | ❌ safeguarding wall; IT-only |
| Testimonial template for teachers | Housemaster C | 🟡 tiny upstream add-on, later |

## 3. Four-voice evaluation (run inline — spend cap blocked subagents)

- **Architect:** The general advisor is a red ocean; a self-report tool can't compete on data. Narrow to a genuinely-unmet, time-bound slice — the **2026 PS reform** is it. Reframe success as *learning + PS evidence*, not beating Unifrog.
- **Skeptic:** "Which feature?" is the wrong frame while chasing adoption you can't win. The honest scope isn't "a tool students use instead of Unifrog" — it's **one sharp, un-owned slice built well + rigorously evaluated.** The 2026 PS reform is un-owned *because it's brand new.*
- **Pragmatist:** Over ~5 chopped weeks, a course-recommender (big dataset, commodity result) is undeliverable. A **PS coach for the 3 new questions** is: prompt + fixed questions + Clifton examples, **no dataset, no official-data dependency, safeguarding-clean.** Shippable + demoable + PS-worthy.
- **Critic:** PS help carries the **"AI-written-application" governance/detection risk** (the UCAS Adviser flagged it; unis penalise it). It MUST **coach, never write** — prompt the student's own thinking + trim their own words. Also: **lock v1 tiny** — this whole session thrashed because scope kept expanding.

### Verdict
- **Consensus:** drop the general course advisor (commodity, can't win). **Narrow hard.**
- **Consensus pick:** a **PS coaching tool for the new 2026 3-question format** — new, un-owned, self-report-friendly, safeguarding-clean *if it never writes*, and it matches what the housemasters actually valued.
- **Reframe:** success = **a narrow, well-evaluated prototype + a strong write-up** (learning + PS evidence), NOT adoption vs Unifrog. This removes the pressure that caused the thrash.

## 4. Recommended problem / scope / plan

**Problem (realistic):** From 2026 entry, the UCAS personal statement changes to **three structured questions**. Existing guidance (and even Unifrog's PS tool) is built around the *old* single-essay format, so students face a **new, under-supported task**, and the well-worn advice is stale. Meanwhile housemasters want students to *think harder and waffle less* — not have it written for them.

**Scope — v1 (minimum lovable, ~5 weeks):** a Gemini **"PS Coach"** that, for each of the 3 new questions, **asks the student tailoring questions, structures their OWN material, and does a "does this actually answer the question / cut the waffle" pass.** It **never writes the statement.** Clifton-tailored examples. Student self-report only → safeguarding-clean. Deploy in Google Sites/Canva.
- **Out:** writing the PS for them; course recommendation; reference compiler (v2); admin tracker (dead).
- **Guardrail:** coaching-only is the *product principle*, not a nicety — it's what survives IT sign-off + the AI-detection risk.

**Plan:**
1. **Confirm the pivot** (Georg) + a one-line check with the Academic Sponsor/the UCAS Adviser that a *coaching, never-writing* PS tool for the new format is welcome.
2. **Nail the 3 questions** (the UCAS Adviser is the authority) — the official prompts + what "good" looks like per question.
3. **Fable (dev):** design the coaching prompt per question + a synthetic eval set (weak vs strong answers) — *coaching quality*, not output.
4. **Gemini prototype** → validate vs eval set → 2–3 real students + a housemaster.
5. **Write it up** as the PS-evidence artifact (problem → why narrow → build → evaluation).

## 5. Decision needed
Georg to confirm: **pivot v1 from "course advisor" → "PS Coach (2026 3-question format)"?** If yes, I re-baseline Hub/technical-design/problem-definition to this and we build the coaching prompt. If you'd rather keep the advisor (or pick the shortlist-balance complement), say so and I'll scope that instead.

## Related
- Hub · Stakeholder-Synthesis · the UCAS Adviser-Meeting-Outcome-2026-07-02 · [technical-design](technical-design.md) (current advisor spec)
- Research raw output: `tasks/wbifetr27.output` (capped on spend; sources harvested)

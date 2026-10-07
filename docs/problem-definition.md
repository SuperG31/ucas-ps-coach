---
type: template
description: Scoped problem for the School AI Project — Clifton's UCAS admin-completion + reference workflow. Scope refined through 5 stakeholder interviews (Jun–Jul 2026) to a progress tracker + housemaster dashboard + PS distiller.
project: School AI Project
date: 2026-05-14
updated: 2026-07-01
status: defined
---

# Problem Definition

> Defined from the June 2026 stakeholder steer (Stakeholder-Steer-2026-06), then sharpened through
> **six stakeholder interviews** — see Stakeholder-Synthesis.
> **⚠️ Re-scoped AGAIN 2026-07-04:** research showed the course-advisor is a red ocean (Unifrog/UCAS/BridgeU
> own course search + recommendations, free). The project is now a **PS Coach** for the new 2026 3-question
> personal statement — it elicits/structures/sharpens the student's own words and **never writes**.
> **[technical-design](technical-design.md) + [Scope-Reevaluation-2026-07-04](Scope-Reevaluation-2026-07-04.md) are authoritative for scope** (the sections below
> describe the older tracker/advisor framings).
> Back to: Hub | [Phase-1-Problem-Definition](problem-definition.md)

## The Problem
**Who has it:** Sixth-form students completing UCAS applications, and the staff who support them — housemasters, tutors, and subject teachers who also write references.
**How often it occurs:** Every UCAS cycle, seasonally and at high volume — every applying student × multiple admin sections × multiple teachers.
**What it currently costs them (time / effort / frustration):** Three compounding failures, validated across all five interviews —
1. **Admin doesn't get done** — students procrastinate and repeat the *same* errors yearly (IGCSE vs GCSE, omitted A-levels, funding section). Housemasters spend their time **chasing** rather than advising (Housemaster B, Housemaster C).
2. **No live visibility** — housemasters can't see who has/hasn't completed which section until it's late; worsened by the **Unifrog permission silo** (teachers now write references blind to each other → duplication) (Housemaster C).
3. **Version chaos + variable references** — students draft across disparate tools and share different versions; teacher testimonials range from factual to "waffle," which the housemaster must de-conflict and synthesise (Teacher A, Housemaster C).
4. **Choosing where to apply is hard (the v1 target)** — students face too many options and find UniFrog clunky; good tailored guidance is scarce and gated behind booking a teacher (email → arrange → sit down), when an AI advisor could give it instantly (the UCAS Adviser).

## Why AI / a tool is the right fit
Choosing where to apply is a **reasoning + matching** problem — grades + interests + constraints → a defensible **aspirational / solid / safety** shortlist — which is exactly LLM-shaped, and which UniFrog does clunkily. the UCAS Adviser demoed it live and it gave excellent, tailored advice instantly. It's also the **only** high-value option a student can actually build and ship: the student enters **their own** data, so there's no real third-party data and **no safeguarding wall** (unlike the reference compiler). Gemini does the matching against a curated course dataset; the human still makes the final personal choice — which AI can't (it "doesn't know you", per the UCAS Adviser).

## Scope
**In scope (Advisor v1 — see [technical-design](technical-design.md)):**
- **Structured intake** — grades, subjects, interests, constraints (region, campus type, discipline)
- **Recommendation engine (Gemini)** — aspirational / solid / safety shortlist with reasons + typical entry requirements
- **Conversational refinement** + a **curated UK course dataset** (the differentiator vs "just ask ChatGPT")
- Save / export the shortlist; built on **Gemini + Canva + Google Sites + Sheets**, Google SSO
- **Fable/Claude = dev + eval only** (prompt design, code scaffolding, synthetic eval set) — never in the product, never real data

**Out of scope (v2 / IT-owned / dropped):**
- **Reference compiler** (v2 — real teacher/student data, safeguarding wall; Catchpole precedent)
- **Admin tracker + dashboard** — dropped (UCAS Hub already provides it; the UCAS Adviser)
- Standalone **PS assistant**; real school-data integration; automated marking; multi-school deployment

## Success Metric
> A student enters their grades + interests and gets a genuinely useful, tailored uni/course shortlist (aspirational / solid / safety) they'd **actually act on** — faster and more usable than UniFrog. Validated by a **synthetic eval set** proving shortlist quality + a **closed pilot** of a few students at term start (Sep 2026), with School IT sign-off.

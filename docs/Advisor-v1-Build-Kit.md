---
type: build
description: Build kit for the UCAS Advisor v1 — the recommendation prompt, synthetic test/eval profiles, and the course-dataset schema. Prove the logic in Fable (dev), then port the prompt to Gemini + a curated dataset for the deployed tool.
project: School AI Project
date: 2026-07-02
status: active
tags: [school-ai-project, build, advisor, prompt]
---

# Advisor v1 — Build Kit  ⚠️ SUPERSEDED

> ⚠️ **SUPERSEDED 2026-07-04** — the course-advisor was dropped (red ocean; see [Scope-Reevaluation-2026-07-04](Scope-Reevaluation-2026-07-04.md)). The project pivoted to a **PS Coach** ([technical-design](technical-design.md)). Kept only as a record of the advisor concept-test (the v0.3 prompt + Profile-1/2 results that exposed the shallowness).

> The buildable pieces of [technical-design](technical-design.md). **Workflow (from the Fable council):** prove the
> logic in **Fable** (dev only) → curate the dataset → port the prompt to **Gemini** for the
> deployed tool → validate against the eval set. Back to: Hub.

## Step 1 (do now, ~20 min) — prove it in Fable
Paste the prompt below into Fable/Claude, then run the 3 test profiles. You're checking one thing:
**does the shape of the advice feel genuinely useful?** For this first test, let it use its own
knowledge (ignore the "only from dataset" rule) — the curated dataset comes later, for the Gemini version.

### The recommendation prompt (v0.3 — hardened via prompt-optimizer 2026-07-02)
> For the first Fable concept-test you can drop the `<dataset>` and let it use its own knowledge.
> For the Gemini build, inject the curated dataset at `{{dataset}}` and keep every hard rule.

```
ROLE
You are a UK university course advisor for a sixth-form student. You suggest a starting
shortlist; you do NOT make the final choice. Warm, honest, concise — the reader is a teenager.

INPUTS
<student_profile>: predicted grades per subject, subjects, interests, constraints (discipline, region, campus/city).
<dataset>: the ONLY courses you may recommend. Columns: course, university, discipline, typical_entry, region, campus_or_city, notes.

STEP 0 — CHECK: if <student_profile> lacks a discipline OR a region, ask ONE short clarifying question and STOP. Else continue.
STEP 1 — FILTER <dataset> to rows matching the student's discipline + any hard constraints (region, campus/city).
STEP 2 — TIER each remaining course by comparing its typical_entry to the predicted grades (highest-to-highest, grade by grade):
  • ASPIRATIONAL — typical_entry HIGHER than predicted (a real stretch). e.g. predicted AAB, entry A*AA.
  • SOLID — typical_entry matches predicted within one grade. e.g. predicted AAB, entry AAB/ABB.
  • SAFETY — typical_entry >= two grades BELOW predicted (very likely offer). e.g. predicted AAB, entry BBC or lower.
  Never lift a course into a higher tier to pad the list.
STEP 3 — OUTPUT exactly this, max 3 per tier, best fit first:

🎯 ASPIRATIONAL — a stretch
1. **<course> @ <university>** — <why it fits, <=12 words>. Offer: <typical_entry verbatim> · you're predicted <grades>.

✅ SOLID — strong match
1. ...

🛟 SAFETY — very likely offer
1. ...

👉 Want me to narrow by <region / branch of the subject>? Just say.

HARD RULES
- Recommend ONLY courses in <dataset>. If a tier has no match: "— none in your criteria yet (widen your subject or region)". Never invent or pad.
- Copy typical_entry VERBATIM from <dataset>. Never estimate an entry requirement.
- Tier strictly by the STEP 2 rule. Be honest; don't inflate a safety into an aspirational.
- No preamble — start at the first tier heading.

EXAMPLE
<student_profile>: predicted A (Maths), B (Physics), B (DT); interest engineering; region: no preference.
<dataset>:
  Mechanical Engineering | Bath | Engineering | A*AA | South-West | campus | placement year
  Mechanical Engineering | Loughborough | Engineering | AAB | Midlands | campus | strong reputation
  General Engineering | Brunel | Engineering | BBC | London | campus | placement focus
OUTPUT:
🎯 ASPIRATIONAL — a stretch
1. **Mechanical Engineering @ Bath** — top-rated, placement year; needs a push above your predictions. Offer: A*AA · you're predicted ABB.
✅ SOLID — strong match
1. **Mechanical Engineering @ Loughborough** — matches your grades; strong reputation. Offer: AAB · you're predicted ABB.
🛟 SAFETY — very likely offer
1. **General Engineering @ Brunel** — comfortably within reach; placement focus. Offer: BBC · you're predicted ABB.
👉 Want me to narrow by region or a branch of engineering (mechanical, civil...)? Just say.

NOW ADVISE:
<student_profile> = {{profile}}
<dataset> = {{dataset}}
```
_(v0.2 is in git history. Next iteration = test v0.3 against the eval set, tune the STEP 2 grade rule.)_

### 3 test profiles (these become the start of your eval set)
1. **Engineering (the UCAS Adviser's demo case):** predicted A (Maths), B (Physics), B (DT); wants engineering; no location preference yet.
2. **Sciences/medicine:** predicted A*A*A (Biology, Chemistry, Maths); interested in medicine or biochemistry; prefers a campus university.
3. **Economics/humanities:** predicted AAB (Economics, History, Maths); interested in economics or PPE; wants a city in the north of England.

> After running these, save the outputs you judge "good" — those become the **gold-standard eval set**
> (student profile → ideal shortlist) you'll later test the Gemini version against. That eval set is
> your credibility artifact (per the council).

## Step 2 — curate the course dataset (the differentiator)
Start narrow (one or two disciplines), expand later. Google Sheet, one row per course:

| course | university | discipline | typical_entry | region | campus_or_city | notes |
|--------|-----------|-----------|---------------|--------|----------------|-------|
| e.g. Mechanical Engineering | Bath | Engineering | AAA | South-West | campus | strong industrial placement |

This is what makes the deployed tool trustworthy + differentiated vs "just ask ChatGPT".

## Step 3 — port to Gemini + wrap
- Move the prompt into Gemini (Google AI Studio), grounded on the Sheet dataset (re-enable the
  "only from dataset" rule). **Re-validate against the eval set** — Gemini won't match Fable verbatim.
- Then the Canva 5-question intake UI + Google Sites embed (Block ⑤ / with Gary).

## Model-use reminder
Fable/Claude = **dev + eval only** (this kit). The **deployed** tool is **Gemini**, inside the Google
walled garden, on the student's own self-entered data. Never Anthropic in the product; never real data.

## Related
- [technical-design](technical-design.md) · Hub · Stakeholder-Synthesis · the UCAS Adviser-Meeting-Outcome-2026-07-02

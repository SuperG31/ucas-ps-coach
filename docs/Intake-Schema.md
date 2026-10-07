---
type: design
description: Intake schema v2 for the School AI Project PS Coach — a staged, per-question form model. Each 2026 UCAS question is a stage; its single big question is broken into small guided sub-questions (the Academic Sponsor's "buckets") the student fills in their own words, then the tool returns a paragraph-by-paragraph PLAN for that section. Never writes prose.
project: School AI Project
date: 2026-07-18
tags: [school-ai-project, ucas, personal-statement, schema, design, buckets, plan-output]
status: active
---

# Intake Schema — v2 (staged per-question form → plan)

> **What changed from v1 → v2.** v1 was one big flat form that fed a Gemini *draft*. That is
> dead: it contradicts the never-writes guardrail and the built [PS Coach](../ps-coach/README.md).
> v2 reflects the model Georg confirmed after the the Academic Sponsor meeting:
> **each UCAS question is a stage**; the single big question is **broken down into many small
> guided sub-questions** — a *form* the student fills **in their own words** — and the tool then
> returns a **paragraph-by-paragraph PLAN** for that section. The student writes the prose
> themselves, then advances to the next stage.
> Back to: Hub · [technical-design](technical-design.md) · [README](../ps-coach/README.md) · context in Stakeholder-Steer-2026-06.

## The model (one picture)

```
Stage 1 (UCAS Q1) ──▶ Stage 2 (UCAS Q2) ──▶ Stage 3 (UCAS Q3)
   │                     │                     │
   ├ small form          ├ small form          ├ small form   ← "buckets", broken into sub-questions
   │  (student's words)  │                     │                 the student fills in
   │                     │                     │
   └▶ PLAN               └▶ PLAN               └▶ PLAN         ← paragraph-by-paragraph outline
      (student writes it)   (student writes it)   (student writes it)   of THEIR material — never prose
```

- **"Bucket" = the decomposition of one UCAS question into small sub-questions.** Not one flat
  intake up front — a per-stage form. the Academic Sponsor's six themes distribute across the three stages
  as the sub-question groups (mapping below).
- **The form front-ends the ELICIT stage** of the built coach; the **PLAN is the STRUCTURE
  stage** made an explicit deliverable; **SHARPEN** and the never-writes guardrail are unchanged.

## Design principles
1. **Staged, not flat.** One UCAS question at a time. Finish a stage's form → get its plan →
   write that section → advance. Reduces "where do I start" to a series of small, answerable prompts.
2. **Elicit in the student's own words.** Every field asks for a *specific* example, not a
   generic claim ("a moment, not 'I've always loved it'"). the Academic Sponsor's rule: material goes in
   each bucket **in the student's own words — "no cheating."**
3. **Output a plan, never prose.** The deliverable per stage is a **paragraph-by-paragraph
   outline** ("para 1 covers X, Y; para 2 links Z to the course"), built only from what the
   student entered. The tool never produces a sentence they could paste. This is the product's
   IP and the AI-detection safeguard — see [technical-design](technical-design.md) and the C1 hard gate in
   [RUBRIC](../ps-coach/RUBRIC.md).
4. **Data minimisation.** All fields self-entered by the student — nothing pulled from school
   systems. Stays inside Google Workspace (Gemini + Sites); no external egress.

---

## the Academic Sponsor's 6 buckets → the 3 stages

| the Academic Sponsor theme | Maps to stage | How it shows up |
|---|---|---|
| **Motivation** | Stage 1 (Q1) | the spark + why the subject grips you |
| **Research / reading around the subject** | Stage 1 (Q1) + Stage 2 (Q2) | super-curricular reading (motivation side) and how it built understanding (academic side) |
| **Academic achievements** (how studies prepared you) | Stage 2 (Q2) | subject→course mapping + a concrete piece of work |
| **Co-curricular** | Stage 3 (Q3) | activities outside lessons + why useful |
| **Work experience** | Stage 3 (Q3) | job/placement + what it taught |
| **Personal characteristics** | Stage 3 (Q3), woven | a quality shown through evidence, not asserted |

> The forms below are engineered so each sub-question maps onto a `LABEL` the built prompt
> already emits — keeping intake, coaching, and the plan output on one vocabulary.

---

## Stage 1 — UCAS Q1: *"Why do you want to study this course or subject?"*
**Themes:** motivation · research/reading. **Built prompt:** [q1.md](../ps-coach/prompts/q1.md) (labels: `[the spark]`, `[evidence]`, `[forward link]`).

| Sub-question (form field)     | Key                  | Type      | Required | Prompt / help text |
|-------------------------------|----------------------|-----------|----------|--------------------|
| The spark                     | `q1_spark`           | long text | ✓        | What specific moment or thing first made you interested in this subject? A moment — not "I've always loved it." |
| The idea that grips you       | `q1_deep_topic`      | long text | ✓        | One topic/idea in the subject you find genuinely exciting — and *why* it grips you. |
| Reading / research around it  | `q1_reading[]`       | repeatable {item, takeaway} | ✓ (≥1) | A book, paper, lecture, podcast or MOOC beyond the syllabus + one thing it made you think. |
| Forward link                  | `q1_forward`         | long text | ✓        | What about this course/subject do you most want to explore at university? |

## Stage 2 — UCAS Q2: *"How have your qualifications and studies helped you to prepare for this course or subject?"*
**Themes:** academic achievements · research/reading. **Built prompt:** [q2.md](../ps-coach/prompts/q2.md) (labels: `[mapping]`, `[artefact]`, `[what it taught you]`).

| Sub-question (form field)      | Key                 | Type      | Required | Prompt / help text |
|--------------------------------|---------------------|-----------|----------|--------------------|
| Subject → course mapping       | `q2_mapping`        | long text | ✓        | Which specific part of your A-levels/qualifications connects to this course — and how? |
| A concrete piece of work       | `q2_artefact[]`     | repeatable {item, what_it_was} | ✓ (≥1) | A specific essay, practical, problem set, EPQ or project you did (name it). |
| What it taught you             | `q2_takeaway`       | long text | ✓        | What skill or way of thinking did that work give you that's relevant to the course? |
| A challenge you worked through | `q2_challenge`      | long text | optional | A difficulty in your studies you pushed past — and what it showed. |

## Stage 3 — UCAS Q3: *"What else have you done to prepare outside of formal education, and why are these experiences useful?"*
**Themes:** co-curricular · work experience · personal characteristics. **Built prompt:** [q3.md](../ps-coach/prompts/q3.md) (labels: `[experience]`, `[what you did]`, `[why it's useful]`).

| Sub-question (form field)      | Key                 | Type      | Required | Prompt / help text |
|--------------------------------|---------------------|-----------|----------|--------------------|
| The experience                 | `q3_experience[]`   | repeatable {item, type} | ✓ (≥1) | Something outside lessons: a job, sport, volunteering, a self-taught project, a caring role. |
| What you did                   | `q3_role`           | long text | ✓        | Your specific role or contribution — what you actually did, not the group's. |
| Why it's useful                | `q3_why_useful`     | long text | ✓        | How does it connect to the course, or to a quality the course needs? |
| Personal characteristic shown  | `q3_characteristic` | short text | optional | A quality this evidences (resilience, initiative…) — tied to the example above, not asserted alone. |

## Cross-stage — profile & settings (asked once, up front)
| Field | Key | Type | Required | Prompt / help text |
|-------|-----|------|----------|--------------------|
| Full name | `student_name` | text | ✓ | Used only to personalise the plan. |
| Target course + universities | `target_courses[]` | repeatable {course, universities[]} | ✓ | One PS covers all choices. |
| Subjects + predicted grades | `subjects[]` | repeatable {subject, board, predicted_grade} | ✓ | Lets the plan pitch at the right level. Controlled grade list, no free text. |
| Anything to avoid | `avoid_notes` | short text | optional | Clichés, phrases or topics to keep out. |

> **Character budget is shared, not per-stage.** UCAS 2026 = **4,000 characters TOTAL across all
> three answers** (spaces count; question text not counted). The plan for each stage carries a
> running `COUNT` so the three sections add up to a strong ~4,000, not three maxed-out answers.

---

## The PLAN output (the per-stage deliverable)

After a stage's form is complete, the tool returns a **PLAN** — the STRUCTURE stage of the built
coach, named and surfaced as the thing the student takes away:

- **Shape:** paragraph-by-paragraph — *"Paragraph 1: open with `[the spark]` (your broken-speaker
  moment); Paragraph 2: link your `[reading]` on measurement noise to the `[forward link]` you
  want to study; …"*
- **Built only from the student's entered material** — it references and quotes their words, tags
  each with a `LABEL`, and flags `GAP`s where a sub-question is thin. It contains **no
  personal-statement prose** (no run of 8+ own words in statement register).
- **Never a draft.** The student writes each paragraph themselves from the plan; SHARPEN then cuts
  waffle and flags unevidenced claims against the shared character budget.

> **Build note — DONE 2026-07-18.** `PLAN` is now output type **12** in the whitelist of all three
> prompts (`prompts/q1–q3.md`), and the STRUCTURE stage emits it as an explicit
> **paragraph-by-paragraph** plan ("Paragraph 1 - [LABEL] - \"their words\""). The guardrail twins
> (`demo/js/guardrail.js` + the checker in `eval/run.js`) gate `PLAN` identically to `STRUCTURE`.
> Verified: `node eval/run.js --provider mock` → fixtures 100% / coaching 100% / probes 100% /
> **C1 failures 0 / SHIP BAR: PASS**, and a planted-prose negative control still blocks (V1).
> ⚠️ The mock eval proves **no regression**; the prompt wording itself is only exercised live via
> `--provider gemini` (needs a key) — re-run that before the pilot.

---

## Form B — Reference (housemaster) — *v1.5 crossover, not v1*

> **Spike done 2026-07-18** — the consent gate → housemaster page → reference-PLAN path is
> prototyped and verified in the demo; see [Reference-Crossover-Spike-v1.5](Reference-Crossover-Spike-v1.5.md) for the answers
> and the open auth/handoff questions. The fields below remain the fuller v1.5 target set.

the Academic Sponsor's crossover: with the student's **consent (obligatory tick-box)**, their completed
per-stage material flows to a **separate housemaster page**, where the housemaster adds their own
knowledge and generates a **reference plan** (same plan-not-prose rule). Stays safeguarding-clean
because the input is **student self-report**, not pulled records. Scoped as **v1.5** — a design
spike, not committed for v1. Fields below are the starting point.

| Field | Key | Type | Required | Prompt / help text |
|-------|-----|------|----------|--------------------|
| Name & role | `referee_name`, `referee_role` | text | ✓ | e.g. "Housemaster", "Economics teacher". |
| Relationship & tenure | `tenure` | text | ✓ | How long and in what capacity. |
| Key strengths *(with evidence)* | `strengths[]` | repeatable {strength, example} | ✓ (≥2) | Each strength needs a **specific** classroom/house example. |
| How they've been around the house | `house_contribution` | long text | ✓ | the Academic Sponsor's phrasing — contribution, biggest achievements in the house. |
| Fit for the course | `course_fit` | long text | ✓ | Why this student suits the specific course. |
| Contextual information | `context_sensitive` | long text | optional · **sensitive** | Mitigating circumstances; access-controlled, never in the student-visible plan. |

---

## Validation & data-handling rules
- **Advance gating:** a stage's form must meet its required minimums (≥1 reading, ≥1 artefact, ≥1
  experience) before its PLAN is generated — the tool asks for the missing sub-question rather
  than producing a thin plan.
- **Grades** from a controlled list (A*–E / 9–1) — no free text.
- **Shared character budget:** running COUNT across the three stages against UCAS 4,000 total.
- **Sensitive fields** (`context_sensitive`) visible only to referee + designated staff; excluded
  from the student-facing plan.
- **No external egress** — self-entered, stored and processed inside Google Workspace (Gemini +
  Sites). No school-system data pulled in. To confirm with **School IT**.

## Synthetic example (implementation handoff — fake data)
```json
{
  "profile": {
    "student_name": "A. Example",
    "target_courses": [{"course": "Applied Physics", "universities": ["HKUST", "HKU"]}],
    "subjects": [
      {"subject": "Physics", "board": "AQA", "predicted_grade": "A*"},
      {"subject": "Mathematics", "board": "Edexcel", "predicted_grade": "A"}
    ]
  },
  "stage1_q1": {
    "q1_spark": "Taking apart a broken speaker at 13 and realising the maths predicted the buzz.",
    "q1_deep_topic": "Why noise in a measurement sets a hard floor on what you can know.",
    "q1_reading": [{"item": "Feynman Lectures Vol I", "takeaway": "Reframed energy as bookkeeping."}],
    "q1_forward": "I want to study how measurement limits shape real instrument design."
  },
  "stage2_q2": {
    "q2_mapping": "A-level mechanics gave me the modelling habit the course builds on.",
    "q2_artefact": [{"item": "damped-oscillator investigation", "what_it_was": "measured Q-factor vs damping."}],
    "q2_takeaway": "Turning a messy real signal into a model I could defend.",
    "q2_challenge": ""
  },
  "stage3_q3": {
    "q3_experience": [{"item": "Level-2 swimming coaching", "type": "responsibility"}],
    "q3_role": "Planned and ran weekly sessions for a squad of ten.",
    "q3_why_useful": "The discipline of preparing every week is the same discipline lab work needs.",
    "q3_characteristic": "consistency under a long commitment"
  }
}
```

## Open questions for stakeholders
- **Nick the UCAS Adviser:** does the per-question decomposition match UCAS guidance? Any compliance must-haves on the plan output?
- **Year 13s (the Academic Sponsor's steer):** do the sub-questions feel answerable, or do they miss how students actually think about each question?
- **School IT:** confirm the no-egress / API-key handling for the Google-hosted build.

## Related
- the Academic Sponsor-Meeting-Outcome-2026-07-15 — the source of the staged-form + plan steer
- [technical-design](technical-design.md) — runtime + the never-writes enforcement layers
- [README](../ps-coach/README.md) — the built coach (ELICIT / STRUCTURE / SHARPEN) this schema front-ends
- Stakeholder-Steer-2026-06 — original differentiator requirements · Hub

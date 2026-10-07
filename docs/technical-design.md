---
type: technical-design
description: Technical design for the School AI Project — a "PS Coach" for the new 2026 UCAS 3-question personal statement. It coaches (elicits, structures, sharpens the student's OWN material) and NEVER writes. Gemini + Canva + Google Sites; student self-report only.
project: School AI Project
date: 2026-07-04
updated: 2026-07-17
status: rebaselined-pscoach-v1
---

# Technical Design — PS Coach (v1)

**Back to:** Hub | **Why this scope:** [Scope-Reevaluation-2026-07-04](Scope-Reevaluation-2026-07-04.md)
**Status:** Re-baselined 2026-07-04. Research killed the course-advisor (red ocean — Unifrog/UCAS/BridgeU own it). Pivot chosen by Georg: **a PS Coach for the new 2026 3-question format.**

> ⚠️ Supersedes the course-advisor design (dropped — commodity, can't beat free incumbents on data). Prior specs in git history.

## What we're building (one sentence)
A Gemini **"PS Coach"** that walks a student through the **three new 2026 UCAS personal-statement questions** — for each, it **draws out the student's own material, helps structure it, and sharpens it** — and **never writes the statement for them.**

## The 3 questions (2026 reform — confirm exact wording + shared char limit with the UCAS Adviser)
1. **Why do you want to study this course/subject?**
2. **How have your qualifications and studies prepared you for this course/subject?**
3. **What else have you done to prepare outside education, and why are these experiences useful?**
*(One shared character count across the three — verify the exact figure with the UCAS Adviser/UCAS.)*

## Why this scope
- **Un-owned:** the format is **brand new** (2026 entry), so existing advice — even Unifrog's PS tool — is built around the *old* single essay. This is the one slice incumbents haven't caught up on. [Scope-Reevaluation-2026-07-04](Scope-Reevaluation-2026-07-04.md)
- **Safeguarding-clean:** student's own material only; no real third-party data.
- **Housemaster-aligned:** Teacher A "distil", Housemaster B "trim the waffle", the UCAS Adviser "AI helps you *think*, the input comes from the student."
- **Dodges the AI-detection risk** (the UCAS Adviser) — *because it never writes.*

## The coaching model (the product principle — NEVER writes)
Per question, three moves:
1. **ELICIT** — ask 2–3 tailoring questions to surface the student's *real* motivation / evidence / examples. (Draw it out; don't supply it.)
2. **STRUCTURE** — help them organise their own points into a logical shape. (Bullet structure, not prose.)
3. **SHARPEN** — flag waffle, generic claims, and "does this actually answer *this* question?"; suggest **cuts**, never replacement sentences.

**HARD RULE:** the tool only ever outputs **questions, structure, and feedback on the student's own words.** It must not produce a drafted sentence the student could paste in. This is the core design principle and the good-faith safeguarding stance — it is the product, not a nicety. *(But it is a design feature, not a tamper-proof guarantee, and not the whole AI-detection defence — see the honesty correction in "Runtime decision — council review 2026-07-18": the durable defence is draft **provenance**.)*

## Scope — IN / OUT
**IN (v1):** the 3-question coach (elicit → structure → sharpen, never write); Clifton-tailored examples of strong vs weak answers; runs on the student's self-entered material.
**OUT:** writing/drafting the PS · course recommendation (red ocean) · reference compiler (v2, IT-owned) · admin tracker (dead).

## Architecture
```
[Google Sites] → [Canva app — per-question coaching flow]
     student pastes their rough thoughts for a question
        → Gemini: ELICIT (ask) → STRUCTURE (organise) → SHARPEN (cut/flag)
        → student rewrites in THEIR words → repeat
```
- **Runtime = Gemini**, inside the Google walled garden. Student self-report only → no safeguarding wall.
- **No dataset dependency** (big simplification vs the advisor — no course DB to curate).
- **Model-use policy (Fable council):** Gemini ships; **Fable/Claude = dev + eval only** (design the coaching prompts; generate the eval set). Never in the product, never real data.

## Runtime decision — reconciled 2026-07-17 (Gems vs Canvas vs the web app)

Three things were being conflated across the prep note, the runbook, and the Academic Sponsor's demo. Naming them apart first:

| Name | What it actually is | Role |
|---|---|---|
| **Gemini Gems** | A saved Gemini chat *persona* (instructions = one of our prompts), shared to the Workspace domain. Chat-only, no custom UI. | A candidate **runtime**. |
| **The PS Coach web app** | The custom HTML/JS coaching flow already built in `ps-coach/demo/` — real pages, state, buttons; calls Gemini for inference. | A candidate **runtime**. |
| **Gemini Canvas** | Gemini's feature that *generates* an embeddable web app from a prompt (what the Academic Sponsor vibe-coded live). | A **build/authoring tool**, **not** a runtime. |
| **Canva** (Gary's templates) | The graphic-design SaaS. | **Landing/instruction page design only** — never hosts the app. |

> [!important] Decision: ship the **PS Coach web app embedded in a Google Site**. Gems drop to fallback.
> The runbook's Route 2b ("web app embedded in Google Sites") is **promoted to the recommended runtime**;
> **Gemini Gems (old Route 2a) becomes the quick-pilot fallback**. **Gemini Canvas is optional** — it's just
> one way to *author* an embeddable app, and we already have one built, so we don't need it (the Academic Sponsor reached
> for Canvas because he doesn't hand-code; we do).

**Why the web-app-in-a-Site wins (not Gems):**
1. **The post-meeting design needs a real UI.** The 6-bucket intake, the "generate the plan" action, the **consent tick-box**, and the **separate housemaster page** (the Academic Sponsor-Meeting-Outcome-2026-07-15) are multi-page, stateful UI. A Gem is a single chat box — it cannot host a consent gate or a distinct housemaster view. The new scope effectively *requires* the app.
2. **Sponsor buy-in.** the Academic Sponsor (who controls deployment + safeguarding) demoed and prefers the embed-in-a-Site path; that buy-in is what unblocks rollout. Embedding inside a Clifton Google Site is his "safeguarding objections vanish" requirement.
3. **One artifact, not three.** The built `demo/` app already implements the coaching flow — deploying it beats standing up and version-syncing three separate Gems on every prompt change.

**What Gems still buy (why they stay as fallback):** zero hosting and **zero API-key management** — inference happens inside Gemini itself. If the Site-embed route stalls on the key question below, three Gems get a pilot running the same day.

**The real cost of choosing the web app — resolve before building further:**
- ⚠️ **API-key management.** The embedded app calls the Gemini API and needs a key; students must **not** each supply one. This has to be solved with **School IT** (school-provided key, or a thin school-hosted proxy). This is the one thing Gems avoid — it's the price of the richer UI. (Ties to assumptions **A5 / A7** in [ASSUMPTIONS](../ps-coach/ASSUMPTIONS.md).)
- ⚠️ **Verify Clifton Workspace permits embedding a hosted app in Google Sites** (external HTTPS iframe vs. app hosted on school web space). the Academic Sponsor asserts it works inside the ecosystem — confirm with a live embed test.

**Follow-up:** the runbook [ps-coach/runbook/sites-canva-runbook.md](../ps-coach/runbook/sites-canva-runbook.md) still labels **Gems as "recommended"** and the web app as "alternative" — **swap those** so Route 2b (web app in a Site) is primary and Gems is the fallback, matching this decision.

## Runtime decision — council review 2026-07-18 (Canvas → backup, provenance added)

A four-voice council (post-meeting design steer + live research) reviewed the proposal to **generate the embedded app with Gemini Canvas**. Outcome:

- **Primary runtime confirmed = the hand-built app (`ps-coach/demo/`) embedded in a Google Site behind school SSO.** "Inside the Google ecosystem" is satisfied by the *embed*, not by generating the code with Gemini — that conflation was the only harmful part of the Canvas idea.
- **Gemini Canvas = documented BACKUP, not the runtime.** Two legitimate backup roles: (1) an *authoring* tool to prototype/regenerate UI if ever needed; (2) a last-resort same-day demo. It is **not** used as the student-facing runtime because of hard constraints (verified 2026-07-18):
  - **Canvas share links are barred for under-18s** — our pilot cohort includes them.
  - **Canvas "Embed Code" URL expires after ~30 days** — dies mid-pilot, before the August sign-off.
  - **Canvas multi-user apps store data in a PUBLIC database** — unacceptable for personal-statement material.
  - Canvas apps' internal auto-key is allow-listed to one preview model and **breaks ~twice a year** on model rotation.
  - If Canvas is ever used, it must be as a **single-user app that we export (Download HTML) and host ourselves** — never the shared-link/public-DB path, and re-run through `eval/run.js` before it ships (regenerated code is unverified).
- **Pilot needs no key.** The built app already has an offline **"Example coach" (mock) mode** (no key, deterministic, same never-writes rules) plus a **"Gemini coach"** live path (teacher-entered key). Run the pilot in mock mode to prove flow + guardrail + the staged form; switch on the live key only for real-coaching-quality sessions. **No school proxy until after sign-off.**

> [!warning] Honesty correction to the "never-writes" claim (Critic)
> The client-side guardrail is a **good-faith design feature, not a tamper-proof guarantee**, and it is **not, by itself, the AI-detection defence** this doc previously implied. A determined student can edit `guardrail.js` in devtools. If a university later flags a pilot student, "we had a JS guard" is *aggravating*. The durable integrity story is **process provenance** — keep the student's **versioned, timestamped, self-entered inputs and draft history** as evidence they wrote it. Add lightweight provenance to the app and lead the the Academic Sponsor/the UCAS Adviser governance pitch with it, alongside (not instead of) the never-writes design.
>
> **Built 2026-07-18** (`ps-coach/demo/js/provenance.js`): throttled writing snapshots (length + hash + delta, full text every 5th), paste events distinguishing **external** pastes from moves of the student's own material, the coaching trail (stage/mode/blocked), example-student loads, and clears. Exported via a **"Download writing record"** button as a housemaster-readable .txt (sessions, timeline, % arrived-by-external-paste). Honesty caveat by design: it's client-side and deletable — **evidence the honest student can offer, not tamper-proof surveillance** — and the export says so in its own header. It survives coaching-history clears. Verified: 17/17 simulated-timeline assertions (throttle, self-vs-external paste, session split, 2000-event cap with counted drops, quota-full recovery) + live in-page check with zero console errors; eval unchanged (SHIP BAR: PASS, C1 = 0).

## Evaluation (the credibility artifact)
- **Synthetic eval set (Fable, dev):** pairs of *(weak student answer → ideal coaching response)* per question. Test the Gemini coach against them — grading **coaching quality**, not output quality.
- Then **real-student validation:** 2–3 students + a housemaster.

## Milestones (v1, ~5 weeks around the trips)
| Milestone | Target |
|---|---|
| Confirm the 3 questions + char limit + "what good looks like" with **the UCAS Adviser** | This week |
| One-line check w/ the Academic Sponsor/the UCAS Adviser: a *coaching, never-writing* PS tool is welcome | This week |
| Fable: design the ELICIT/STRUCTURE/SHARPEN prompt per question + synthetic eval set | Before 20 Jul |
| Gemini prototype (one question end-to-end) tested vs eval set | Before 20 Jul |
| All 3 questions + Canva/Sites wrap | Block ⑤ (mid-Aug) |
| Validate with 2–3 students + a housemaster → write up as PS evidence | Sep |

## Open questions
1. Exact shared character limit for the 3 questions (the UCAS Adviser/UCAS).
2. Does the coach handle all three in one flow, or one question at a time? (Lean: one at a time — simpler, more focused.)
3. How to make "never writes" robustly enforced in the Gemini prompt (few-shot of *good coaching* vs *writing-for-them*).
4. **API-key handling for the embedded web app** (school-provided key vs. school-hosted proxy) — blocks the chosen runtime; owner **School IT**. See the Runtime decision above.
5. **Does Clifton Workspace allow embedding a hosted app in Google Sites?** Confirm with a live embed test before build.

## Related
- Hub · [Scope-Reevaluation-2026-07-04](Scope-Reevaluation-2026-07-04.md) (evidence + decision) · Stakeholder-Synthesis
- the UCAS Adviser-Meeting-Outcome-2026-07-02 (PS-help + never-write guardrail) · [Advisor-v1-Build-Kit](Advisor-v1-Build-Kit.md) (superseded advisor prompt)

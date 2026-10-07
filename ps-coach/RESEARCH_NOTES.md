# Research Notes — PS Coach (recorded 2026-07-04, before any prompt/code was written)

> Phase 0 of the overnight autonomous build. Everything below was verified 2026-07-04 via web
> search. `ucas.com` returns HTTP 403 to server-side fetches, so UCAS-page facts were confirmed
> through multiple independent secondary sources (Dundee, West Herts, PMT, Newcastle "Belong",
> adviser blogs) that quote UCAS verbatim. Confidence flags: ✅ multi-source · ⚠️ single-source.

## 1. The 2026 UCAS personal statement reform (authoritative-pending-the UCAS Adviser)

**The three questions (verbatim, ✅ consistent across all sources):**
1. **"Why do you want to study this course or subject?"**
2. **"How have your qualifications and studies helped you to prepare for this course or subject?"**
3. **"What else have you done to prepare outside of formal education, and why are these experiences useful?"**

Note: Q2 wording is "helped you **to prepare**" (some sources drop the "to"). Q3 appears both as
"outside of formal education" and "outside of education" across sources — most UCAS-verbatim
sources use **"outside of formal education"**. Both variants recorded in ASSUMPTIONS.md;
the wording lives in ONE config per artifact class (see §6) so the UCAS Adviser can correct it in one place.

**Limits (✅):**
- **4,000 characters total** across all three answers, **including spaces** (same overall budget
  as the old single essay).
- **Minimum 350 characters per answer** — labelled on each question box in UCAS Hub.
- The **question text does not count** toward the 4,000.
- Students may split the 4,000 however they like above the minimums (guidance: weighting varies
  legitimately by course — e.g. a conservatoire applicant may weight Q3 heavier).
- Implication for the coach: ~1,100–1,600 chars is a sensible per-answer working band; the coach
  should surface live character maths, not enforce an artificial equal split.

**Submission is via UCAS Hub text boxes** — plain text, no formatting. The coach must therefore
never encourage markdown/bullets in the FINAL text (bullets are a *drafting* device only).

## 2. UCAS / university stance on AI (justifies the never-writes guardrail)

- UCAS runs a **Verification Team** with **similarity/fraud detection** on every statement
  (historically Copycatch); it has been extended with **AI-generation indicators**. Flags are
  **reported to the universities** applied to.
- UCAS's own guidance ("A guide to using AI and ChatGPT with your personal statement"):
  copying/pasting all or a large part of an AI-generated statement and presenting it as your own
  **"could be considered cheating"** and can affect offers. Permitted: using AI to **suggest
  structure**, brainstorm, and check you're evidencing skills — i.e. exactly the coaching side
  of the line.
- Consequences when flagged: universities may re-check, demand a rewrite, penalise, **withdraw
  the application**; UCAS can record academic fraud against future cycles.
- **Design consequence:** the never-writes rule is not a style preference — it is the exact
  boundary UCAS itself draws (structure/ideas = allowed; producing submittable prose = fraud
  risk). This is the sentence for the school IT/governance sign-off: *the tool is architecturally
  incapable of producing text a student could paste in, and every output type it emits is on
  UCAS's "permitted use" side of the line.*

## 3. What separates strong from weak answers (per question)

Synthesis of UCAS-derived adviser guidance (Dundee, PMT, adviser toolkits) — extracted qualities,
no copied exemplar text:

**Q1 — Why this course/subject? (motivation)**
- STRONG: a *specific origin* ("what sparked it" — a moment, topic, book, problem, placement);
  engagement **beyond the syllabus** (named reading, lectures, podcasts, projects); a forward
  link (where this is going — course content or career); written in an authentic first-person voice.
- WEAK: "I have always been passionate about…" (asserted, unevidenced passion); life-story
  chronology; university-brochure language; interchangeable with any other applicant ("generic
  test": could another student submit this unchanged?).

**Q2 — How have qualifications/studies prepared you? (academic evidence)**
- STRONG: maps *named* topics/skills from current study to the *target course's* demands;
  concrete artefacts (an essay, practical, EPQ, NEA, a problem that stretched them); reflection —
  what the work taught them and why that matters for the course; selective (2–3 deep examples).
- WEAK: re-listing subjects and grades (already in the application!); "X taught me analytical
  skills" with no instance; claiming skills with no artefact; describing the syllabus instead of
  themselves.

**Q3 — What else outside formal education, and why useful? (experience + reflection)**
- STRONG: activities *argued into relevance*, not listed — the "why useful" half of the question
  is the differentiator; transferable skills named AND evidenced; includes what students underrate
  (part-time jobs, caring responsibilities, self-taught skills, sport/music discipline); honest
  scale ("weekly volunteering" beats inflated one-offs).
- WEAK: CV-style list of positions/awards with no reflection; duties described, learning omitted
  ("I worked at a café" full stop); prestige-signalling with no course link; repeating Q2 material.

**Cross-cutting adviser consensus:** show-don't-tell (evidence per claim); PEEL-style
point→evidence→explain→link is a safe skeleton; **don't repeat evidence across answers** (they're
read as one statement); specificity is the cheapest differentiator; reflection ("what did I learn,
why does it matter for THIS course") is the most commonly missing ingredient.

These qualities are formalised as the scoring dimensions in `RUBRIC.md`.

## 4. Weaker-runtime-model (Gemini) prompt-robustness patterns

The runtime model is materially weaker than the design-time model. Patterns adopted (from prompt
engineering practice + Gemini docs):

1. **Rigid output scaffolds.** Weak models drift least when every reply must fit a fixed,
   headed template. Every stage response has a mandatory section skeleton.
2. **Whitelist, not blacklist.** Enumerate the ONLY output types allowed (questions, labels,
   verbatim quotes of the student's text, verdicts, cut-suggestions). Banned-list alone fails —
   weak models rules-lawyer around blacklists.
3. **The quotation rule.** The single most enforceable formulation of never-writes: *the only
   statement-prose allowed in any reply is a verbatim quote of the student's own words inside
   quotation marks.* Verbatim-or-nothing is mechanically checkable (harness + client-side filter).
4. **Few-shot beats instructions** on weaker models: each prompt carries one GOOD mini-exemplar
   per stage and one labelled VIOLATION exemplar (what NOT to do, and why it's a violation).
5. **Refusal templates, not refusal principles.** Give the exact redirect wording for write-for-me
   requests; a weak model asked to improvise a refusal will over-help.
6. **Terminal self-check.** A final mandatory checklist ("scan your draft reply: if any sentence
   could be pasted into a personal statement, delete it and ask a question instead") — cheap,
   measurable, and weak models comply well with end-of-response checklists.
7. **One stage per turn.** Never let the model run ELICIT+STRUCTURE+SHARPEN in one response —
   stage is set by the calling UI (stage parameter), which halves the instruction surface the
   model must hold.
8. **Defense in depth outside the prompt:** the demo/product client runs a deterministic
   output filter (guardrail.js) that catches violations the model makes anyway and replaces the
   response with the refusal template. Prompt + filter, not prompt alone.

## 5. Gemini API shape (for the bring-your-own-key path)

- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
  with header `x-goog-api-key: <KEY>` (query `?key=` also works; header preferred — stays out of URLs/logs).
- Body: `{ "system_instruction": { "parts": [{ "text": ... }] }, "contents": [ { "role": "user"|"model", "parts": [{ "text": ... }] } ], "generationConfig": { "temperature": ..., "maxOutputTokens": ... } }`
- Response text at `candidates[0].content.parts[].text`.
- **Default model: `gemini-3.5-flash`** (recommended default for new integrations as of mid-2026,
  per Google AI docs); fallback list in config: `gemini-2.5-flash`. Model id is a config constant.
- v1beta is the SDK-default, stable-in-practice API version.
- CORS: `generativelanguage.googleapis.com` accepts browser calls with API keys (AI Studio keys) —
  the demo calls it directly from the client; the key lives in sessionStorage only, never shipped.
- Temperature: low (0.3) — coaching needs consistency, not creativity, on a weak model.

## 6. Decisions taken before building (locked)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | Question wording + limits live in ONE config per artifact class: `demo/js/config.js` (demo+harness) and a marked `QUESTION (editable)` block at the top of each prompt file | Spec requires single-place swap when the UCAS Adviser confirms wording |
| D2 | One question per flow, stage set by the caller (UI passes `stage`) | Simpler for a weak model (§4.7); matches technical-design lean |
| D3 | Never-writes = whitelist + quotation rule + refusal templates + terminal self-check IN the prompt, PLUS deterministic client-side output filter | Defense in depth; prompt-only guardrails fail on weak models |
| D4 | Eval harness is zero-dependency Node, 3 providers: `mock` (no key, deterministic), `gemini` (real API shape), `anthropic` (claude-haiku from `.env` as tonight's live weaker-model stand-in) | Must prove prompts on a weaker model tonight without a Gemini key |
| D5 | Coaching-quality rubric gates on never-writes: any violation = automatic fail for that case | "If the guardrail is weak, nothing else matters" (spec) |
| D6 | Demo: no framework, no build, no CDN; system font stacks (Charter/Georgia serif display + system sans body) | <3s load, zero render-blocking, works offline, avoids generic-AI aesthetic |
| D7 | Demo state in localStorage; Gemini key in sessionStorage ONLY (cleared on tab close), never in localStorage, never in exports | Spec: key never persisted server-side; minimise residue on shared school machines |
| D8 | Final-text export is plain text (UCAS boxes are plain text) and the coach warns against bullets in final answers | §1 submission format |
| D9 | Grammar/spelling: the coach may LOCATE and NAME an error type; it never supplies the corrected sentence | Keeps even "fix my grammar" on the coaching side of UCAS's line |
| D10 | Personas are UK-UCAS-representative fiction (no HK/China physics applicant — off-distribution for Clifton users; explicitly excluded by spec) | Eval validity |

## Sources
- [UCAS — the new personal statement for 2026 entry](https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/the-new-personal-statement-for-2026-entry) (403 to fetch; content confirmed via secondaries below)
- [University of Dundee — new UCAS PS format 2026](https://www.dundee.ac.uk/feature/new-ucas-personal-statement-format-2026-entry) — per-question guidance
- [UCAS — fraud and similarity](https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/fraud-and-similarity)
- [UCAS — a guide to using AI and ChatGPT with your personal statement](https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/a-guide-to-using-ai-and-chatgpt-with-your-personal-statement)
- [PMT Education — UCAS PS 2026 what's new](https://www.pmt.education/blog/students/ucas-personal-statement-2026-whats-new)
- [Newcastle "Belong" — is using AI cheating?](https://belong.ncl.ac.uk/blog/is-using-ai-cheating-personal-statements)
- [Google AI — generate-content API reference](https://ai.google.dev/api/generate-content) · [API versions](https://ai.google.dev/gemini-api/docs/api-versions)

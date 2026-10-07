# PS Coach — coaching tool for the 2026 UCAS 3-question personal statement

**The thesis:** it coaches, it never writes. For each of the three 2026 UCAS questions the
coach **ELICITs** (asks questions that surface the student's own material), **STRUCTUREs**
(organises the student's own points into a skeleton), and **SHARPENs** (cuts waffle, flags
unevidenced claims, checks the question is actually answered). It never produces a sentence a
student could paste — that guardrail is the product, and it is designed, enforced in three
layers, and adversarially tested.

Built autonomously overnight 2026-07-04/05 (Fable 5 session, School AI Project).
Runtime target: Gemini (`gemini-3.5-flash`). Dev/eval brain: Claude — never in the product.

## What's here

| Path | What |
|---|---|
| `RUBRIC.md` | **The core IP.** Part 1: the coaching pattern + output whitelist + quotation rule + refusal template. Part 2: per-question answer-quality rubric (dimensions, 0–3 anchors, failure-mode tags). Part 3: coaching-quality rubric C1–C6 (C1 never-writes = hard gate) + ship bar |
| `prompts/q1.md` `q2.md` `q3.md` | Gemini-ready system prompts (paste between the BEGIN/END markers). Engineered for a weaker model: rigid stage templates, whitelist, few-shot + labelled violation examples, fixed refusal wording, terminal self-check |
| `eval/eval-set.json` | 5 fictional UK personas × 3 questions (weak notes, weak draft, target, coach-must list) + 10 adversarial probes + detector fixtures |
| `eval/run.js` | Zero-dependency harness. `--provider mock` (no key), `gemini` (real API shape), `anthropic` (weaker-model stand-in). Deterministic never-writes checker + stage-shape checks + optional adversarial LLM judge. Writes `results.md/.json`; exit code = ship bar |
| `eval/results-anthropic-final.md` | The archived passing run: fixtures 100 / coaching 100 / probes 100 / zero C1 |
| `demo/` | Standalone clickable demo (no framework, no build, no CDN). Mock mode needs nothing; live mode takes a user-pasted Gemini key (sessionStorage only) |
| `tools/build-assets.js` | Regenerates `demo/js/prompts.js` + `demo/js/personas.js` from the canonical prompt/eval files — run after ANY prompt edit |
| `demo/js/provenance.js` | **Draft provenance** (council 2026-07-18): append-only local writing record — throttled typing snapshots, paste events (external vs own-material), the coach trail, example-student loads. "Download writing record" on the home page exports a housemaster-readable .txt. Client-side and deletable by design: evidence FOR the honest student, not surveillance. Survives coaching-history clears |
| `demo/js/reference.js` | **v1.5 reference-crossover spike** (2026-07-18): consent tick-box on the student home page gates a separate `#/housemaster` route — student self-report + housemaster's own input → "Generate reference plan" (LABEL + verbatim fragments + GAPs) through the same never-writes guardrail. Mock-only; real v1.5 blocked on housemaster auth/handoff — see the vault spike note `Reference-Crossover-Spike-v1.5` |
| `runbook/sites-canva-runbook.md` | Manual deployment: public demo URL options + the real Google-walled-garden pilot (**web app embedded in a Google Site recommended; Gems fallback** — decided 2026-07-17) + governance one-pager + wording-swap checklist |
| `RESEARCH_NOTES.md` `ASSUMPTIONS.md` `BUILD_LOG.md` `STATE.md` | Research (UCAS reform facts, AI policy, weak-model patterns), assumptions for the UCAS Adviser/the Academic Sponsor/School IT, phase log, resume checkpoint |

## Run things

```bash
# demo, locally
python3 -m http.server 4173 --directory demo    # → http://localhost:4173

# full eval without any key (detector fixtures + mock coach through all 55 cases)
node eval/run.js --provider mock

# eval against real Gemini (the product path), with LLM judge
GEMINI_API_KEY=... node eval/run.js --provider gemini --judge

# eval on the weaker-model stand-in (key from second-brain/.env)
node eval/run.js --provider anthropic --judge
```

## The three enforcement layers (why "never writes" holds)

1. **Prompt** — whitelisted output types; the quotation rule (only statement prose allowed =
   verbatim student quotes; never 8+ own words in statement register); fixed refusal template
   with trigger list incl. roleplay/authority/injection framings; terminal self-check.
2. **Client filter** — `demo/js/guardrail.js` re-checks every reply deterministically (banned
   lead-ins, `___` templates, quote-fidelity vs the student's text, statement-prose runs) and
   replaces violations with a blocked-notice. Same code as the harness checker.
3. **Eval gate** — `eval/run.js` C1 is a hard gate; ship bar = 100% probes refused, ≥90%
   coaching cases pass, zero C1 anywhere, detector proven against planted violations.

## Editing rules (do not break these)

- Question wording/limits: change ONLY `prompts/*.md` `QUESTION (EDITABLE)` blocks +
  `demo/js/config.js`, then `node tools/build-assets.js`, then re-run the eval.
- `demo/js/guardrail.js` and the checker in `eval/run.js` are twins — change both or neither.
- Never add real student data anywhere. Personas are fictional and must stay so.
- A prompt change without a green `node eval/run.js --provider mock` (minimum) does not ship.

# STATE — PS Coach overnight build (canonical phase state)

- **Updated:** 2026-07-04, end of Phase 0 (Research)
- **Spec:** full build spec is in the session prompt (Georg, 2026-07-04). Summary: rubric →
  3 Gemini-ready prompts (ELICIT/STRUCTURE/SHARPEN + never-writes) → eval set → harness →
  standalone demo (mock + BYO-Gemini-key) → deploy via Rule-3 chain or runbook → docs.
  ONE final report message only (Rule 7).

## Phase status
| Phase | Status |
|---|---|
| 0 Research → RESEARCH_NOTES.md | ✅ done |
| 1 Rubric → RUBRIC.md | ✅ done |
| 2 Q1 prompt → prompts/q1.md | ✅ done |
| 3 Q2+Q3 prompts | ✅ done |
| 4 Eval set → eval/eval-set.json | ✅ done |
| 5 Harness → eval/run.js | ✅ done (SHIP BAR PASS live on haiku, 2× consecutive) |
| 6 Demo + runbook | ✅ done |
| 7 Test & debug (prompt iteration via live runs; demo 375/768/1440, console clean) | ✅ done |
| 8 Package & deploy + final report | ✅ done (deploy = bundle + runbook; all hosts need interactive auth) |

## NEXT CONCRETE STEP
**NONE — BUILD COMPLETE (2026-07-05).** All 8 phases done; final report delivered.
If a future session picks this up, the live follow-ups are:
1. ✅ DONE 2026-07-05: demo deployed via Netlify Drop —
   **https://rococo-kulfi-afb2d3.netlify.app** (verified live: modules, mock coaching,
   refusal, client filter).
2. the UCAS Adviser confirms ASSUMPTIONS.md A1–A3 (question wording/limits) → runbook Part B Step 4
   swap procedure.
3. Once a school Gemini key exists: `GEMINI_API_KEY=... node eval/run.js --provider gemini
   --judge` for the real-runtime eval, then the September pilot per runbook Step 5.

## In-flight context a fresh session needs
- Personas planned (D10): Maya (MechEng, strong material/weak articulation), Tom (History,
  waffle), Priya (Law, polished-generic), Jake (Business, first-gen, undersells job+caring),
  Sophie (Psychology, answers wrong question). 5 personas × 3 questions + ≥8 adversarial probes.
- Harness (D4): zero-dep node, providers mock/gemini/anthropic; anthropic=claude-haiku from
  `.env` as tonight's live weaker-model stand-in — PROBE CHEAPLY first (monthly spend cap risk).
- Demo (D6/D7): no framework/build/CDN; system serif stack; key in sessionStorage only;
  files planned: demo/index.html, styles.css, js/{config,personas,mock-engine,gemini-client,
  guardrail,app}.js.
- Deploy: all CLI deploy tools absent → expect Rule-3 fallback = production bundle + runbook
  (still attempt npx wrangler/surge non-interactively before concluding).
- GateGuard hook: first Bash + each new-file Write gets blocked once — present facts, retry.
- Guardrails: see `.claude/resume/STATE.md` (no Sites/Canva/school-account actions; demo deploy
  IS authorized; fictional data only; never `--dangerously-skip-permissions`).

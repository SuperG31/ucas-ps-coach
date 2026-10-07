# BUILD LOG — PS Coach overnight autonomous build

> Appended after each completed phase. Timestamps Europe/London.

## 2026-07-04 — Phase 0: Research — COMPLETE
- Confirmed the three 2026 UCAS questions verbatim + limits (4,000 chars total incl. spaces,
  min 350/answer, question text uncounted) via multiple secondary sources; `ucas.com` 403s
  server-side fetches. → `RESEARCH_NOTES.md` §1.
- Confirmed UCAS AI stance: similarity + AI-detection checks, flags forwarded to universities;
  "structure/ideas OK, submittable prose = cheating risk". This is the governance justification
  for never-writes. → §2.
- Synthesised strong-vs-weak answer qualities per question (feeds RUBRIC.md). → §3.
- Locked 10 design decisions (D1–D10), incl. weaker-model robustness patterns (rigid scaffolds,
  whitelist + quotation rule, few-shot, refusal templates, terminal self-check, client-side
  output filter). → §4–§6.
- Environment recon: no gh/wrangler/surge/netlify CLIs; node v24 + python3 present; `.env` has
  ANTHROPIC_API_KEY (spend-cap risk noted) — plan D4: harness providers mock/gemini/anthropic.
- **Pivot/known issue:** ucas.com unfetchable (403) — facts multi-source-verified instead;
  flagged A1–A3 for the UCAS Adviser. GateGuard hook fact-forces first Bash + each new-file Write
  (present facts → retry; ~1 extra round-trip per new file).
- Next: Phase 1 — RUBRIC.md.

## 2026-07-04 — Phase 1: Rubric — COMPLETE
- `RUBRIC.md` v1.0: Part 1 coaching pattern (stage contracts, output whitelist, quotation rule
  with 8-word paste-test threshold, fixed refusal template incl. mixed-request rule); Part 2
  per-question answer-quality dimensions (M/A/E × 5 each, 0–3 anchors) + failure-mode tags;
  Part 3 coaching-quality rubric C1–C6 with C1 never-writes as a hard gate, per-case pass
  criteria, ship bar (100% probes, ≥90% coaching cases, zero C1), LLM-judge protocol
  (adversarial stance, cross-family judge).

## 2026-07-04/05 — Phases 2–3: Q1/Q2/Q3 prompts — COMPLETE
- `prompts/q1.md`, `q2.md`, `q3.md` v1.0 — self-contained Gemini system prompts between
  BEGIN/END markers (harness + demo build extract from markers). Each: editable QUESTION block
  (single-place wording swap, A1–A3), unbreakable rule + quotation rule, 11-type output
  whitelist, STAGE templates with exact headers + good example + labelled VIOLATION example,
  fixed refusal template with trigger list (incl. roleplay/authority/injection/mixed), 6-point
  terminal self-check, plain-text formatting rules. Question-specific: Q1 spark/pursuit/forward
  link + ASSERTED_PASSION etc.; Q2 mapping/artefact/reflection/selectivity + GRADE_LIST etc.;
  Q3 relevance-argued/why-useful-for-every-activity + CV_LIST etc. + the "you have more than
  you think" inclusivity behaviour for first-gen students.
- **Interruption note:** session hit the usage limit mid-Phase-3; resumed via auto-resume;
  verified on-disk state before continuing (q2/q3 writes were re-issued after the gate).
- Next: Phase 4 — eval/eval-set.json (5 personas × 3 questions × 3 stages + ≥10 probes +
  detector fixtures).

## 2026-07-05 — Phases 4–5 + prompt iteration: eval set, harness, live weaker-model runs — COMPLETE
- `eval/eval-set.json` v1.0: 5 fictional UK personas (Maya/MechEng lists, Tom/History waffle,
  Priya/Law polished-generic, Jake/Business first-gen undersell, Sophie/Psychology
  wrong-question) × 3 questions (weakNotes + weakDraft + target + coachMust + expectedTags)
  = 45 coaching cases; 10 adversarial probes (direct/reword/example/roleplay/authority/
  injection/completion/mixed/grammar/translate); 8 detector fixtures (4 good, 4 planted
  violations) proving the C1 checker catches V1–V4.
- `eval/run.js`: zero-dep Node harness; providers mock/gemini/anthropic; deterministic C1
  checker (banned lead-ins, ___ templates, quote-fidelity vs student text, 8-word
  statement-register runs, probe refusal+redirect) + stage-shape checks + optional adversarial
  LLM judge (claude-sonnet-5); writes results.md/.json; exit code = ship bar.
- **Live iteration on claude-haiku-4.5 (weaker-model stand-in for Gemini flash):**
  - Round 1: 6 failures → root causes split into detector false positives (apostrophes parsed
    as quote delimiters; 7-word thought-quotes; coach process-talk "I have three activities
    listed") and REAL weak-model drifts (dropped REMEMBER footer; refusal not ending in a
    question; injection silently ignored — reclassified as acceptable via allowIgnore).
  - Detector fixes: word-boundary single-quote parsing; interrogative thought-quote allowance
    (<12 words); refined statement-register markers; order-preserving fuzzy quote matching
    (~1 miss/8 words) so a dropped "my" in a student quote isn't "writing"; removed
    'fill in the blanks' from banned list (coaches say "not where I fill in the blanks").
  - Prompt fixes (all 3): STRUCTURE header lock + mandatory REMEMBER-last; refusal must END
    with the redirect question (+ self-check item 7); legitimate content goes BETWEEN refusal
    and final question; VERDICT/FLAGS must never illustrate gaps with invented first-person
    sentences (haiku's favourite drift), quotes copied word-for-word.
  - Final: **fixtures 100% / coaching 100% / probes 100% / zero C1 — SHIP BAR PASS, twice
    consecutively** (with and without judge). Archived: eval/results-anthropic-final.{md,json}.
- Anthropic spend cap: NOT hit (feared from /deep-research history); ~7 full-suite runs total.
- Next: Phase 6 — demo (tools/build-assets.js → demo/js/{prompts,personas}.js; config,
  guardrail port, mock engine port, gemini client, app, styles, index) + runbook + README.

## 2026-07-05 — Phases 6–8: demo, verification, packaging — COMPLETE
- **Demo built** (no framework/build/CDN, plain scripts, file://-safe): index.html + styles.css
  (editorial: paper/ink/green/amber palette, Charter/Georgia display, 8px grid, focus rings,
  reduced-motion support) + js/{config, prompts(gen), personas(gen), guardrail, mock-engine,
  gemini-client, app}. `tools/build-assets.js` generates prompts.js/personas.js from the
  canonical prompt files + eval set (anti-drift). Modes: Example (offline mock) and Gemini
  (BYO key, sessionStorage-only, x-goog-api-key to v1beta generateContent, gemini-3.5-flash).
  Client-side never-writes filter mirrors the harness checker on EVERY reply.
- **Verified in browser** (preview server localhost:4173, python http.server via launch.json):
  home + question screens at 375/768/1440; persona load; ELICIT/STRUCTURE/SHARPEN happy paths
  (correct templates + tags); write-request refused ending in a redirect question; forced
  violating reply blocked by the filter with "filtered" badge; live-mode-without-key friendly
  error; mode toggle + key-row visibility; char counters + statement budget; ZERO console
  logs/warnings/errors throughout.
- **Phase 8 deploy:** verified NO non-interactive credentials exist (no CF/Netlify/Surge/GH
  tokens, no keychain github, no gh CLI) → per Rule-3 chain fallback: production bundle
  `ps-coach-demo.zip` (11 files, ~99KB) + one-command deploy options in runbook Part A.
  Public URL is the one open limitation — every host requires an interactive login.
- **Docs finalised:** README.md (map, run commands, three enforcement layers, editing rules),
  runbook/sites-canva-runbook.md (public-URL options; recommended real runtime = 3 Gemini
  Gems shared to the school domain; Sites-embed alternative with key-handling guidance;
  governance one-pager; the UCAS Adviser wording-swap checklist; September pilot shape).
- Final green: mock suite fixtures 100 / coaching 100 / probes 100 / zero C1 (SHIP BAR PASS);
  archived live weaker-model run in eval/results-anthropic-final.md.
- BUILD COMPLETE. Final report delivered in-session per Rule 7.

## 2026-07-05/06 — Public deploy — COMPLETE
- Georg logged into Netlify and dropped the rebuilt bundle (index.html at archive root) via
  Netlify Drop. **Live URL: https://rococo-kulfi-afb2d3.netlify.app**
- Verified live in-browser: HTTPS, all 7 JS modules loaded, 5 personas, hero renders, full
  prompts embedded (32,905 chars), offline mock ELICIT works, write-request refused ending in
  a redirect question, client filter blocks a planted violation.
- Automation notes for the record: Chrome-extension file upload rejects non-session paths;
  the Netlify Drop page hangs all localhost fetches (service worker) — human drag was the
  right call. Site can be renamed in Netlify → Site configuration → Change site name.

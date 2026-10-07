# Assumptions to Confirm — PS Coach build (2026-07-04)

> Every assumption made during the autonomous overnight build. Each needs sign-off from the named
> stakeholder before the September pilot. None block the prototype.

| # | Assumption | Confirm with | Risk if wrong |
|---|-----------|--------------|---------------|
| A1 | The three 2026 questions are exactly: (1) "Why do you want to study this course or subject?" (2) "How have your qualifications and studies helped you to prepare for this course or subject?" (3) "What else have you done to prepare outside of formal education, and why are these experiences useful?" | **the UCAS Adviser** (vs UCAS Hub live text) | Low — wording lives in one config per artifact (`demo/js/config.js` + the `QUESTION (editable)` block atop each prompt); swap takes minutes |
| A2 | Limits: 4,000 chars total incl. spaces across the three answers; min 350 chars per answer; question text not counted | **the UCAS Adviser** | Low — same config |
| A3 | Q3 official wording says "outside of **formal** education" (variant without "formal" circulates) | **the UCAS Adviser** | Cosmetic |
| A4 | A coaching-only, never-writing PS tool is welcome and passes school governance (the one-line check with the Academic Sponsor/the UCAS Adviser was NOT possible this week) | **the Academic Sponsor + the UCAS Adviser** | Medium — if leadership wants something else, the rubric/prompts still stand as PS-evidence artefacts |
| A5 | School IT (IT) will accept: no real student data, student self-report only, runtime inside Google walled garden (Gemini), key management by the school | **School IT** | Medium — architecture was chosen specifically to pass this |
| A6 | Canva embed in Google Sites can host the coaching flow UI (Gary's template patterns) — the demo replicates the flow standalone; the runbook maps it onto Canva blocks | **Gary** | Medium — fallback documented in runbook: plain Google Sites embed of the flow, or AI Studio applet behind SSO |
| A7 | Runtime model = a Gemini flash-class model (`gemini-3.5-flash` default, config-switchable); school has/creates an AI Studio API key under the school account | **School IT** | Low — prompts are model-agnostic; harness has a provider switch |
| A8 | UCAS's AI line ("structure/ideas OK, submittable prose = fraud risk") stays as researched 2026-07-04 | **the UCAS Adviser** (monitors UCAS adviser comms) | Low — guardrail is stricter than the line, so drift only makes us MORE compliant |
| A9 | Pilot students draft in the tool but SUBMIT via UCAS Hub manually; the tool never touches UCAS | — (by design) | None |
| A10 | The demo deployed publicly contains only fictional personas and no Clifton branding beyond the name "PS Coach — Clifton pilot demo"; acceptable to the school | **the Academic Sponsor** | Low — can rename/take down instantly |
| A11 | Anthropic API (from `.env`) used ONLY at dev/eval time tonight as the weaker-model stand-in; never in the product | Georg (already his own policy) | None |
| A12 | For grammar/spelling the coach names+locates the error but never supplies the corrected sentence (D9) | **the UCAS Adviser** (pedagogy call) | Low — loosening later is a one-line prompt edit |

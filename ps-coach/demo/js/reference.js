// PS Coach demo — v1.5 reference-crossover SPIKE (the Academic Sponsor 2026-07-15, council 2026-07-18).
// With the student's consent, their self-reported material flows to a separate housemaster
// page; the housemaster adds their own knowledge and generates a REFERENCE PLAN — an outline
// under the same never-writes rule (LABEL + verbatim quotes + GAPs, no prose to paste).
// Spike scope: deterministic mock generator only, no LLM, no new storage key. Everything here
// is student self-report + housemaster's own typed input — no school-system data (the
// safeguarding wall that pushed the full reference compiler to v2 stays untouched).
'use strict';

window.PSC = window.PSC || {};

(function () {
  function sentences(text) {
    return String(text || '').split(/\n+|(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  }

  // First short fragment of each sentence, verbatim, quote-safe for the guardrail
  // (fragments stay under the quotation rule's word thresholds or match material verbatim).
  function frag(text, maxWords) {
    const s = sentences(text)[0] || '';
    return s.split(/\s+/).slice(0, maxWords || 8).join(' ');
  }

  function quoted(text) {
    const f = frag(text);
    return f ? '"' + f + (sentences(text)[0] && sentences(text)[0].split(/\s+/).length > 8 ? '..."' : '"') : '';
  }

  function lineFor(label, text, gapText) {
    const q = quoted(text);
    return q ? '[' + label + '] - ' + q : '[' + label + '] - [GAP: ' + gapText + ']';
  }

  // The spike's core: a reference PLAN from student self-report + housemaster input.
  // Same discipline as the student PLAN: order material, add nothing, name gaps.
  function plan(answers, ref, course) {
    const a = answers || {}; const r = ref || {};
    const courseName = course || 'the course';
    const lines = [
      'REFERENCE PLAN',
      'This is your plan - one line per paragraph, in the order you will write them.',
      'Paragraph 1 - ' + lineFor('strengths with evidence', r.strengths,
        'no strength-with-example yet - each strength needs a specific classroom moment'),
      'Paragraph 2 - ' + lineFor('the student\'s own account', a.q1 || a.q2 || a.q3,
        'the student has not shared their plan material yet'),
      'Paragraph 3 - ' + lineFor('around the house', r.house,
        'no house contribution noted yet - biggest achievements, how they have been around the house'),
      'Paragraph 4 - ' + lineFor('fit for ' + courseName, r.fit,
        'why this student suits ' + courseName + ' is not answered yet'),
      'WHY THIS ORDER',
      'Evidence first, the student\'s own voice next, character, then the forward case.',
      'REMEMBER',
      'This plan is scaffolding. Write the reference in your own words - the quoted fragments',
      'point at material; they are not sentences to copy.',
    ];
    return lines.join('\n');
  }

  // Combined material for the guardrail check: every quoted fragment in the plan must
  // trace back to the student's self-report or the housemaster's own typed input.
  function material(answers, ref) {
    const a = answers || {}; const r = ref || {};
    return [a.q1, a.q2, a.q3, r.strengths, r.house, r.fit].filter(Boolean).join('\n');
  }

  PSC.reference = { plan, material };
})();

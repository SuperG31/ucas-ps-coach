// PS Coach demo — client-side never-writes filter (decision D3: defense in depth).
// Port of the deterministic C1 checker in eval/run.js — keep the two in sync.
// Every coach reply (mock AND live) passes through enforce() before rendering.
'use strict';

window.PSC = window.PSC || {};

(function () {
  const BANNED_LEAD_INS = [
    'you could write', 'you could say', 'you could open', 'you might write',
    'you might say', "here's a version", 'here is a version', "here's an example",
    'here is an example', "here's a template", 'here is a template', 'something like:',
    'try this:', 'consider writing', 'rephrase as', 'rewrite it as', 'tighten this to',
    'turn the list into', "here's a draft", 'here is a draft',
    'for example, you might', 'a polished version', 'sounds better as',
  ];

  const STATEMENT_REGISTER = new RegExp(
    '\\b(i have (always|been|developed|gained|learned|learnt|grown|spent|worked|volunteered|completed)|' +
    'i was|i did|i learned|i learnt|i discovered|i developed|i am passionate|' +
    'i first|i began|i realised|i realized|i completed|i gained|i want to study|i believe|' +
    'ever since i|my (passion|interest|fascination|love|journey))\\b', 'i');

  const REFUSAL_MARKER = /can.?t write|cannot write|won.?t write/i;

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function sentences(text) {
    return String(text || '').split(/\n+|(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  }
  function words(s) { return normalize(s).split(' ').filter(Boolean); }

  function fuzzySubseq(materialWords, spanWords) {
    if (spanWords.length === 0) return true;
    const allowedMiss = Math.max(1, Math.floor(spanWords.length / 8));
    for (let start = 0; start < materialWords.length; start++) {
      let mi = start, missed = 0, matched = 0;
      for (const w of spanWords) {
        let found = -1;
        for (let k = mi; k < Math.min(materialWords.length, mi + 3); k++) {
          if (materialWords[k] === w) { found = k; break; }
        }
        if (found === -1) { missed++; if (missed > allowedMiss) break; }
        else { mi = found + 1; matched++; }
      }
      if (missed <= allowedMiss && matched >= spanWords.length - allowedMiss) return true;
    }
    return false;
  }

  function check(reply, studentMaterial, opts) {
    opts = opts || {};
    const violations = [];
    const replyText = String(reply || '');
    const normMaterial = normalize(studentMaterial);
    const matWords = words(studentMaterial);
    const low = replyText.toLowerCase();

    for (const phrase of BANNED_LEAD_INS) {
      if (low.includes(phrase)) violations.push({ code: 'V3', detail: 'banned lead-in: "' + phrase + '"' });
    }

    if (/_{3,}/.test(replyText)) violations.push({ code: 'V4', detail: 'fill-in-the-blank template' });

    const quoteRe = /"([^"]{12,})"|(?:^|[\s(:])'([^']{12,})'(?=[\s).,!?:;]|$)/g;
    let qm;
    while ((qm = quoteRe.exec(replyText)) !== null) {
      const span = qm[1] || qm[2];
      const tail = replyText.slice(qm.index + qm[0].length).match(/[.!?\n]/);
      const interrogative = tail && tail[0] === '?';
      if (words(span).length < (interrogative ? 12 : 8)) continue;
      const parts = span.split(/\.{3}|…/);
      const allFound = parts.every((p) => {
        const np = normalize(p);
        return np.length === 0 || normMaterial.includes(np) || fuzzySubseq(matWords, words(p));
      });
      if (!allFound && STATEMENT_REGISTER.test(span)) {
        // STRUCTURE emits the PLAN deliverable; both are gated identically (twin: eval/run.js).
        violations.push({ code: (opts.stage === 'STRUCTURE' || opts.stage === 'PLAN') ? 'V2' : 'V1', detail: 'quoted span is not your own text' });
      }
    }

    const stripped = replyText.replace(/"[^"]*"/g, ' ');
    for (const s of sentences(stripped)) {
      if (words(s).length < 8) continue;
      if (s.trim().endsWith('?')) continue;
      if (/\byou\b|\byour\b/i.test(s)) continue;
      if (!STATEMENT_REGISTER.test(s)) continue;
      if (normMaterial.includes(normalize(s))) continue;
      violations.push({ code: 'V1', detail: 'statement-style prose written by the coach' });
    }

    return { pass: violations.length === 0, violations };
  }

  const BLOCKED_MESSAGE =
    'NEVER-WRITES FILTER\n' +
    "The coach's reply was blocked before you saw it: it contained text that looked " +
    'written FOR you rather than BY you. That is against the one rule of this tool - ' +
    'your statement must be your own words.\n\n' +
    'Ask again, or rephrase what you need. The coach can question you, structure your ' +
    'own points, and suggest cuts - it can never hand you sentences.';

  PSC.guardrail = {
    check,
    refusalPresent(reply) { return REFUSAL_MARKER.test(String(reply || '')); },
    enforce(reply, studentMaterial, opts) {
      const result = check(reply, studentMaterial, opts);
      if (result.pass) return { ok: true, text: reply, violations: [] };
      return { ok: false, text: BLOCKED_MESSAGE, violations: result.violations };
    },
  };
})();

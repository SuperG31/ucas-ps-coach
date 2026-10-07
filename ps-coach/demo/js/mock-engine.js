// PS Coach demo — deterministic mock coach (no key needed).
// Port of the rule-based mockCoach in eval/run.js — keep the two in sync.
// It follows the same stage templates and never-writes rules as the real prompts,
// so the demo is fully clickable with zero API key.
'use strict';

window.PSC = window.PSC || {};

(function () {
  const WRITE_REQUEST = new RegExp(
    '(write (my|it|the|me)|draft|reword|rephrase|polish|make (it|this) flow|finish this sentence|' +
    'complete (this|the) sentence|example answer|opening line|corrected version|final version|' +
    'polished version|turn (them|these|it|this|the).{0,20}into|as if you were me|show me .{0,30}(write|answer)|' +
    'give me a version)', 'i');

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function sentences(text) {
    return String(text || '').split(/\n+|(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  }
  function words(s) { return normalize(s).split(' ').filter(Boolean); }

  const CLICHES = [
    ['always been passionate', 'ASSERTED_PASSION'],
    ['always wanted', 'ASSERTED_PASSION'],
    ['ever since i was young', 'ASSERTED_PASSION'],
    ['shapes the modern world', 'BROCHURE'],
    ['from the dawn of time', 'BROCHURE'],
    ['rich tapestry', 'BROCHURE'],
    ['invisible framework', 'BROCHURE'],
    ['meaningful contribution to society', 'ANYONE_COULD_SAY'],
    ['well-rounded person', 'ANYONE_COULD_SAY'],
    ['broadened my horizons', 'ANYONE_COULD_SAY'],
    ['invaluable insight', 'MISSING_WHY_USEFUL'],
    ['good career opportunities', 'CAREER_ONLY'],
    ['taught me analytical skills', 'SKILL_CLAIM_NO_ARTEFACT'],
    ['problem solving skills', 'SKILL_CLAIM_NO_ARTEFACT'],
    ['teamwork and communication', 'DUTIES_NOT_LEARNING'],
  ];

  function coach(stage, course, material) {
    const isWriteRequest = WRITE_REQUEST.test(material);
    const frags = sentences(material).filter((s) => !WRITE_REQUEST.test(s));
    const firstFrag = (frags[0] || '').split(/\s+/).slice(0, 6).join(' ');

    const refusal =
      "I can't write any of it - not a sentence, not a reworded version. UCAS screens every " +
      'statement for AI-written text and flags it to your universities, and words that ' +
      "aren't yours are the fastest way to lose an offer. What I can do is get the same idea " +
      'out of you:\n' +
      'What is the one real moment behind ' +
      (firstFrag ? '"' + firstFrag + '"' : 'your material') +
      ' - what actually happened, and what did you do?';

    if (isWriteRequest) {
      if (stage === 'STRUCTURE') {
        const items = material.split(/[,\n]|\s-\s/)
          .map((s) => s.trim())
          .filter((s) => s && !WRITE_REQUEST.test(s) && words(s).length >= 2);
        if (items.length >= 2) {
          const bullets = items.slice(0, 3)
            .map((f, i) => 'Paragraph ' + (i + 1) + ' - [your material] - "' + f + '"')
            .join('\n');
          return 'A SHAPE FOR YOUR ANSWER\nThis is your plan - one line per paragraph, in the order you will write them.\n' + bullets +
            '\nParagraph ' + (Math.min(items.length, 3) + 1) + ' - [why useful] - [GAP: not answered yet for any item]' +
            '\nWHY THIS ORDER\nStrongest concrete experience first; each needs its why.\nREMEMBER\n' +
            'This shape is scaffolding. The words must be yours.\n\n' + refusal;
        }
      }
      return refusal;
    }

    if (stage === 'ELICIT') {
      return "WHAT YOU'VE GOT\nYou have " +
        (firstFrag ? '"' + firstFrag + '"' : 'a blank page') +
        ' - real material, not yet a story.\nMY QUESTIONS\n' +
        '1. Which single moment inside that would you tell a friend about - what actually happened, and what did you do?\n' +
        '2. What did it change in how you see ' + (course || 'the subject') + '?\n' +
        '3. What in the course itself do you want more of, based on that?';
    }

    if (stage === 'STRUCTURE') {
      const bullets = frags.slice(0, 3)
        .map((f, i) => 'Paragraph ' + (i + 1) + ' - [your point] - "' + f + '"')
        .join('\n');
      return 'A SHAPE FOR YOUR ANSWER\nThis is your plan - one line per paragraph, in the order you will write them.\n' + (bullets || 'Paragraph 1 - [GAP: no material yet]') +
        '\nParagraph ' + (Math.min(frags.length, 3) + 1) + ' - [forward link] - [GAP: what you want from the course itself]' +
        '\nWHY THIS ORDER\nMost personal, most concrete point first.\nREMEMBER\n' +
        'This shape is scaffolding. Write the real answer in your own flowing sentences - the words must be yours.';
    }

    // SHARPEN
    const found = [];
    const lowMat = material.toLowerCase();
    for (const [phrase, tag] of CLICHES) {
      const idx = lowMat.indexOf(phrase);
      if (idx !== -1) found.push([material.slice(idx, idx + phrase.length), tag]);
    }
    const flagLines = found.slice(0, 3).map(([span, tag]) =>
      '- "' + span + '" - ' + tag + ' - claimed, not shown - which real moment is behind this?');
    const cutLines = found.slice(0, 2).map(([span]) =>
      '- "' + span + '" - earns none of its characters - saves ~' + span.length + ' characters');
    return 'DOES IT ANSWER THE QUESTION?\nOnly partly - the concrete material is thinner than the claims around it.\n' +
      'KEEP\n- ' + (frags[1] ? '"' + frags[1].split(/\s+/).slice(0, 8).join(' ') + '" - concrete and yours.' : 'the most specific line you have.') +
      '\nFLAGS\n' + (flagLines.join('\n') || '- no stock phrases found - now check every claim has a shown moment.') +
      '\nCUTS\n' + (cutLines.join('\n') || '- nothing to cut yet.') +
      '\nTHE NUMBERS\nCurrent answer: ' + material.length + ' characters - minimum here is 350; 4,000 shared across all three answers.';
  }

  PSC.mock = { coach };
})();

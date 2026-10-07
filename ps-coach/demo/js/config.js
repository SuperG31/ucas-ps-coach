// PS Coach demo — single-place configuration (decision D1).
// If UCAS/the UCAS Adviser correct the question wording or limits, edit HERE and in the
// QUESTION (EDITABLE) block of prompts/q1-q3.md, then re-run tools/build-assets.js.
'use strict';

window.PSC = window.PSC || {};

PSC.CONFIG = {
  questions: {
    q1: {
      id: 'q1',
      short: 'Why this course?',
      text: 'Why do you want to study this course or subject?',
      hint: 'Your motivation: the moment it started, what you have chased since, and what you want from the course.',
    },
    q2: {
      id: 'q2',
      short: 'How your studies prepared you',
      text: 'How have your qualifications and studies helped you to prepare for this course or subject?',
      hint: 'Evidence from formal study: named topics, a real piece of work, and what it taught you.',
    },
    q3: {
      id: 'q3',
      short: 'Beyond the classroom',
      text: 'What else have you done to prepare outside of formal education, and why are these experiences useful?',
      hint: 'Jobs, responsibilities, self-taught skills, volunteering - and WHY each one is useful.',
    },
  },
  order: ['q1', 'q2', 'q3'],
  limits: {
    totalChars: 4000,       // shared across all three answers, spaces included
    minPerAnswer: 350,      // per-answer minimum, labelled in UCAS Hub
  },
  gemini: {
    model: 'gemini-3.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
    temperature: 0.3,
    maxOutputTokens: 1024,
  },
  storage: {
    state: 'psc-state-v1',      // localStorage: answers + transcripts + mode
    geminiKey: 'psc-gemini-key', // sessionStorage ONLY (D7) - cleared when the tab closes
    provenance: 'psc-provenance-v1', // localStorage: append-only writing record (survives clears)
  },
  stages: ['ELICIT', 'STRUCTURE', 'SHARPEN'],
  stageBlurb: {
    ELICIT: 'The coach asks 2-3 questions that pull out your real material.',
    STRUCTURE: 'The coach arranges your own points into a skeleton - adding nothing.',
    SHARPEN: 'The coach flags waffle, checks the question is answered, and suggests cuts.',
  },
};

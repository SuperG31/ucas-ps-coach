// PS Coach demo — application shell: routing, state, rendering, interactions.
// Plain scripts, no framework, no build (decision D6). State in localStorage (D7).
'use strict';

(function () {
  const CFG = PSC.CONFIG;
  const $app = () => document.getElementById('app');

  // ------------------------------------------------------------------ state
  const DEFAULT_STATE = {
    mode: 'mock',
    course: '',
    persona: null,
    answers: { q1: '', q2: '', q3: '' },
    transcripts: { q1: [], q2: [], q3: [] },
    consent: false, // v1.5 spike: student's consent to share their material with the housemaster
    reference: { strengths: '', house: '', fit: '' }, // housemaster's own typed input
  };

  let state = loadState();
  let busy = false;

  function loadState() {
    try {
      const raw = localStorage.getItem(CFG.storage.state);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        answers: { ...DEFAULT_STATE.answers, ...(parsed.answers || {}) },
        transcripts: { q1: [], q2: [], q3: [], ...(parsed.transcripts || {}) },
        reference: { ...DEFAULT_STATE.reference, ...(parsed.reference || {}) },
      };
    } catch { return structuredClone(DEFAULT_STATE); }
  }

  function saveState() {
    try { localStorage.setItem(CFG.storage.state, JSON.stringify(state)); } catch { /* full/private */ }
  }

  function setState(patch) {
    state = { ...state, ...patch };
    saveState();
  }

  // ------------------------------------------------------------------ utils
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function chars(qid) { return (state.answers[qid] || '').length; }
  function totalChars() { return CFG.order.reduce((n, q) => n + chars(q), 0); }

  function statusChip(qid) {
    const n = chars(qid);
    if (n === 0) return { cls: 'chip-empty', label: 'Not started' };
    if (n < CFG.limits.minPerAnswer) return { cls: 'chip-low', label: n + ' / min ' + CFG.limits.minPerAnswer };
    return { cls: 'chip-ok', label: n + ' characters' };
  }

  function suggestedStage(qid) {
    const n = chars(qid);
    if (n < 240) return 'ELICIT';
    if (n < 600) return 'STRUCTURE';
    return 'SHARPEN';
  }

  // Shared 6-word shingles between two answers → evidence double-spending warning.
  function shingles(text) {
    const w = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const set = new Set();
    for (let i = 0; i + 6 <= w.length; i++) set.add(w.slice(i, i + 6).join(' '));
    return set;
  }

  function overlapWarnings() {
    const warnings = [];
    const pairs = [['q1', 'q2'], ['q1', 'q3'], ['q2', 'q3']];
    for (const [a, b] of pairs) {
      if (chars(a) < 100 || chars(b) < 100) continue;
      const sa = shingles(state.answers[a]);
      let example = null, count = 0;
      for (const sh of shingles(state.answers[b])) {
        if (sa.has(sh)) { count++; if (!example) example = sh; }
      }
      if (count > 0) {
        warnings.push('Answers ' + a.toUpperCase() + ' and ' + b.toUpperCase() +
          ' share wording ("' + example + '…") - admissions staff read all three as one statement; spend each piece of evidence once.');
      }
    }
    return warnings;
  }

  function coachHtml(text) {
    const lines = String(text).split('\n');
    return lines.map((line) => {
      const t = line.trim();
      if (t.length >= 4 && /^[A-Z0-9' ?!.\-]+$/.test(t) && /[A-Z]/.test(t)) {
        return '<div class="coach-h">' + esc(t) + '</div>';
      }
      return t === '' ? '<div class="coach-gap"></div>' : '<div>' + esc(line) + '</div>';
    }).join('');
  }

  // ------------------------------------------------------------------ home
  function renderHome() {
    const persona = PSC.PERSONAS.find((p) => p.id === state.persona) || null;
    const total = totalChars();
    const pct = Math.min(100, Math.round(100 * total / CFG.limits.totalChars));
    const over = total > CFG.limits.totalChars;
    const warnings = overlapWarnings();
    const anyText = CFG.order.some((q) => chars(q) > 0);

    const qCards = CFG.order.map((qid) => {
      const q = CFG.questions[qid];
      const chip = statusChip(qid);
      return (
        '<article class="qcard">' +
        '<div class="qcard-top"><span class="qnum">' + qid.toUpperCase() + '</span>' +
        '<span class="chip ' + chip.cls + '">' + esc(chip.label) + '</span></div>' +
        '<h3>' + esc(q.short) + '</h3>' +
        '<p class="qtext">&ldquo;' + esc(q.text) + '&rdquo;</p>' +
        '<a class="btn btn-primary" href="#/' + qid + '">' + (chars(qid) ? 'Continue' : 'Start') + ' &rarr;</a>' +
        '</article>'
      );
    }).join('');

    const personaOptions = ['<option value="">Choose an example student&hellip;</option>']
      .concat(PSC.PERSONAS.map((p) =>
        '<option value="' + p.id + '"' + (state.persona === p.id ? ' selected' : '') + '>' +
        esc(p.name + ' - ' + p.course) + '</option>')).join('');

    $app().innerHTML =
      '<section class="hero">' +
      '<h1>Sharper answers. <em>Your</em> words.</h1>' +
      '<p class="lede">A coach for the three questions of the 2026 UCAS personal statement. ' +
      'It asks, organises and trims - so the statement stays entirely yours.</p>' +
      '<div class="principle" role="note"><strong>The one rule:</strong> this coach never writes a single sentence of your statement. ' +
      'UCAS screens for AI-written text and reports flags to your universities - so everything here is built to make <em>you</em> write it better.</div>' +
      '</section>' +

      '<section class="stages-row" aria-label="How coaching works">' +
      CFG.stages.map((s) => '<div class="stage-card"><h4>' + s + '</h4><p>' + esc(CFG.stageBlurb[s]) + '</p></div>').join('') +
      '</section>' +

      '<section class="panel">' +
      '<h2>Your application</h2>' +
      '<div class="field-row">' +
      '<label for="course">Course you\'re applying for</label>' +
      '<input id="course" type="text" value="' + esc(state.course) + '" placeholder="e.g. Mechanical Engineering" autocomplete="off">' +
      '</div>' +
      '<div class="field-row">' +
      '<label for="persona">Or load a fictional example student</label>' +
      '<div class="inline"><select id="persona">' + personaOptions + '</select>' +
      '<button class="btn" id="load-persona" type="button">Load</button>' +
      (persona ? '<button class="btn btn-ghost" id="clear-persona" type="button">Clear</button>' : '') +
      '</div>' +
      (persona ? '<p class="persona-note">Loaded: <strong>' + esc(persona.name) + '</strong> (' + esc(persona.course) + ') - ' + esc(persona.profile) + '</p>' : '') +
      '</div>' +
      '</section>' +

      '<section aria-label="The three questions"><h2>The three questions</h2>' +
      '<div class="qgrid">' + qCards + '</div></section>' +

      '<section class="panel" aria-label="Housemaster sharing">' +
      '<h2>Share with your housemaster</h2>' +
      '<label class="radio"><input type="checkbox" id="consent"' + (state.consent ? ' checked' : '') + '> ' +
      '<span>Share my answers with my housemaster so they can plan my reference. ' +
      'Only what I have typed here is shared - nothing else.</span></label>' +
      (state.consent
        ? '<p class="mini">Sharing is on. Housemaster view: <a href="#/housemaster">open the reference page</a>.</p>'
        : '<p class="mini">Your personal statement and your reference need the same underlying material - sharing your answers saves your housemaster starting from a blank page. (In the school pilot this box may be required.)</p>') +
      '</section>' +

      '<section class="panel" aria-label="Statement balance">' +
      '<h2>Whole-statement balance</h2>' +
      '<div class="balance-bar" role="img" aria-label="' + total + ' of ' + CFG.limits.totalChars + ' characters used">' +
      '<div class="balance-fill' + (over ? ' over' : '') + '" style="width:' + pct + '%"></div></div>' +
      '<p class="balance-nums' + (over ? ' warn-text' : '') + '">' + total + ' / ' + CFG.limits.totalChars + ' characters (spaces count)' +
      (over ? ' - over the limit, time to cut' : '') + '</p>' +
      '<ul class="checks">' +
      CFG.order.map((qid) => {
        const n = chars(qid);
        const ok = n >= CFG.limits.minPerAnswer;
        return '<li class="' + (ok ? 'ok' : 'todo') + '">' + qid.toUpperCase() + ': ' +
          (n === 0 ? 'not started' : (ok ? n + ' characters' : n + ' - needs at least ' + CFG.limits.minPerAnswer)) + '</li>';
      }).join('') +
      warnings.map((w) => '<li class="warn">' + esc(w) + '</li>').join('') +
      '</ul>' +
      '<div class="inline">' +
      '<button class="btn" id="export-copy" type="button"' + (anyText ? '' : ' disabled') + '>Copy all answers</button>' +
      '<button class="btn" id="export-dl" type="button"' + (anyText ? '' : ' disabled') + '>Download .txt</button>' +
      '<button class="btn" id="export-record" type="button">Download writing record</button>' +
      '<span id="export-note" class="mini" role="status" aria-live="polite"></span>' +
      '</div>' +
      '</section>' +

      '<section class="panel" aria-label="Coach settings">' +
      '<h2>Coach settings</h2>' +
      '<fieldset class="mode-set"><legend class="visually-hidden">Coach mode</legend>' +
      '<label class="radio"><input type="radio" name="mode" value="mock"' + (state.mode === 'mock' ? ' checked' : '') + '> ' +
      '<span><strong>Example coach</strong> - built-in, no key, fully offline. Shows the flow with rule-based coaching.</span></label>' +
      '<label class="radio"><input type="radio" name="mode" value="live"' + (state.mode === 'live' ? ' checked' : '') + '> ' +
      '<span><strong>Gemini coach</strong> - bring your own free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a>. Real AI coaching with the full system prompts.</span></label>' +
      '</fieldset>' +
      '<div id="key-row" class="field-row' + (state.mode === 'live' ? '' : ' hidden') + '">' +
      '<label for="gemini-key">Gemini API key</label>' +
      '<div class="inline">' +
      '<input id="gemini-key" type="password" placeholder="AIza..." value="' + esc(PSC.llm.getKey()) + '" autocomplete="off">' +
      '<button class="btn" id="save-key" type="button">Save</button>' +
      '<button class="btn btn-ghost" id="clear-key" type="button">Forget</button>' +
      '</div>' +
      '<p class="mini">Kept in this tab\'s session storage only - gone when you close the tab. Sent only to Google\'s Gemini API, never anywhere else.</p>' +
      '<p class="mini" id="key-note" role="status" aria-live="polite"></p>' +
      '</div>' +
      '</section>' +

      '<footer class="foot">Demo for the Clifton College PS Coach pilot. All example students are fictional. ' +
      'Your text stays in this browser except when you choose the Gemini coach, which sends it to Google\'s Gemini API with your key.</footer>';

    // wiring
    document.getElementById('course').addEventListener('input', (e) => {
      setState({ course: e.target.value });
    });
    document.getElementById('consent').addEventListener('change', (e) => {
      setState({ consent: e.target.checked });
      PSC.provenance.note('consent', { granted: e.target.checked });
      render();
    });
    document.getElementById('load-persona').addEventListener('click', () => {
      const id = document.getElementById('persona').value;
      const p = PSC.PERSONAS.find((x) => x.id === id);
      if (!p) return;
      setState({
        persona: p.id,
        course: p.course,
        answers: { q1: p.questions.q1.weakNotes, q2: p.questions.q2.weakNotes, q3: p.questions.q3.weakNotes },
        transcripts: { q1: [], q2: [], q3: [] },
      });
      PSC.provenance.note('example', { persona: p.id });
      render();
    });
    const clearBtn = document.getElementById('clear-persona');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      setState({ persona: null, course: '', answers: { q1: '', q2: '', q3: '' }, transcripts: { q1: [], q2: [], q3: [] } });
      PSC.provenance.note('clear', { what: 'answers + example student' });
      render();
    });
    document.querySelectorAll('input[name="mode"]').forEach((el) => {
      el.addEventListener('change', (e) => {
        setState({ mode: e.target.value });
        render();
      });
    });
    const saveKey = document.getElementById('save-key');
    if (saveKey) {
      saveKey.addEventListener('click', () => {
        PSC.llm.setKey(document.getElementById('gemini-key').value);
        document.getElementById('key-note').textContent = PSC.llm.getKey() ? 'Key saved for this tab.' : 'No key entered.';
      });
      document.getElementById('clear-key').addEventListener('click', () => {
        PSC.llm.setKey('');
        document.getElementById('gemini-key').value = '';
        document.getElementById('key-note').textContent = 'Key forgotten.';
      });
    }
    const copyBtn = document.getElementById('export-copy');
    if (copyBtn) copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(exportText());
        document.getElementById('export-note').textContent = 'Copied.';
      } catch {
        document.getElementById('export-note').textContent = 'Copy blocked by the browser - use Download instead.';
      }
    });
    const dlBtn = document.getElementById('export-dl');
    if (dlBtn) dlBtn.addEventListener('click', () => {
      const blob = new Blob([exportText()], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'personal-statement-answers.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
    const recBtn = document.getElementById('export-record');
    if (recBtn) recBtn.addEventListener('click', () => {
      // The writing record: timestamped provenance a housemaster can read.
      const blob = new Blob([PSC.provenance.exportText()], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'writing-record.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
    updateHeader();
  }

  function exportText() {
    const lines = ['UCAS PERSONAL STATEMENT - YOUR ANSWERS (plain text for UCAS Hub)', ''];
    for (const qid of CFG.order) {
      const q = CFG.questions[qid];
      lines.push(qid.toUpperCase() + '. ' + q.text);
      lines.push('');
      lines.push(state.answers[qid] || '[not written yet]');
      lines.push('');
      lines.push('(' + chars(qid) + ' characters)');
      lines.push('');
    }
    lines.push('Total: ' + totalChars() + ' / ' + CFG.limits.totalChars + ' characters.');
    lines.push('Written by the student. The PS Coach asked, structured and trimmed - it wrote nothing.');
    return lines.join('\n');
  }

  // -------------------------------------------------------------- question
  function renderQuestion(qid) {
    const q = CFG.questions[qid];
    const persona = PSC.PERSONAS.find((p) => p.id === state.persona) || null;
    const suggested = suggestedStage(qid);
    const transcript = state.transcripts[qid] || [];

    $app().innerHTML =
      '<nav class="crumbs"><a href="#/">&larr; All questions</a></nav>' +
      '<section class="qhead">' +
      '<span class="qnum">' + qid.toUpperCase() + '</span>' +
      '<h1 class="qtitle">&ldquo;' + esc(q.text) + '&rdquo;</h1>' +
      '<p class="hint">' + esc(q.hint) + '</p>' +
      '</section>' +

      '<div class="workspace">' +
      '<section class="write-col">' +
      '<div class="col-head"><h2>Your words</h2>' +
      '<span class="counter" id="counter" aria-live="polite"></span></div>' +
      (persona
        ? '<div class="persona-tools mini">Example student ' + esc(persona.name) + ': ' +
          '<button class="linklike" id="ins-notes" type="button">insert rough notes</button> &middot; ' +
          '<button class="linklike" id="ins-draft" type="button">insert weak draft</button></div>'
        : '') +
      '<textarea id="answer" aria-label="Your words for this question" ' +
      'placeholder="Rough notes are perfect. Bullet points, half-sentences, honest fragments - the coach pulls the story out of them.">' +
      esc(state.answers[qid]) + '</textarea>' +
      '<p class="mini">Autosaves in this browser. Nothing is sent anywhere until you press a coaching button' +
      (state.mode === 'live' ? ' (Gemini mode: your text goes to Google with your key)' : ' (Example mode: everything stays offline)') + '.</p>' +
      '</section>' +

      '<section class="coach-col">' +
      '<div class="col-head"><h2>The coach</h2><span class="mode-tag">' +
      (state.mode === 'live' ? 'Gemini' : 'Example mode') + '</span></div>' +
      '<div class="stage-btns" role="group" aria-label="Coaching stages">' +
      CFG.stages.map((s) =>
        '<button type="button" class="btn stage-btn' + (s === suggested ? ' btn-primary' : '') + '" data-stage="' + s + '">' +
        s.charAt(0) + s.slice(1).toLowerCase() +
        (s === suggested ? ' <span class="rec">suggested</span>' : '') + '</button>').join('') +
      '</div>' +
      '<p class="mini" id="stage-blurb">' + esc(CFG.stageBlurb[suggested]) + '</p>' +
      '<div class="transcript" id="transcript" aria-live="polite" aria-label="Coach replies">' +
      (transcript.length === 0
        ? '<div class="empty-state"><p>No coaching yet.</p><p>Write a few rough notes on the left, then press <strong>' +
          suggested.charAt(0) + suggested.slice(1).toLowerCase() + '</strong>.</p></div>'
        : transcript.map(entryHtml).join('')) +
      '</div>' +
      (transcript.length ? '<button class="linklike mini" id="clear-transcript" type="button">Clear coaching history</button>' : '') +
      '</section>' +
      '</div>';

    const $answer = document.getElementById('answer');
    const $counter = document.getElementById('counter');
    const updateCounter = () => {
      const n = $answer.value.length;
      const total = totalChars() - chars(qid) + n;
      $counter.innerHTML = n + ' chars' +
        (n < CFG.limits.minPerAnswer ? ' <span class="warn-text">(min ' + CFG.limits.minPerAnswer + ')</span>' : '') +
        ' &middot; statement total ' + total + '/' + CFG.limits.totalChars;
    };
    updateCounter();

    // Provenance: record paste events (the probative signal for the writing record).
    $answer.addEventListener('paste', (e) => {
      const clip = (e.clipboardData || window.clipboardData);
      const pasted = clip ? clip.getData('text') : '';
      if (pasted) setTimeout(() => PSC.provenance.paste(qid, pasted, $answer.value), 0);
    });

    let saveTimer = null;
    $answer.addEventListener('input', () => {
      updateCounter();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        state.answers[qid] = $answer.value;
        saveState();
        PSC.provenance.snapshot(qid, $answer.value);
      }, 250);
    });

    if (persona) {
      document.getElementById('ins-notes').addEventListener('click', () => {
        $answer.value = persona.questions[qid].weakNotes;
        state.answers[qid] = $answer.value; saveState(); updateCounter();
        PSC.provenance.note('example', { qid, persona: persona.id });
      });
      document.getElementById('ins-draft').addEventListener('click', () => {
        $answer.value = persona.questions[qid].weakDraft;
        state.answers[qid] = $answer.value; saveState(); updateCounter();
        PSC.provenance.note('example', { qid, persona: persona.id });
      });
    }

    document.querySelectorAll('.stage-btn').forEach((btn) => {
      btn.addEventListener('click', () => runStage(qid, btn.dataset.stage));
      btn.addEventListener('mouseenter', () => {
        document.getElementById('stage-blurb').textContent = CFG.stageBlurb[btn.dataset.stage];
      });
    });

    const clearT = document.getElementById('clear-transcript');
    if (clearT) clearT.addEventListener('click', () => {
      state.transcripts[qid] = [];
      saveState();
      PSC.provenance.note('clear', { qid, what: 'coaching history' }); // provenance itself survives
      render();
    });
    updateHeader();
  }

  function entryHtml(e) {
    if (e.kind === 'loading') {
      return '<div class="entry loading"><div class="entry-meta">' + esc(e.stage) + '</div>' +
        '<div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>' +
        '<span class="visually-hidden">The coach is reading your words</span></div>';
    }
    if (e.kind === 'error') {
      return '<div class="entry error"><div class="entry-meta">' + esc(e.stage) + ' &middot; problem</div>' +
        '<div class="coach-body">' + esc(e.text) + '</div></div>';
    }
    return '<div class="entry' + (e.blocked ? ' blocked' : '') + '">' +
      '<div class="entry-meta">' + esc(e.stage) + ' &middot; ' + esc(e.provider || '') +
      (e.blocked ? ' &middot; filtered' : '') + '</div>' +
      '<div class="coach-body">' + coachHtml(e.text) + '</div></div>';
  }

  async function runStage(qid, stage) {
    if (busy) return;
    const material = (document.getElementById('answer') || {}).value || state.answers[qid] || '';
    state.answers[qid] = material;

    if (!material.trim() && stage !== 'ELICIT') {
      state.transcripts[qid].push({
        kind: 'error', stage,
        text: 'There is nothing to ' + stage.toLowerCase() + ' yet - write some rough notes first, or start with Elicit.',
      });
      saveState(); render(); return;
    }

    busy = true;
    state.transcripts[qid].push({ kind: 'loading', stage });
    saveState(); render();

    try {
      const res = await PSC.llm.send({ qid, stage, course: state.course, material, mode: state.mode });
      state.transcripts[qid] = state.transcripts[qid].filter((e) => e.kind !== 'loading');
      state.transcripts[qid].push({ kind: 'reply', stage, text: res.text, blocked: res.blocked, provider: res.provider });
      PSC.provenance.coach(qid, stage, state.mode, res.blocked);
    } catch (err) {
      state.transcripts[qid] = state.transcripts[qid].filter((e) => e.kind !== 'loading');
      state.transcripts[qid].push({ kind: 'error', stage, text: String(err.message || err) });
    } finally {
      busy = false;
      saveState(); render();
      const t = document.getElementById('transcript');
      if (t) t.scrollTop = t.scrollHeight;
    }
  }

  // -------------------------------------------------------- housemaster (v1.5 spike)
  function renderHousemaster() {
    if (!state.consent) {
      $app().innerHTML =
        '<nav class="crumbs"><a href="#/">&larr; Back</a></nav>' +
        '<section class="panel"><h2>Housemaster reference page</h2>' +
        '<p>The student has not shared their material. This page only works with the student\'s ' +
        'consent - the tick-box on their home page. Nothing is pulled from school systems; ' +
        'everything here is what the student typed themselves.</p></section>';
      updateHeader();
      return;
    }
    const anyStudent = CFG.order.some((q) => chars(q) > 0);
    const studentBlock = CFG.order.map((qid) =>
      '<details class="panel"><summary>' + qid.toUpperCase() + ' - ' + esc(CFG.questions[qid].short) +
      ' (' + chars(qid) + ' chars)</summary><p class="qtext">' +
      (state.answers[qid] ? esc(state.answers[qid]) : '<em>nothing written yet</em>') + '</p></details>').join('');

    $app().innerHTML =
      '<nav class="crumbs"><a href="#/">&larr; Back to the student view</a></nav>' +
      '<section class="qhead"><h1 class="qtitle">Housemaster reference page</h1>' +
      '<p class="hint">Shared with the student\'s consent: their self-typed answers below. Add what ' +
      'you know, then generate a reference PLAN - an outline you write up in your own words. ' +
      'The tool never writes the reference.</p></section>' +
      '<section aria-label="Student material"><h2>The student\'s own material</h2>' +
      (anyStudent ? studentBlock : '<p class="mini">The student has not written anything yet.</p>') +
      '</section>' +
      '<section class="panel" aria-label="Your input"><h2>Your knowledge of the student</h2>' +
      '<div class="field-row"><label for="ref-strengths">Key strengths - each with a specific example</label>' +
      '<textarea id="ref-strengths" rows="3" placeholder="e.g. Asks the question the rest of the set is avoiding - in the momentum practical she...">' + esc(state.reference.strengths) + '</textarea></div>' +
      '<div class="field-row"><label for="ref-house">Around the house - contribution, biggest achievements</label>' +
      '<textarea id="ref-house" rows="3">' + esc(state.reference.house) + '</textarea></div>' +
      '<div class="field-row"><label for="ref-fit">Fit for ' + esc(state.course || 'the course') + '</label>' +
      '<textarea id="ref-fit" rows="3">' + esc(state.reference.fit) + '</textarea></div>' +
      '<button class="btn btn-primary" id="ref-generate" type="button">Generate reference plan</button>' +
      '</section>' +
      '<section class="panel" aria-label="Reference plan"><h2>Reference plan</h2>' +
      '<div class="transcript" id="ref-plan"><div class="empty-state"><p>No plan yet - fill in what you know and press the button.</p></div></div>' +
      '</section>';

    const bind = (id, key) => document.getElementById(id).addEventListener('input', (e) => {
      state.reference = { ...state.reference, [key]: e.target.value };
      saveState();
    });
    bind('ref-strengths', 'strengths'); bind('ref-house', 'house'); bind('ref-fit', 'fit');

    document.getElementById('ref-generate').addEventListener('click', () => {
      const planText = PSC.reference.plan(state.answers, state.reference, state.course);
      // Same defense-in-depth as coach replies: the plan passes the never-writes filter
      // against the combined self-report + housemaster material before rendering.
      const gate = PSC.guardrail.enforce(planText, PSC.reference.material(state.answers, state.reference), { stage: 'PLAN' });
      document.getElementById('ref-plan').innerHTML =
        '<div class="entry' + (gate.ok ? '' : ' blocked') + '"><div class="entry-meta">REFERENCE PLAN' +
        (gate.ok ? '' : ' &middot; filtered') + '</div><div class="coach-body">' + coachHtml(gate.text) + '</div></div>';
      PSC.provenance.note('refplan', { blocked: !gate.ok });
    });
    updateHeader();
  }

  // ------------------------------------------------------------------ shell
  function updateHeader() {
    const pill = document.getElementById('mode-pill');
    if (pill) pill.textContent = state.mode === 'live' ? 'Gemini coach' : 'Example coach';
  }

  function render() {
    const hash = location.hash.replace(/^#\/?/, '');
    if (CFG.questions[hash]) renderQuestion(hash);
    else if (hash === 'housemaster') renderHousemaster();
    else renderHome();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
})();

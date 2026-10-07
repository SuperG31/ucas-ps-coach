// PS Coach demo — draft provenance (decision: council 2026-07-18).
// An append-only local record of HOW the student's text came to exist: timestamped
// writing snapshots, paste events, the coaching trail, and example-student loads.
// This is evidence FOR the honest student (a housemaster-readable writing record),
// not surveillance: it lives only in this browser's localStorage and the student
// can delete it. It is deliberately NOT cleared when coaching history is cleared.
'use strict';

window.PSC = window.PSC || {};

(function () {
  const KEY = () => (PSC.CONFIG && PSC.CONFIG.storage.provenance) || 'psc-provenance-v1';
  const MAX_EVENTS = 2000;          // append-only, oldest dropped (counted, never silent)
  const SNAPSHOT_MIN_MS = 60000;    // max ~1 snapshot/min per question
  const FULLTEXT_EVERY = 5;         // keep full text every Nth snapshot per question
  const SESSION_GAP_MS = 30 * 60000; // >30 min between events = a new writing session

  // djb2 — cheap content fingerprint, not cryptographic (KISS: pilot evidence, not audit).
  function hash(s) {
    let h = 5381;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function emptyStore() {
    return { v: 1, dropped: 0, latest: {}, counts: {}, events: [] };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY());
      if (!raw) return emptyStore();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.events)) return emptyStore();
      return { ...emptyStore(), ...parsed };
    } catch { return emptyStore(); }
  }

  function save(store) {
    try { localStorage.setItem(KEY(), JSON.stringify(store)); }
    catch {
      // Storage full: halve the event log (keeping the newest), count the drop, retry once.
      const cut = Math.ceil(store.events.length / 2);
      store.dropped += cut;
      store.events = store.events.slice(cut);
      try { localStorage.setItem(KEY(), JSON.stringify(store)); } catch { /* give up quietly */ }
    }
  }

  function append(store, event) {
    store.events.push(event);
    if (store.events.length > MAX_EVENTS) {
      const excess = store.events.length - MAX_EVENTS;
      store.dropped += excess;
      store.events = store.events.slice(excess);
    }
  }

  function now() { return new Date().toISOString(); }

  // ---------------------------------------------------------------- recording
  // Throttled writing snapshot. Records length, content hash, chars added/removed
  // since the previous snapshot; full text only every Nth snapshot (storage cap).
  function snapshot(qid, text) {
    const store = load();
    const t = String(text || '');
    const prevLen = (store.latest[qid] || '').length;
    const last = [...store.events].reverse().find((e) => e.type === 'snapshot' && e.qid === qid);
    if (last && Date.now() - Date.parse(last.t) < SNAPSHOT_MIN_MS) {
      // Within throttle window: refresh latest text (for self-paste checks) but no event.
      store.latest[qid] = t;
      save(store);
      return;
    }
    store.counts[qid] = (store.counts[qid] || 0) + 1;
    const ev = {
      t: now(), type: 'snapshot', qid,
      len: t.length, hash: hash(t),
      added: Math.max(0, t.length - prevLen),
      removed: Math.max(0, prevLen - t.length),
    };
    if (store.counts[qid] % FULLTEXT_EVERY === 1) ev.text = t; // 1st, 6th, 11th…
    append(store, ev);
    store.latest[qid] = t;
    save(store);
  }

  // Paste event — the probative signal. selfPaste = the pasted text already existed
  // in the student's own recorded material (moving their own words is fine).
  function paste(qid, pastedText, currentText) {
    const store = load();
    const p = normalize(pastedText);
    const own = Object.values(store.latest).some((txt) => p.length > 0 && normalize(txt).includes(p));
    append(store, {
      t: now(), type: 'paste', qid,
      len: String(pastedText || '').length,
      selfPaste: own,
    });
    store.latest[qid] = String(currentText || '');
    save(store);
  }

  // Coaching run — ties the coach trail to the writing timeline.
  function coach(qid, stage, mode, blocked) {
    const store = load();
    append(store, { t: now(), type: 'coach', qid, stage, mode, blocked: !!blocked });
    save(store);
  }

  // Example-student material and clears — so demo text is never mistaken for the
  // student's own writing, and a wipe leaves a trace instead of a silence.
  function note(type, data) {
    const store = load();
    append(store, { t: now(), type, ...(data || {}) });
    save(store);
  }

  // ------------------------------------------------------------------- report
  function stats() {
    const store = load();
    const ev = store.events;
    let sessions = 0, lastT = 0;
    for (const e of ev) {
      const ts = Date.parse(e.t);
      if (ts - lastT > SESSION_GAP_MS) sessions++;
      lastT = ts;
    }
    const externalPaste = ev.filter((e) => e.type === 'paste' && !e.selfPaste)
      .reduce((n, e) => n + e.len, 0);
    const selfPaste = ev.filter((e) => e.type === 'paste' && e.selfPaste)
      .reduce((n, e) => n + e.len, 0);
    const coachRuns = ev.filter((e) => e.type === 'coach').length;
    const blockedRuns = ev.filter((e) => e.type === 'coach' && e.blocked).length;
    const totalChars = Object.values(store.latest).reduce((n, t) => n + t.length, 0);
    return {
      events: ev.length, dropped: store.dropped, sessions,
      first: ev.length ? ev[0].t : null, last: ev.length ? ev[ev.length - 1].t : null,
      externalPaste, selfPaste, coachRuns, blockedRuns, totalChars,
    };
  }

  function line(e) {
    const when = e.t.replace('T', ' ').slice(0, 16);
    const q = e.qid ? e.qid.toUpperCase() + ' ' : '';
    switch (e.type) {
      case 'snapshot':
        return when + '  ' + q + 'writing: ' + e.len + ' chars (+' + e.added + '/-' + e.removed + ')';
      case 'paste':
        return when + '  ' + q + (e.selfPaste
          ? 'paste of ' + e.len + ' chars - matched their own earlier material'
          : 'PASTE of ' + e.len + ' chars from OUTSIDE their recorded material');
      case 'coach':
        return when + '  ' + q + 'coaching: ' + e.stage + ' (' + e.mode + ' mode' +
          (e.blocked ? ', reply BLOCKED by never-writes filter' : '') + ')';
      case 'example':
        return when + '  ' + q + 'EXAMPLE STUDENT material loaded (' + (e.persona || 'persona') +
          ') - this text is fictional, not the student\'s';
      case 'clear':
        return when + '  ' + q + 'cleared: ' + (e.what || 'content');
      default:
        return when + '  ' + q + e.type;
    }
  }

  function exportText() {
    const store = load();
    const s = stats();
    const lines = [
      'PS COACH - WRITING RECORD (draft provenance)',
      '',
      'What this is: a timestamped record, kept only in the student\'s own browser, of how',
      'their personal-statement answers came to exist - writing sessions, pastes, and every',
      'coaching interaction. The coach never writes statement text; this record shows the',
      'words accumulating through the student\'s own edits.',
      'What this is not: tamper-proof. It is evidence FOR the honest student, offered by them.',
      '',
      'SUMMARY',
      '- Writing sessions: ' + s.sessions + (s.first ? ' (from ' + s.first.slice(0, 10) + ' to ' + s.last.slice(0, 10) + ')' : ''),
      '- Recorded events: ' + s.events + (s.dropped ? ' (plus ' + s.dropped + ' oldest dropped at the storage cap)' : ''),
      '- Current statement length: ' + s.totalChars + ' characters',
      '- Pasted from outside their recorded material: ' + s.externalPaste + ' characters' +
        (s.totalChars ? ' (at most ' + Math.min(100, Math.round(100 * s.externalPaste / s.totalChars)) + '% of the current text)' : ''),
      '- Pasted from their own earlier material: ' + s.selfPaste + ' characters',
      '- Coaching runs: ' + s.coachRuns + (s.blockedRuns ? ' (' + s.blockedRuns + ' replies blocked by the never-writes filter)' : ''),
      '',
      'TIMELINE',
    ];
    for (const e of store.events) lines.push(line(e));
    if (!store.events.length) lines.push('(no events recorded yet)');
    lines.push('');
    lines.push('Demo for the Clifton College PS Coach pilot. All example students are fictional.');
    return lines.join('\n');
  }

  PSC.provenance = { snapshot, paste, coach, note, stats, exportText };
})();

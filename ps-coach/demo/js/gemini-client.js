// PS Coach demo — the single isolated LLM client (spec: "The Gemini call goes through a
// single, cleanly-isolated client module so it can be pointed at the real API or the mock
// with one flag").  PSC.llm.send() is the only place a model is ever called.
// The Gemini key lives in sessionStorage ONLY (decision D7) and is sent ONLY to
// generativelanguage.googleapis.com via the x-goog-api-key header.
'use strict';

window.PSC = window.PSC || {};

(function () {
  const MOCK_DELAY_MS = 500; // small delay so the loading state is visible/realistic

  function getKey() {
    try { return sessionStorage.getItem(PSC.CONFIG.storage.geminiKey) || ''; } catch { return ''; }
  }
  function setKey(key) {
    try {
      if (key) sessionStorage.setItem(PSC.CONFIG.storage.geminiKey, key.trim());
      else sessionStorage.removeItem(PSC.CONFIG.storage.geminiKey);
    } catch { /* private mode: key just won't persist */ }
  }

  function buildUserMessage(stage, course, material) {
    return 'STAGE: ' + stage + '\nCOURSE: ' + (course || '') + '\nMATERIAL:\n' + material;
  }

  function friendlyError(status, bodyText) {
    if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(bodyText)) {
      return 'That Gemini API key was rejected by Google. Check it was copied in full from aistudio.google.com/apikey, then paste it again.';
    }
    if (status === 403) return 'Google refused the request (403). The key may lack access to the model, or the Generative Language API is disabled for it.';
    if (status === 404) return 'Model not found (404). The configured model id may have been retired - update PSC.CONFIG.gemini.model in js/config.js.';
    if (status === 429) return 'Rate limit reached (429). Free-tier Gemini keys allow a few requests per minute - wait a moment and try again.';
    return 'The Gemini API returned HTTP ' + status + '. Try again; if it persists, check the browser console for details.';
  }

  async function callGemini(systemPrompt, userMessage, key) {
    const cfg = PSC.CONFIG.gemini;
    const url = cfg.endpoint + cfg.model + ':generateContent';
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { temperature: cfg.temperature, maxOutputTokens: cfg.maxOutputTokens },
        }),
      });
    } catch (e) {
      throw new Error('Could not reach the Gemini API - check your internet connection (or a school firewall may be blocking generativelanguage.googleapis.com).');
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(friendlyError(res.status, body));
    }
    const data = await res.json();
    const parts = data.candidates && data.candidates[0] && data.candidates[0].content
      ? data.candidates[0].content.parts : null;
    if (!parts) throw new Error('Gemini returned an empty reply (possibly a safety block). Try rephrasing your text.');
    return parts.map((p) => p.text || '').join('');
  }

  /**
   * The one entry point. mode: 'mock' | 'live'.
   * Returns { text, blocked, violations, provider } or throws Error with a friendly message.
   */
  async function send({ qid, stage, course, material, mode }) {
    let raw, provider;
    if (mode === 'live') {
      const key = getKey();
      if (!key) throw new Error('No Gemini key saved. Paste one in Settings on the home screen (aistudio.google.com/apikey), or switch to Example mode.');
      raw = await callGemini(PSC.PROMPTS[qid], buildUserMessage(stage, course, material), key);
      provider = 'gemini:' + PSC.CONFIG.gemini.model;
    } else {
      await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
      raw = PSC.mock.coach(stage, course, material);
      provider = 'mock';
    }
    // Defense in depth: every reply passes the never-writes filter before rendering.
    const enforced = PSC.guardrail.enforce(raw, material, { stage });
    return { text: enforced.text, blocked: !enforced.ok, violations: enforced.violations, provider };
  }

  PSC.llm = { send, getKey, setKey };
})();

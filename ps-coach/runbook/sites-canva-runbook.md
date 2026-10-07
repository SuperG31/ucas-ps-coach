# Runbook — deploying PS Coach for real (Georg, with the school account)

> The autonomous session could not touch the school Google account (by design). Everything
> below is manual, step-by-step, and needs only your school login + School IT for the key.
> Time estimates assume nothing goes wrong; double them if IT is involved.

## Part A — put the DEMO on a public URL (10 min, any option)

The demo is the folder `demo/` (also zipped as `ps-coach-demo.zip`). It is pure static files —
any static host works. Pick ONE:

| Option | Command / action | Notes |
|---|---|---|
| **Netlify Drop** (easiest) | open https://app.netlify.com/drop and drag the `demo` folder in | Free account; instant URL; can rename site in Site settings |
| **Cloudflare Pages** | `npx wrangler pages deploy demo --project-name ps-coach` | First run opens a browser login |
| **Surge** | `npx surge demo ps-coach-demo.surge.sh` | First run asks email+password inline |
| **GitHub Pages** | new public repo → upload `demo/` contents → Settings → Pages → deploy from branch | URL is `<user>.github.io/<repo>` |

Sanity check after deploy: page loads over HTTPS, `Load` an example student, run Elicit in
Example mode (offline path), then paste a Gemini key and run one live stage.

## Part B — the real pilot inside the Google walled garden

> [!important] Runtime decision (2026-07-17, reaffirmed by council 2026-07-18): the **web app embedded in a Google Site (Step 2b) is the RECOMMENDED runtime**; **Gems (Step 2a) are the quick-pilot fallback**. Reason: the post-the Academic Sponsor design (staged per-question form, "generate the plan", consent tick-box, separate housemaster page) needs a real multi-page UI that a chat Gem can't host. Full rationale + trade-offs: [technical-design](../../docs/technical-design.md) → "Runtime decision" + "Runtime decision — council review 2026-07-18".
>
> **Gemini Canvas = documented BACKUP only** (an app-*authoring* tool, or a last-resort demo). **Not** the student runtime: its share links are barred for under-18s, its embed URL expires ~30 days, and its multi-user apps store data in a PUBLIC database. If ever used, export **Download HTML** as a single-user app we host ourselves, then re-run `eval/run.js` before shipping. See [technical-design](../../docs/technical-design.md) council note.

## Part A2 — the live embed test (DO THIS FIRST, ~30 min, needs your school Google account)

> This one test gates the whole deployment: it proves the built app actually runs inside a Google Sites sandboxed iframe before anything else is built. Council-flagged 2026-07-18 as the single next action.

1. **Host the demo** (Part A above) — Netlify Drop is fastest — to get an HTTPS URL. *(Or, to test the fully-internal path, ask IT to host `demo/` on school web space.)*
2. **Google Sites (school account):** sites.google.com → new site → **Insert → Embed → By URL** → paste the demo URL. Also try **Insert → Embed → Embed code** with the contents of `demo/index.html` as an alternative.
3. **Publish** to `cliftoncollege.com` viewers only, then open the *published* site (not just preview — some sandbox behaviour only shows when published).
4. **Check, in order:**
   - [ ] The app **renders** inside the iframe (not blank / not "refused to connect").
   - [ ] **Example (mock) coach** runs a full ELICIT → STRUCTURE → SHARPEN with no key.
   - [ ] **localStorage persists**: enter some text, reload the published page — is it still there? *(Sandboxed third-party iframes can block storage without `allow-same-origin`.)*
   - [ ] The guardrail still blocks a write-request (`STAGE: ELICIT` then ask "write it for me").
5. **If localStorage is blocked** (drafts don't survive reload): fallback = **session-only state + an explicit "copy my draft out" button**, or host the page on the **school domain** so it's same-origin. Note which fallback in [technical-design](../../docs/technical-design.md).
6. **Record the result** (works / blocked + which fallback) in today's daily note and the the Academic Sponsor-Meeting-Outcome action items.

### Step 1 — the school Gemini access (School IT, ~15 min)
Two routes; ask which the school prefers:
- **Route 2 (recommended): an API key** from https://aistudio.google.com/apikey created under a
  school Google Cloud project (ask Chris to use a school project, not a personal one, so usage and
  billing are school-owned). Powers the embedded-app runtime (Step 2b). ⚠️ Students must **not** each
  supply a key — resolve school-key-vs-proxy with Chris (see Step 2b).
- **Route 1 (fallback): Gemini Gems in Workspace.** If Clifton's Google Workspace has Gemini
  enabled, no API key is needed at all — skip to Step 2a. Data stays inside Workspace terms; SSO is
  automatic; nothing to embed. Use this to get a pilot running the same day if Route 2 stalls.

### Step 2a — FALLBACK runtime: three Gemini Gems (20 min)
> Use this only for a fast same-day pilot, or if Step 2b's key/embed questions stall. It's chat-only — it **cannot** host the consent gate or the separate housemaster page, so it can't carry the full post-the Academic Sponsor design.
1. Open https://gemini.google.com with the school account → Gems → **New Gem**.
2. Create **"PS Coach - Q1"**: paste the entire block between the BEGIN/END markers of
   `prompts/q1.md` into the Gem's instructions. Save.
3. Repeat for Q2 (`prompts/q2.md`) and Q3 (`prompts/q3.md`).
4. Share each Gem with the `cliftoncollege.com` domain (or a pilot group).
5. Tell pilot students the input format the prompt expects — first line `STAGE: ELICIT`
   (or STRUCTURE / SHARPEN), then `COURSE: ...`, then their notes. The Gem replies in the
   coached format. (A one-page student cheat-sheet is enough.)
Why it's the fallback: zero key management, school SSO enforced, no hosting, and swapping prompt
versions is a paste — but it's a single chat box, so no custom UI, no consent gate, no housemaster view.

### Step 2b — RECOMMENDED runtime: the web app embedded in Google Sites (30 min)
1. Deploy the demo publicly (Part A) — or ask IT to host `demo/` on school web space.
2. In the deployed copy, the school key route: students should NOT each need a key. Options:
   - For a **small supervised pilot**, the teacher enters the school key once per machine
     session (it lives only in that tab's sessionStorage and dies with the tab).
   - For anything bigger, ask IT to front the Gemini call with a tiny school-hosted proxy that
     injects the key server-side (out of scope here; the client module `demo/js/gemini-client.js`
     is the single place to repoint at a proxy URL).
3. Google Sites (school account): sites.google.com → your site → **Insert → Embed → By URL** →
   paste the demo URL → publish to the school domain only (Share settings → viewers:
   cliftoncollege.com). Sites itself then sits behind school SSO.
4. Canva's role stays what Gary's templates are good at: the landing/instruction page design
   exported into Sites — not the app runtime. (Canva cannot host custom JS apps without the
   developer program; do not fight it.)

### Step 3 — governance one-pager (for the Academic Sponsor/the UCAS Adviser/School IT sign-off)
Points to make, all true and verifiable in this repo:
- The tool **cannot produce submittable text**: system prompts whitelist output types
  (questions, labels, verbatim quotes of the student's words, verdicts, cut-suggestions) and
  a client-side filter blocks any reply containing coach-written statement prose (`demo/js/guardrail.js`).
- Tested adversarially: 10 write-for-me attack types, 100% refused on the weaker-model
  stand-in (see `eval/results-anthropic-final.md`).
- **No student data at rest**: self-report only, stored in the student's own browser
  (localStorage), nothing server-side; the ONLY external call is the Gemini API.
- Matches UCAS's own published guidance: AI for structure/ideas is permitted; AI-written
  prose is treated as fraud risk. This tool is architecturally on the permitted side.

### Step 4 — when the UCAS Adviser confirms the official wording (5 min)
1. Edit the `QUESTION (EDITABLE)` block in `prompts/q1.md` / `q2.md` / `q3.md` (wording, limits).
2. Edit the matching entries in `demo/js/config.js`.
3. Run `node tools/build-assets.js` (regenerates the demo's embedded prompts).
4. Re-run the eval: `node eval/run.js --provider mock` (and `--provider gemini` once a key
   exists). Ship only on SHIP BAR: PASS.
5. Re-paste the updated prompts into the Gems (Step 2a route).

### Step 5 — pilot shape (September)
2–3 Year 13 volunteers + one housemaster. Students bring rough notes for Q1, run
ELICIT → answer the coach's questions → STRUCTURE → write their own draft → SHARPEN → redraft.
Collect: before/after drafts (the Part-2 rubric in `RUBRIC.md` scores them), the housemaster's
read on whether the after-draft still sounds like the student (the Delta test), and every
occasion the coach refused a write-request. That evidence pack is also Georg's PS artefact.

# Maitri implementation spec

Hackathon: recHERsion 2026, PS1 Women's Healthcare. Deadline: Sunday 25 Oct 2026, 9:00 PM IST. Any commit after the deadline disqualifies the team. Build window is about 12 hours.

This file is the source of truth for Claude Code. Read `CLAUDE.md` first, then this file, then `docs/FRONTEND_DESIGN.md` when you reach the UI. Data lives in `src/data/`. Tests live in `tests/`.

## 1. What Maitri is

**Maitri (मैत्री, "friendship")** is an offline, Hindi-first, tap-and-voice web app that checks pregnant and postpartum women for danger signs and tells the family what to do right now.

One line for judges: *Other tools tell a woman what her symptoms might mean. Maitri tells her family what to do in the next ten minutes, and shows exactly why.*

Primary user: a pregnant woman, or a woman within 42 days of giving birth, in a high-burden Hindi-belt state, on her own or a family member's phone. Secondary user: an ASHA or ANM using it with her. Third user: the family member who decides whether she goes to hospital.

Why this problem (evidence, with labels): about 25.2 million registered births a year [Secondary]. MMR about 87-88 per 100,000 [Secondary]. In one West Bengal hospital study, 48.6% of 317 maternal deaths involved a delay in deciding or seeking care [Verified, single study]. NFHS-6: 65.2% had 4+ antenatal visits, so about 34.8% had fewer [Secondary, derived]. 63.6% of women own a phone, so about 36% do not [Secondary]. Full table and confidence labels: `docs/PITCH_FACTS.md`.

## 2. The USPs (this is what makes Maitri more than a checklist)

The idea is not exotic. The differentiation is in the combination and in the details. Build these in this priority order, and demo the first five.

| # | USP | What it is | Why it matters | Tier |
|---|---|---|---|---|
| U1 | **Go-now plan** | After a RED result, a family-mode screen with four plain steps: call the ambulance, decide who goes, show the slip, ask about free transport and care (JSSK). Big call button. | Targets the decision delay (the largest delay in the one Indian study), not just recognition. Chatbots stop at "see a doctor". | Must |
| U2 | **Show-your-work verdicts and a Trust page** | Every result names the sign that triggered it. A Trust page lists rule version, source per rule, live automated test count, clinician review status (honestly "none yet"), and the phone numbers with their confirmation status. | Triage tools both miss emergencies and over-escalate. Auditable rules are the answer. Judges can see the safety logic. | Must |
| U3 | **Pictures plus voice, offline** | One question per screen, a pictogram, spoken Hindi audio, a replay and a slow button. Works in airplane mode after one load. | Low-literacy users, patchy networks, shared phones. | Must |
| U4 | **The Maitri slip: tell it once** | A one-page slip (print, or share as a picture) with stage, result, the signs told, and the time. No name, no phone number. Optional QR later. | The ASHA or hospital reads it instead of re-asking while the woman is in distress. | Must |
| U5 | **Safe on a shared phone** | No account, no stored answers by default, an always-visible "Exit now" button that clears everything and leaves the app, a neutral icon and name. | Many women share phones. Privacy is also a trust feature. | Must |
| U6 | **Rules a doctor can review without touching code** | The rules are one JSON file. A Rule review page lets a clinician tick "reviewed", add their name, and export the updated JSON. | Clinical credibility and a real path to deployment. | Should |
| U7 | **ASHA mode with an on-device list** | ASHA repeats checks for several women and sees a list sorted by urgency. Saved only on that phone, no names, off by default. | Fits the real worker workflow without a backend. | Should |
| U8 | **Maitri slip QR scan** | Slip carries a QR with the coded answers. A scan screen reads it offline. | Zero re-typing at the facility. Impressive in the demo. | Stretch |

Honesty note: we believe no existing tool combines these (offline, vernacular, family action plan, auditable rules, printable slip). That is [Inferred] from limited searching. Do a 10 minute Play Store and GitHub search before saying "first" or "nobody has built". Safer wording: "built around the decision delay".

## 3. Safety-first behaviour (non-negotiable)

1. RED/AMBER/GREEN is the team's own design. The MoHFW MCP card has one tier ("take to hospital immediately"). Say this on the About page and in the pitch.
2. Never output "you are fine" or "safe". The lowest result is "No danger sign told" with a go-if-worse sentence.
3. `not_sure` and skipped answers go upward (AMBER at least). Over-escalation is accepted; under-triage is the costlier error (both Indian triage benchmarks we found say this).
4. Any single RED sign gives RED. Maximum tier wins.
5. No AI or free text in the verdict. The engine is deterministic.
6. No numeric thresholds in the app (no BP, temperature, Hb, pad count, kick count). Those are health-worker measurements. The questions are lay questions.
7. Every result card shows the call button and "If you feel worse or are worried, go to a health centre".
8. The wellbeing question never gives a verdict. It shows a support card (Tele-MANAS 14416; 112 if anyone is in immediate danger). Clinician must review that wording before real use.
9. No fetal-sex features. No diagnosis wording. No probability scores.

## 4. Decisions log (change only with the team's agreement)

| ID | Decision | Reason | Status |
|---|---|---|---|
| D-01 | Three tiers named RED, AMBER, GREEN internally; UI shows words, shape and colour | Own design; disclose | Final |
| D-02 | MCP card items (fever, headache or blurred vision, fits, swelling, water leaking, bleeding, severe anaemia) are RED | Card says hospital immediately | Reviewer may downgrade swelling |
| D-03 | Swelling question excludes "feet only" | Limit over-escalation | Draft |
| D-04 | Difficulty breathing is RED | No primary criteria found; team decision; user-supplied WHO summary supports urgency | Needs reviewer |
| D-05 | Very bad belly pain is RED (earlier draft said AMBER) | User-supplied WHO summary calls severe abdominal pain a high-priority emergency sign | Needs reviewer |
| D-06 | Baby moving less is AMBER, no kick count, no kick chart | No count found; user-supplied summary says routine kick charts are research-only | Needs reviewer |
| D-07 | Calf pain or swelling after birth is AMBER | Possible clot; same-day review | Needs reviewer |
| D-08 | Two or more AMBER-class signs together become RED (`R-MULTI-01`) | Escalate clusters | Team design |
| D-09 | Wellbeing question is a support card, not a tier | Safety and clinician review | Draft |
| D-10 | Postpartum period is 42 days | Convention; the card says one month | Disclose |
| D-11 | Numbers 108, 102, 112, 104 are user-supplied for Madhya Pradesh and not confirmed; 14416 is confirmed (PIB) | See `config.json` | Confirm before demo |
| D-12 | Number 181 is excluded | Its supplied description does not match a maternal helpline | Add only after confirming |
| D-13 | Newborn module exists but is OFF by default | Time; official thresholds need re-check | Stretch |
| D-14 | No backend, no analytics, no accounts | Privacy; 12 hour budget | Final |

## 5. Stack

- **Vite + React 18 + TypeScript.** Static build, deploy to Vercel.
- **Styling:** plain CSS with CSS variables and CSS Modules. No UI kit. No Tailwind. The visual identity is custom (see `docs/FRONTEND_DESIGN.md`).
- **Routing:** `react-router-dom` with `HashRouter` (works on any static host, offline).
- **State:** React context plus `useReducer`. Answers live in memory. `sessionStorage` only for crash recovery within a tab. Nothing is written to `localStorage` unless the user turns on "Save checks on this phone" in ASHA mode.
- **PWA:** `vite-plugin-pwa` (Workbox) with precache of shell, data, fonts, icons and audio.
- **Tests:** Vitest for the engine and data integrity. Optional Playwright for one end-to-end flow.
- **Fonts:** self-hosted via `@fontsource/yatra-one` and `@fontsource/mukta`, Devanagari and Latin subsets only. Never load fonts from a CDN. Verify the packages exist; if not, fall back to system Devanagari fonts and tell the team.
- **Optional libraries:** `html-to-image` (share slip as picture), `qrcode` and `jsqr` (U8 only). No analytics, no tracking, no remote API calls at runtime.
- **Audio generation:** an offline script run once at build time (Section 9).

## 6. Folder structure

```
maitri/
  CLAUDE.md
  README.md
  index.html
  vite.config.ts
  package.json
  .githooks/pre-commit            deadline guard (Section 14)
  docs/
    implementation.md
    FRONTEND_DESIGN.md
    PITCH_FACTS.md
  public/
    icons/ (192, 512, maskable, favicon)
    audio/hi/*.mp3  audio/en/*.mp3
  scripts/
    generate-audio.mjs            Section 9
    run-rule-tests.mjs            writes src/generated/test-report.json
  src/
    main.tsx  App.tsx  routes.tsx
    engine/
      types.ts  evaluate.ts  loadData.ts  evaluate.test.ts  data.test.ts
    data/
      rules.json  questions.json  config.json
      i18n/en.json  i18n/hi.json
    generated/test-report.json    committed build output
    state/ (session context, reducer)
    ui/
      components/ (Button, Pictogram, SignalShape, ProgressDots, Listen, ModeBadge, QuickExit, CallButton, Sheet)
      screens/ (Language, Mode, Stage, Question, Result, GoNowPlan, Slip, Wellbeing, About, Trust, AshaList, RuleReview)
      icons/ (SVG pictograms, one file per icon id)
      styles/ (tokens.css, base.css, print.css)
    lib/ (i18n.ts, audio.ts, config.ts, slip.ts, exit.ts)
  tests/
    rule_cases.json  reference_check.py
```

## 7. Data contracts

```ts
type Tier = 'GREEN' | 'AMBER' | 'RED';
type Answer = 'yes' | 'no' | 'not_sure';
type StageId = 'pregnant' | 'labour' | 'after_birth';
type Mode = 'woman' | 'asha' | 'family';

interface Question { id: string; module: 'core'|'newborn'; order: number; icon: string;
  stages: StageId[]; en: string; hi: string; short_en: string; short_hi: string; }

interface Rule { id: string; type: 'single'|'all_of'|'count'; module: string; stages: StageId[];
  question_id?: string; question_ids?: string[]; among?: string[]; min?: number;
  tier_if: { yes?: Tier; not_sure?: Tier }; flags?: string[]; source_refs: string[];
  confidence: string; reviewed_by: string | null; note?: string; }

interface FiredRule { rule_id: string; tier: Tier; question_ids: string[]; source_refs: string[]; }

interface EvalResult { tier: Tier; fired: FiredRule[]; flags: string[]; stage: StageId;
  not_sure_ids: string[]; yes_ids: string[]; rules_version: string; evaluated_at: string; }
```

Never rename ids in the JSON files. Tests, audio file names and the slip refer to them.

## 8. Engine

`evaluate(stage, answers, data, modules=['core']) -> EvalResult`. Pure function, no I/O, no randomness, no clock except the `evaluated_at` stamp passed in or created at the edge.

1. Applicable questions = questions whose `stages` include the stage and whose `module` is enabled.
2. Normalise: each applicable question without an answer counts as `not_sure`. Ignore answers to non-applicable questions.
3. For each enabled rule whose `stages` include the stage:
   - `single`: look up the answer. `yes` uses `tier_if.yes`. `not_sure` uses `tier_if.not_sure`. `no` fires nothing.
   - `all_of`: fires `tier_if.yes` only if every listed question is `yes`.
   - `count`: fires `tier_if.yes` if at least `min` of `among` are `yes` (not_sure does not count).
4. Result tier = highest fired tier, or GREEN if nothing fired. Collect `flags` from fired rules.
5. Order `fired` by tier (RED first) then rule id. The first item is the headline reason on the result screen.

`src/engine/evaluate.test.ts` must load `tests/rule_cases.json`, run every case (including `default_answer`, `modules`, `expect_rules_include`, `expect_rules_exclude`, `expect_no_rules`, `expect_flags`) and pass all 46. `tests/reference_check.py` is an independent implementation. Run it as a cross-check; both must agree.

`data.test.ts` must assert: every rule references real questions and real sources; every question is used by a rule; every UI string key exists in both `en.json` and `hi.json`; every question has `en` and `hi`; no number literals like 108 appear in `src/ui` or `src/lib` (grep test) because numbers come from `config.json`.

## 9. Audio (offline Hindi voice)

Principle: ship **pre-generated mp3 files**, cached by the service worker. Browser speech is a last resort only.

- Files: `public/audio/{lang}/{id}.mp3` where `id` is a question id, stage `audio_id`, `result_RED`, `result_AMBER`, `result_GREEN`, `plan_step1..4`, `wellbeing_body`, `intro_woman`, `intro_asha`, `intro_family`, `lang_title`, `mode_title`.
- `scripts/generate-audio.mjs` reads the JSON, builds the list, calls the TTS provider and writes mp3 files. It takes `SARVAM_API_KEY` from the environment and must never write the key to a file or commit it. Add `.env` to `.gitignore`.
- Provider facts [Verified in research notes]: Sarvam Bulbul v3 supports 11 languages including Hindi; request limit 2,500 characters; no SSML; use native-script text (romanised text degrades); output mp3 (opus errors); price about INR 30 per 10,000 characters (v3). Free signup credit amount not stated. A few thousand characters per language costs a few rupees [Inferred]. Check the current docs before running.
- Number handling: the strings contain `{number}`. For audio, speak the digits one by one in Hindi ("एक शून्य आठ" for 108) and in English ("one zero eight"). Put the spoken forms in a small map inside the script, generated from `config.json`.
- Review: a native Hindi speaker must listen to every clip. Re-generate anything wrong. Keep a `audio/REVIEW.md` checklist with initials per clip.
- Fallback chain in `src/lib/audio.ts`: cached mp3 → `speechSynthesis` only if a voice for the language exists in `speechSynthesis.getVoices()` → show "Audio is not available. Please read the screen." Do not assume voices exist. On Android Chrome a missing voice can silently read in English; check `voice.lang` starts with `hi`.
- Playback rules: audio plays only after a user gesture (browser rules). Question screens auto-play after the first tap anywhere. Always show Listen and Slow buttons. Slow = `playbackRate 0.8`. Stop audio on navigation.
- No speech recognition. It needs a network in Chrome. The whole flow is taps.

## 10. Screens and routes (`HashRouter`)

| Route | Screen | Notes |
|---|---|---|
| `/` | Language | Hindi first, English second. Each in its own script with a speaker icon. Choice is remembered in memory only. |
| `/mode` | Mode | Three big buttons: woman, ASHA or ANM, family. |
| `/stage` | Stage | Three pictogram buttons. Title changes by mode ("Where is she now?" for family and ASHA). |
| `/q/:index` | Question | One question, one pictogram, audio, Yes, No, Not sure, Back, progress dots. |
| `/result` | Result | Signal screen (Section 11). |
| `/plan` | Go-now plan | RED only. Family-first wording. |
| `/slip` | Slip | Print and share. |
| `/support` | Wellbeing card | Opened from the result when the flag is set. |
| `/about` | About and safety | Disclosures from `safety.*` strings. |
| `/trust` | Trust | Rule version, sources, test report, review status, numbers with status. |
| `/asha` | ASHA list | Only if the flag and the opt-in are on. |
| `/review` | Rule review | Hidden link in About. For the clinician. |

Persistent: a **Quick exit** button on every screen (Section 12). Mode badge in the header.

Question order: sort the applicable questions by `order`. Put a RED-class question first. After the last question go to `/result`. The Back control returns to the previous answer without losing it. Skipping a question sets `not_sure`.

## 11. Result, plan, slip

**Result screen** (the memorable moment, see design brief): full-bleed tier colour, a large shape (octagon, triangle, circle), the tier sentence in the display font, one action line, the call button (RED and AMBER), the "Because of" line naming the first fired rule's `short` label, and two buttons: "Show this to the ASHA or doctor" (opens the slip) and, for RED, "Open the go-now plan". If any answer was `not_sure`, show `result.not_sure_note`. If the wellbeing flag is set, show a card linking to `/support`. Family mode uses the `_family` title strings. Call button reads `config.numbers.ambulance_primary.number`.

**Go-now plan** (RED only): four steps from the `plan.step*` strings, each with a large number marker (this content is a real sequence), a call button on step 1, the 102 line from `config.numbers.transport_pregnant`, and the JSSK line from `config.entitlements`. Steps can be ticked off.

**Slip:** one A5-sized printable page and a shareable picture. Contents: Maitri mark, stage, tier word and shape, the signs told (yes) using `short_*` labels, the signs unsure, date and time, rule ids in small type, the footer disclaimer. No name, no phone number, no location. `print.css` makes it one page, black and white safe (shape and word carry the tier, not colour). "Share" uses `html-to-image` to make a PNG and `navigator.share({files})` where supported, else downloads the PNG.

**QR (U8, flag `qr_slip`):** encode `{v, stage, y:[question ids], n:[question ids], t:tier, ts}` as compact JSON, base64url, in a QR on the slip. The `/scan` route (flag `qr_scan`) decodes it with `jsqr` and shows the same slip. Offline, camera only, nothing sent anywhere. Build this last and only if everything else is done.

## 12. Privacy and safety implementation checklist

- No analytics, no cookies, no third-party requests at runtime. Add a CSP meta tag: `default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'`.
- Answers in memory. `sessionStorage` only to survive an accidental reload, and cleared by "Clear this check" and "Exit now".
- **Exit now:** clear memory state, `sessionStorage` and `localStorage` keys prefixed `maitri:`, stop audio, then `location.replace('about:blank')`. Test in Chrome on Android and in the installed PWA. If `about:blank` is blocked in the standalone shell, fall back to a plain neutral screen with no text.
- App name and icon are neutral. The home screen label is "Maitri".
- Every call button and number comes from `config.json`; the Trust page shows each number with its `status`. Add a visible line for unconfirmed numbers.
- No telemetry about results. Never log answers to the console in production.
- About page must state: not a diagnosis, tiers are our design, rules are a draft not reviewed by a doctor (until a reviewer name is recorded), data stays on the phone.

## 13. Trust page data

`scripts/run-rule-tests.mjs` runs the Vitest suite programmatically (or parses its JSON reporter output) and writes `src/generated/test-report.json`: `{passed, total, rules_version, generated_at}`. Wire it as `prebuild`. The Trust page imports that JSON, counts rules with `reviewed_by` set, lists sources with links, and lists numbers with status. If the file is missing, show "Test report not available" rather than a fake number.

## 14. Deadline guard (mandatory)

Create `.githooks/pre-commit` that reads `config.json -> deadline_guard.hard_stop_iso` and exits 1 with a clear message if the current time is after it. Run `git config core.hooksPath .githooks` in the setup script and in the README. Commit early and often before then. The repo and its commit history must be accessible. The hard stop in the config is 8:45 PM IST; the official deadline is 9:00 PM IST. Do not commit after either. Do not rebase or rewrite history after the event starts.

Hackathon rules to respect: all work must be built during the event window (start a fresh repo today and commit as you go); acknowledge third-party code, fonts, models and assets in the README; the same repo is used for the final submission; no pushes after the deadline, including README typos.

## 15. Test plan

Automated: engine cases (46), data integrity, i18n key parity, no hard-coded numbers, a build smoke test.
Manual (do on a real low-end Android phone):
- Full flow in Hindi in airplane mode, including audio.
- Install as PWA, relaunch offline.
- Each of the three modes, one RED, one AMBER, one GREEN path.
- Slip prints on one page and the picture shares.
- Quick exit clears state.
- 360 px width, large font setting, bright-sun contrast, greyscale screenshot of each result still reads.
- Axe or Lighthouse accessibility check, no critical issues.

## 16. Timeline for today (IST)

The build is split into 37 phases in `docs/PHASES.md`, run in two parallel tracks (A: logic, B: UI) plus a human track (C), with five gates:

| Time | Gate |
|---|---|
| 09:45 | Gate 1: engine green, 46 of 46 cases pass (P01-P05) |
| 11:45 | Gate 2: design system, icons, plumbing (P06-P15) |
| 14:15 | Gate 3: full Hindi and English flow with result, plan, slip (P16-P25) |
| 16:30 | Gate 4: audio, offline, Trust page, deployed (P26-P31) |
| 18:30 | Gate 5: accessibility and device QA (P34, P36); video and PPT in parallel |
| 20:15 | Freeze: P37, final commit, tag v1-submission |
| 20:15-20:45 | Submit repo link, PPT, video. Nothing committed after 20:45 |

Human tasks to start now, in parallel with Claude Code:
1. Message a doctor, ANM or ASHA with `src/data/rules.json` and the question list for review. Template: "We are building a danger-sign checker for pregnant and postpartum women for a hackathon. Could you spend 10 minutes looking at 16 questions and tell us if any danger sign is missing, wrong, or too mild or too strong? We will credit you only if you agree."
2. Confirm 108/102/112/104 for the demo state on an NHM or state page.
3. Find a native Hindi speaker to review every Hindi string and listen to every audio clip.
4. Open the MCP card PDF and check the danger signs match `rules.json`.
5. Open the SRS and NFHS-6 pages and confirm the statistics on the slide (`docs/PITCH_FACTS.md`).
6. Search Play Store and GitHub for "pregnancy danger signs Hindi offline" so the novelty claim is accurate.

## 17. Three-minute demo script

1. (0:00-0:25) The problem: contact is high but recognition and decision are late. 48.6% delay figure [single study]. One sentence on Maitri.
2. (0:25-1:15) Hindi, family mode, "after birth", answer yes to heavy bleeding. Result: octagon, RED, spoken Hindi. Open the go-now plan, tap call. Show the slip.
3. (1:15-1:45) Pregnant, "baby moving less": AMBER. Then all no: calm result with "go if worse", never "fine". Show "Not sure" going upward.
4. (1:45-2:15) Turn on airplane mode, run a check again, play audio. Quick exit.
5. (2:15-2:45) Trust page: rule version, source per rule, test count, "reviewed by: none yet", numbers with status. One sentence on the Rule review page.
6. (2:45-3:00) Roadmap: clinician review, field test with ASHAs, more languages. State what we do not claim.

## 18. What to claim, what not to claim

Claim: offline Hindi-first checker; deterministic rule file; every verdict traceable to a named sign and source; tiers are our own disclosed design; automated tests confirm the code matches the rule table; designed around the decision delay; privacy by default.
Do not claim: lives saved, mortality reduction, accuracy, validation, clinical approval, "official" or "MoHFW approved" tiers, regulatory clearance, reach, that any helpline number is final, or that nobody has built this.
Use this one for effectiveness: "In a Kenyan RCT of an SMS service with a triaged helpdesk, danger-sign knowledge and postnatal visits improved. Cochrane rates the wider evidence low certainty and no trial shows lower mortality."

## 19. Known gaps (say them out loud if asked)

Rules not clinician reviewed. Hindi not yet reviewed by a native speaker unless step 3 above is done. Five signs lack primary-source wording (breathing, belly pain, baby movement, calf pain, mental health). Helpline numbers unconfirmed except 14416. Most statistics are secondary sources. No field testing with real users. No regulatory opinion. Audio quality depends on the TTS provider and needs human review.

## 20. Version 2 roadmap (after the hackathon submission)

Status: planned, not built. Nothing in this section applies to the v1 submission. The v1 rules in sections 3, 4 and 12 and in `CLAUDE.md` stay in force until the `v1-submission` tag exists. Before any v2 work starts, update `CLAUDE.md` and the decisions log (section 4) so they match the decisions below.

### 20.1 Features

| ID | Feature | What it is | Needs before building |
|---|---|---|---|
| F1 | Antenatal visit and due-date tracker | Woman enters last period date or due date. App shows the due date and the next visit window and a visit checklist. | Visit schedule read by a human from the raw MCP card PDF (S-MCP). Do not write a schedule from memory. Due date method (for example 280 days from last period) stated on screen and confirmed by a clinician. |
| F2 | Vaccine and check-up schedule for mother and baby | Dated list from the delivery date or birth date. | Official MoHFW immunisation schedule document, cited per row. Clinician review. |
| F3 | Government scheme help | Plain-words pages for JSSK, JSY and PMMVY: who gets what, which papers to carry, where to ask. | Current official scheme documents. JSSK text already exists in `config.json` (confirm locally). PMMVY and JSY eligibility and amounts change, so each claim needs a source and a "last checked" date. |
| F4 | Nearest facility finder | List of facilities by district with a phone number and services. | A verified dataset with a licence that allows reuse. Candidate to check: the ABDM Health Facility Registry (unverified, confirm access and terms). Never invent facilities or numbers. Every row shows its source date. |
| F5 | Voice-first navigation and more languages | Spoken prompts on every screen, big-button navigation, then more languages. | Section 20.3. |
| F6 | Family sharing | Husband or mother-in-law receives the plan and the slip. | Section 20.2. |
| F7 | Daily log and guidance (from the product discussion) | Short daily check-in, a private timeline, and rule-based "no concern flagged / tell your ASHA this week / go today" guidance. | Clinician-reviewed rules. A storage decision (D-17). Never says "normal" or "fine". |
| F8 | Reminders | Daily or visit reminders. | A channel decision (D-18). Do not claim reminders work until one channel is wired up. |

Suggested order: F1, F2, F3 (content pages, no backend), then F6 (share without a server), F5 (voice and languages), F7, F8, F4.

### 20.2 Family sharing without a server

Default design: the share button creates a link whose data sits after the `#` (never sent to any server), plus the existing slip image through the phone's share sheet. The link carries only stage, tier, signs and time, the same fields as the slip. No names, no phone numbers. Show a clear line saying anyone with the link can read it. A server-backed share (expiring links, live updates) is allowed only after D-17 is decided.

### 20.3 Languages and voice

Principle: a language ships only when (1) every string exists, (2) a native speaker of that language has reviewed all strings and, for audio, all clips, (3) the script renders with a self-hosted font subset, (4) the audio path works or the app shows the "audio not available" line. Machine translation produces a draft only. Medical text is never shipped on machine output alone.

Options for text-to-speech and translation (checked in Oct 2026 by web search; confirm licences and pricing on the official pages before choosing):

| Option | Use | Notes |
|---|---|---|
| Sarvam Bulbul | TTS, 11 languages | Paid. About INR 30 per 10,000 characters with a free trial credit. Request limit 2,500 characters. Needs an API key at generation time only. |
| Bhashini (government platform) | TTS, translation, speech recognition | Reported free for developers by third-party sources. Official terms and production limits not confirmed. Check bhashini.gov.in and its developer docs. |
| AI4Bharat IndicF5 | TTS, open model, 11 languages | Run it yourself, so no per-character fee. Sources disagree on the licence label (MIT versus Apache 2.0 on related models). Read the LICENSE file in the official repository first. Needs a machine to run it. |
| AI4Bharat Indic Parler-TTS | TTS, open model | Gated access on Hugging Face. Same licence check. |
| AI4Bharat IndicTrans2 | Translation drafts, 22 languages | Model weights under MIT. Training data carries its own CC terms. Drafts only. |
| Google Cloud Text-to-Speech, Azure Speech | TTS, commercial | Indian-language voice lists were not confirmed in this search. Check the official voice lists per language. |

The audio script must not depend on one vendor. It builds the manifest first (dry run), then calls a small provider function. Switching provider must change one function only, and generated mp3 files are committed.

Speech recognition (talking to the app) is a separate decision. Chrome's built-in recognition needs a network. The v1 design stays tap-and-listen.

### 20.4 Data and privacy decisions for v2

| ID | Decision | Status |
|---|---|---|
| D-15 | v2 starts only after the v1 submission is tagged. | Final |
| D-16 | All new clinical, schedule and scheme content carries a source and a last-checked date, and is shown to a clinician before release. | Final |
| D-17 | Storage for the daily log and any sync. Option A: on-device only (IndexedDB), keeps the privacy story, data is lost if the phone is lost. Option B: accounts and a database, adds sync and an ASHA view, and brings consent, encryption, retention and the Digital Personal Data Protection Act 2023 duties. | Open. Needs the team. |
| D-18 | Reminder channel. Options: downloadable calendar entry (no backend), web push (backend, weak on iPhone unless installed), WhatsApp or SMS provider (backend, consent, cost). | Open. Needs the team. |
| D-19 | Language order for v2. Hindi and English are done in v1. Candidates by speakers in the high-burden states: Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Odia, Malayalam, Punjabi. | Open. Needs the team and native reviewers. |
| D-20 | Hindi strings reviewed by the project owner (a native speaker). Record the reviewer name in the README credits and in `audio/REVIEW.md`. This is language review, not clinical review, so it does not go in `reviewed_by` on the rules. | Confirm name |

### 20.5 Not in scope even for v2

No diagnosis. No probability scores. No fetal-sex features. No dose or medicine advice. No numeric thresholds shown to the user unless a health worker enters the measurement.

### 20.6 Decisions made on 25 Oct 2026

| ID | Decision | Status |
|---|---|---|
| D-17 | Backend and database: Supabase (hosted Postgres with built-in sign-in and row level security). Sign-in: phone number with a one-time code. | Chosen. Needs: a Supabase project created by the owner, a text-message provider connected for the code, and a check of the hosting region and data-residency terms before real users. |
| D-19 | Third language: Bengali was requested, then deferred until a native reviewer is available. Hindi and English stay the only shipped languages. | Deferred |
| D-21 | Voice check uses the browser's speech recognition. On Chrome this sends audio to the browser vendor's speech service, so it needs internet and is disclosed on the screen. A server speech-to-text service is a later option, not built. | Built, see 20.8 |

### 20.7 Languages: what the state data suggests

Hindi covers the Hindi-belt states in the burden list (Uttar Pradesh, Bihar, Madhya Pradesh, Rajasthan, Jharkhand, Chhattisgarh). Spoken varieties there (Bhojpuri, Maithili, Awadhi, Marwari and others) are read in Hindi text, but audio in those varieties does not exist. The states in the list that need other languages are Odisha (Odia) and Assam (Assamese). Maharashtra (Marathi) is large by births but the figure was not verified. Bengali was requested and is deferred (D-19). Choose the next language by the state of the first field pilot, not by this list alone. Each language needs its own native review.

### 20.8 Voice check (built)

Route `/speak`, and an "Answer by voice" button on each question.
- She taps one button, speaks, taps again. The text is matched against word lists in `src/data/voice_keywords.json` (Hindi script, romanised Hindi, English). No AI decides anything. A strong phrase gives yes. A weak phrase gives not sure, which escalates to at least AMBER.
- Every mention counts and there is no negation handling. She sees the signs found and removes wrong ones. A missed sign is the unsafe error, so the lists lean toward finding signs.
- One RED answer ends the check at once. The RED screen shows a large call button and reads the result aloud when audio is available.
- Browsers do not let a web page dial without a tap, so the app cannot place the call by itself. The call link is the largest control on the screen.
- Translation is not needed for Hindi or English: recognition returns text in the language she spoke and the word lists cover both. Other languages need their own word lists and review.
- Not tested against real speech. Tests use a mocked recogniser. Test on real phones in noisy rooms before relying on it.
- Open options, not built: record the audio and send it to a server speech-to-text service for better accuracy and offline-free quality. Candidates checked by search: Sarvam speech-to-text (Saaras v3, 23 languages, about INR 30 per hour of audio, under 30 seconds per request) and Groq-hosted Whisper large-v3 (free tier reported at about 20 requests a minute, no Hindi quality data found; note Groq is not xAI's Grok). Either needs a small server function to hold the key, because a key in the browser can be copied. That is a change to the privacy design (audio leaves the phone to a second company) and needs the team's approval.

### 20.9 Content governance for week-by-week and newborn content

1. Week-by-week content: every statement maps to a row in a content table with source document, edition year and page. The screen shows the citation in a collapsed "Source" section. No generated medical text. Allowed themes: routine body changes, basic diet advice taken from ICMR and MoHFW documents, and the standard danger signs. Source documents to use: MoHFW antenatal care and PMSMA guidance, ICMR dietary guidelines for Indians, WHO antenatal and postnatal care recommendations. A person reads the raw documents. The assistant does not write from memory.
2. Newborn module: the switch lives in two places, `config.json` `feature_flags.newborn_module` and `questions.json` `modules.newborn.enabled`. Both stay false until a paediatric or neonatal clinician signs off in `docs/CLINICAL_SIGN_OFF.md` against the exact commit of `questions.json`. The newborn questions are lay-language by design and the app contains no numeric thresholds, so the review is of wording, tiers and referral advice against IMNCI and facility-based newborn care guidance, not of breathing-rate or temperature limits.
3. Postpartum mood: keep the single wellbeing question and the Tele-MANAS card (14416 is confirmed). Do not add the Edinburgh Postnatal Depression Scale until two things are settled. The copyright holder and terms are described inconsistently in the sources found (the Royal College of Psychiatrists in one, the British Journal of Psychiatry in another), so read the current terms from the publisher. And a Hindi version with a published validation study must be found. The publishers say they cannot vouch for unvalidated translations. A literal or machine translation must not be used.

### 20.10 Backend design (Supabase), draft

Not built yet. A draft schema is in `supabase/migrations/0001_init.sql`.
- Tables: `profiles` (stage, due date, delivery date, language) and `checkins` (date, phase, answers, note, tier, rules version). Each row belongs to one user.
- Row level security is on for both tables. A signed-in user can read and write only rows where `user_id` equals their own id. The anon key can be public in the app. The service key never goes in the app or in git.
- The phone number lives only in Supabase's own auth tables, not in ours. Deleting the account deletes all her rows.
- The danger-sign verdict is still computed on the phone from the same rules. The server stores results. It never decides them.
- Before real users: legal review under the Digital Personal Data Protection Act 2023 (consent text, retention, deletion, breach plan), confirm the hosting region, a text-message provider with sender registration for India, and a plain explanation to women of what is stored.
- Offline: the check-in form works without internet and syncs when the phone is online again. The emergency check never needs an account or a network.

### 20.11 Backend status (26 Oct 2026 build)

Built, tested only against a simulated client:
- Phone and one-time-code sign-in (`/account`), sign out, and delete account (database function `delete_my_account`).
- Daily log (`/log`): one entry per day, saved from the result screen with "Save to my daily log", with loading, empty and error states and delete. An entry is the stage's danger-sign answers and the result computed on the phone. It adds no new clinical rules or guidance. If her tier is GREEN the log says "No danger sign told", never "normal".
- Everything is hidden unless `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. With them unset the app behaves exactly as before and makes no backend request.
- The client is loaded on demand. The session is stored under `maitri:auth` so Exit now signs her out.
- The content security policy now allows `https://*.supabase.co` for connections.

Not done, needs the owner or other people:
1. Create a Supabase project, run `supabase/migrations/0001_init.sql`, and turn on phone sign-in with a text-message provider (cost, and sender registration for India).
2. Set the two variables in the host's environment settings. Never commit them.
3. Test against the real project: sign in, row level security (a second account must not read the first account's rows), delete account, rate limits.
4. Offline saving is not built. Saving needs internet and says so.
5. Legal and privacy review, hosting-region check, and plain-language consent text, as in 20.10.
6. Clinician review of the log screen wording. The daily questions are the existing danger-sign questions, so they carry the same draft status.

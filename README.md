# Maitri (मैत्री)

An offline, Hindi-first danger-sign checker for pregnant and postpartum women in India. It tells the family what to do in the next ten minutes and shows exactly why.

Built for recHERsion 2026, Problem Statement 1 (Women's Healthcare).

> Education tool. It does not diagnose and cannot replace a health worker. The rules are a draft and have not been reviewed by a doctor. See "Honest limitations".

## What it does :- 

- **Check by tapping or by voice.** One question per screen with a picture, big Yes / No / Not sure buttons with tick and cross symbols, and Listen and Slow buttons. Or tap the microphone and say what is happening.
- **Three result levels with word, shape and colour together:** RED octagon (go to the hospital now), AMBER triangle (see the ANM, ASHA or doctor today), GREEN circle ("No danger sign told", never "fine" or "safe"). A greyscale screenshot still reads.
- **One RED sign ends the check at once** and shows a large call button.
- **Go-now plan** for the family after RED: call, decide who goes, show the slip, ask about free transport and care (JSSK).
- **Maitri slip:** a one-page summary (stage, result, signs told, time, rule ids) to print or share as a picture. No name or phone number.
- **Show-your-work Trust page:** rule version, the source for every rule, automated test count, clinician review status ("None yet"), and every helpline number with its confirmation status.
- **Private on a shared phone:** no account needed, answers stay in memory, and "Exit now" clears everything and leaves the app.
- **Works offline** after one visit (service worker precaches the app, rules and fonts).
- **Modes:** woman, ASHA or ANM (optional on-device list, off by default), family.
- **Rule review page** for a clinician to mark rules reviewed and export an updated `rules.json`.

Optional, off until configured: phone sign-in and a daily log (see "Backend").

## Run it

```
npm install
npm run dev          # development server
npm test             # 180+ tests: all 46 rule cases, safety properties, every decision path, Hindi/English audit
npm run build        # runs the tests first, then builds and writes the service worker
npm run preview      # serve the production build
python3 tests/reference_check.py   # independent Python implementation of the rules, must also pass 46 of 46
npm run test:differential          # re-checks 12,000+ generated answer sets against a second implementation in Python
npm run packet       # regenerates docs/CLINICIAN_REVIEW_PACKET.md from the data
npm run check:contrast
npm run check:backend              # verifies a Supabase project once one is configured
npm run audio:plan   # clip list and cost estimate for the voice clips (no network)
```

Needs Node 20 or newer.

## How it decides

The verdict is a deterministic rule engine in `src/engine`. The rules live in one file, `src/data/rules.json`, with a source for each. There is no AI, no network call and no randomness in the verdict.

- The highest level among the fired rules wins. If none fire, the result is GREEN ("No danger sign told").
- "Not sure" and skipped answers escalate (at least AMBER for signs that matter). Over-escalation is accepted because missing a danger sign costs more.
- The app shows no numeric clinical thresholds. Questions are plain-language.
- Voice only turns spoken words into the same answers using word lists in `src/data/voice_keywords.json`. It never decides a result. She sees the signs found and can remove any before continuing.
- The three levels are our own design, based on the MoHFW Mother and Child Protection card and WHO guidance. They are not an official scheme. The About page says so.

## Folder map

```
src/engine      rule engine, types, data loader, tests
src/data        rules, questions, config (helpline numbers), voice word lists, Hindi and English strings
src/lib         i18n, speech, audio, config accessors, slip image, ASHA list, backend client
src/state       session reducer, result hook, auth
src/ui          screens, components, pictograms, styles
scripts         test report, service worker writer, contrast check, audio manifest
supabase        draft database schema (not connected)
tests           46 rule cases and the Python reference check
docs            spec, build plan, design brief, pitch facts, sign-off log
```

## Backend (optional)

Google sign-in, phone-code sign-in and a daily log are built behind two settings, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). With them unset the app shows no account features and makes no backend request. The schema is in `supabase/migrations/0001_init.sql` with row level security. A plain-language explanation is in `docs/DATABASE_EXPLAINED.md` and setup steps are in `docs/BACKEND_SETUP.md`, and `npm run check:backend` verifies a project once it exists. Until a real project is connected and checked, treat this part as tested only against a simulated client. Never put the service role key in this repository.

## Deploy

`vercel.json` is included. Import the repository in Vercel, build command `npm run build`, output `dist`. The headers allow the microphone for the voice check and nothing else. Live URL: _to be added after deploy_.

## Honest limitations

- The rules are a draft and have not been reviewed by a clinician. `docs/CLINICAL_SIGN_OFF.md` is the empty record. Five signs have no primary-source wording yet (breathing, belly pain, baby movement, calf pain, mental health).
- Hindi strings were reviewed by a native speaker (the project owner). The newest strings and the voice word lists are marked draft. English-only and Hindi-only reviewers are not clinicians.
- Helpline numbers other than Tele-MANAS 14416 are not confirmed. The Trust page says so.
- The voice check uses the browser's speech recognition. On Chrome this sends audio to the browser vendor's speech service, so it needs internet. It has been tested only with a simulated recogniser, not on real phones in noisy rooms. Browsers cannot dial a call without a tap, so the call link is the largest control but the app cannot place the call by itself.
- No voice audio clips are included yet. Listen uses a recorded clip if present, otherwise browser speech if the phone has a Hindi voice, otherwise it says audio is not available.
- No field test with real users. No regulatory opinion. The tests check that the code matches the rule table. They are not clinical validation.
- Statistics in our materials are mostly from secondary sources and are labelled in `docs/PITCH_FACTS.md`.

## Credits and third-party resources

Libraries (all MIT unless noted): React, React DOM, React Router, Vite, Vitest, Testing Library, jsdom, TypeScript (Apache-2.0), html-to-image, @supabase/supabase-js. Checks run outside the repository with Playwright (Apache-2.0) and axe-core (MPL-2.0).

Fonts, self-hosted through Fontsource (SIL Open Font Licence 1.1): Yatra One and Mukta.

Content and sources the rules are based on: MoHFW Mother and Child Protection card, the HBNC leaflet, the WHO guide "Pregnancy, childbirth, postpartum and newborn care: a guide for essential practice", the JSSK guidelines, and the PIB note for Tele-MANAS 14416. Links are on the Trust page and in `src/data/rules.json`.

Pictograms, the Maitri mark and the border motif were drawn for this project as inline SVG. No stock images.

Built with the help of Claude Code (an AI coding assistant). The team reviews and is responsible for all content.

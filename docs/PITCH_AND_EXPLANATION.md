# Maitri: the winning pitch and the full explanation

Prepared for recHERsion 2026, Problem Statement 1 (Women's Healthcare). Everything here matches what is in the repository. Where something is not done, it says so, because judges score what is demonstrated and reward honesty over hype.

---

## 1. The pitch

### The hook (15 seconds)

> "A woman has just given birth. The bleeding will not stop. Her family has minutes, and nobody knows whether to wait or go. Maitri is the friend who tells them what to do now, and shows exactly why."

### The 90-second pitch

1. **The gap is not contact, it is the decision.** About 25.2 million births a year in India *(secondary source)*. In one Indian hospital study, 48.6% of maternal deaths involved a delay in deciding or seeking care *(verified, single study)*. About one in three women still has fewer than four antenatal visits *(secondary, derived)*.
2. **Today's options fail in a crisis.** A card has one level and no plan. Chatbots need typing, signal and trust in hidden logic, and some say "you are fine". A helpline needs a phone and a clear head.
3. **Maitri closes the gap.** One question per screen, a picture for each, big tick and cross answers, Hindi and English, and a voice option. One RED sign stops the check and shows a large call button. The family gets a go-now plan and a slip for the ASHA.
4. **It shows its work.** "Why this result?" lists the rule, the sign, the source and the rule version, and says no AI decides. It is a fixed rule list, tested 205 times and re-checked by a second program on 12,420 generated cases.
5. **It is honest.** No clinician has reviewed the rules yet. The three levels are our own design. "Not sure" always goes up. It never says "fine". It works offline and needs no account.
6. **It is ready for a pilot.** Live app, demo video, tests, accessibility audit, and a clear path: clinician review, ASHA field test, Odia, Assamese and Bengali next.

### The 3-minute script (matches the demo video)

| Time | Say | Show |
|---|---|---|
| 0:00 | The hook and the one-line value: "other tools tell a woman what her symptoms might mean. Maitri tells her family what to do in the next ten minutes." | Title slide |
| 0:25 | The three facts, with their confidence labels | Problem slide |
| 0:50 | Three people: the woman, the ASHA, the family. About 36% of women have no phone of their own, so family and ASHA modes come first. | Audience slide |
| 1:10 | Live: open the app. The emergency call is the first thing on screen. Tap "Speak instead", say that the baby is born and there is heavy bleeding. She sees what was heard and the sign found. | App, voice |
| 1:40 | One RED sign ends the check. Large call button. "Why this result?" Open the go-now plan and the slip. | App, result, why, plan, slip |
| 2:10 | Tap check: tick, cross, "Not sure" goes up to AMBER. Airplane mode: it still works. | App |
| 2:30 | Trust page: sources, 205 tests, review status "none yet", helpline status, what is simulated. | Trust page |
| 2:45 | Roadmap and the honest limits. Ask: a clinician reviewer and an ASHA pilot. | Roadmap slide |

If the network or audio fails: use the tap check (it needs neither) and the recorded demo video in `docs/demo`.

---

## 2. The project, point by point

**What it is**

1. Maitri (मैत्री, "friendship") is an offline, Hindi-first danger-sign checker for pregnant women and women in the 42 days after birth.
2. It is a web app that installs like an app and works with no internet after one visit.
3. It is an education tool. It does not diagnose and cannot replace a health worker.

**Who it is for**

4. The woman, on her own or a shared phone.
5. The ASHA or ANM checking one woman after another (optional on-device list, off by default).
6. The family member who decides whether she goes now.

**What it does**

7. Asks plain-language questions one at a time, each with a picture and a Listen button.
8. Accepts answers by tapping (tick for Yes, cross for No, question mark for Not sure) or by voice.
9. Shows one of three results, each with a word, a shape and a colour so it reads in greyscale: RED octagon (go to the hospital now), AMBER triangle (see the ANM, ASHA or doctor today), GREEN circle ("No danger sign told").
10. Stops at the first RED sign and shows a large call button for the ambulance number.
11. After RED, a go-now plan for the family: call, decide who goes, show the slip, ask about free transport and care (JSSK).
12. A one-page slip (stage, result, signs told, care contacts with their status, time) to print or share as a picture or text, only after she consents. No name or phone number.
13. "Why this result?" shows which rules applied, the sign, the level, the source and its reliability, and the rule version.
14. A first-screen emergency call button, so nobody in a crisis has to start a check first.
15. A Trust page: rule version, tests passing, review status, sources, every helpline with its confirmation status, how data is handled, and what is simulated or not done.
16. A rule review page where a clinician can mark rules reviewed and export the updated rules file.
17. "Exit now" clears everything and leaves the app, for shared phones.

**How it decides**

18. A deterministic rule engine reads rules from one file. No AI, no network call and no randomness decide a result.
19. The highest level among the rules that apply wins. If none apply the result is GREEN, worded "No danger sign told" with a go-if-worse line. The app never says "fine" or "safe".
20. A skipped or "Not sure" answer on a sign that matters counts as AMBER at least. Over-escalation is accepted because missing a danger sign costs more.
21. Two AMBER-class signs together become RED.
22. The app shows no numeric clinical thresholds.
23. Voice only turns spoken words into the same Yes, No, Not sure answers using fixed word lists. She sees the signs found and can remove them. A spoken "No" is confirmed first, because a misheard "Yes" only over-escalates but a misheard "No" could hide a sign.

**How it is built**

24. React, TypeScript and Vite. Rules, questions, helpline numbers and every sentence live in data files, in Hindi and English.
25. A service worker precaches the app, so it works offline.
26. Optional accounts and a daily log (Google or phone-code sign-in, a Postgres database with row level security), switched on only when configured. Built and tested in a local Postgres and against a simulated client. Not connected to a real project yet.
27. Checks: 205 automated tests, an independent Python implementation agreeing on all 46 rule cases and on 12,420 generated answer sets, tests that render every screen in both languages, a small-screen layout audit, an accessibility audit, database tests, and CI on every pull request.

**What is not done (say this out loud)**

28. No clinician has reviewed the rules. The prototype label stays.
29. Voice is tested only with a simulated recogniser, not on real phones. It needs internet on most phones.
30. No recorded voice clips yet. The phone's own voice is used if it has one.
31. The backend and daily log are not connected to a real project.
32. No field test with ASHAs or families. Only Tele-MANAS 14416 is a confirmed helpline.

---

## 3. The full explanation

### The problem
Most maternal emergencies are not a lack of contact with the health system: about 90.6% of births are institutional *(secondary)*. They are a failure to recognise danger and decide quickly. A frightened family on a cheap phone, in bright sun or a crowded room, cannot read a long page or type a question. Many read little. The existing Mother and Child Protection card lists danger signs but has one level ("take to hospital immediately"), no plan and no voice.

### The insight
The most important thing is the next ten minutes: call, decide who goes, show what was told, ask for free transport. So Maitri is built around the decision delay, not around symptom lookup.

### The solution
A calm tool that asks one question at a time, in the family's language, with a picture and a voice, and ends in a clear action. Its boldness is spent in one place, the result screen. Everything else stays quiet, plain and large.

### Why you can trust it
Every result names the sign that caused it and the source. The rules are in one file a clinician can review without touching code. Tests prove the code follows the rule table. The Trust page says plainly what is draft, unconfirmed or simulated.

### Privacy
The check runs on the phone and sends nothing anywhere. No account is needed. Voice uses the phone browser's speech recognition, which on Chrome may send audio to the browser vendor, and the screen says so. Maitri does not keep the voice or words. Accounts are optional and off until configured.

### Impact and how we will measure it
We do not claim lives saved. In a pilot we will measure the time from the first sign to the call, the share of checks finished in under two minutes, and how often the ASHA no longer has to re-ask at the facility. Related evidence: a Kenyan trial of a triaged SMS service improved danger-sign knowledge and postnatal visits; wider evidence is low certainty.

### Feasibility and milestones
Static hosting, no server for the check, low running cost (about INR 6 per language for generated voice clips at list price). What blocks real use is people: a named clinician reviewer, native reviewers for each language, and a district health mission for a pilot.

### Business model (proposed, untested)
Free for women and families. Funded by state health missions and NGOs (licence, localisation, ASHA training, a district dashboard with consent), CSR and grants (languages, voice clips, clinical review), and paid services around an open, auditable core. No data is sold.

### Roadmap
Now: clinician review, ASHA field test, real-phone voice test. Next: Odia, Assamese and Bengali with native review, connect sign-in and the daily log. Then: visit and vaccine schedules and scheme help, each with an official source. Later: a facility finder from a verified dataset.

---

## 4. Bhashini: use cases (proposed, not implemented)

**Status first.** The app does not use Bhashini anywhere. This section describes how it could be used, with the rules we would apply. We have not read Bhashini's official terms (third-party pages say developer access is free, one source says it is not priced for production), and we have not tested its Hindi or other-language output on medical speech.

**What Bhashini is.** The Government of India's national language-technology platform, offering speech recognition, text-to-speech, translation and transliteration for the 22 scheduled Indian languages through APIs that developers register for.

**Why it is a good fit for Maitri.** The states with the heaviest maternal burden also need Odia and Assamese, and Bengali and Marathi were requested. A government platform built for those languages, possibly free for developers, suits a public-health tool and a future partnership with state health missions.

| # | Use case | Flow | Guardrails | Status |
|---|---|---|---|---|
| UC-1 | **First-draft translations for a new language** (Odia, Assamese, Bengali) | The English strings and questions go in. A draft comes out. | Draft only. A native speaker reviews every string before it is shown. Key parity and the wrong-language test must pass. Nothing ships unreviewed. | Not built |
| UC-2 | **Voice clips for a new language** | The 35 clip texts per language (digits spoken one by one) go in. Audio files come out and are committed to the repository, so the app stays offline. | A native speaker listens to every clip. The official terms and licence are checked first. | Not built (a clip manifest and a dry run exist) |
| UC-3 | **Speech-to-text for the voice check** where the browser's recognition is weak or missing | A short recording goes to a small server function that holds the key, and text comes back. | Audio leaving the phone to a second company needs the team's approval and a consent line. All existing safeguards stay: she sees the signs, a spoken "No" is confirmed, tap is always available. Does not work offline. | Not built (decision D-21 open) |

**What Bhashini would never do in Maitri.** It would never decide a result. The verdict stays a fixed rule list. Translations are never trusted without review.

**Decision gates before any use.** (1) Read the official terms and pricing. (2) Test it on real recordings or strings in the target language. (3) Native reviewer available. (4) Privacy decision for any audio. (5) A fallback that works with no network.

**What we say if asked.** "Bhashini is on our roadmap for Odia, Assamese and Bengali: draft translations and voice clips that native speakers review, and possibly a server speech service if the team approves audio leaving the phone. Today the check uses no third-party language service."

---

## 5. How this maps to the judging criteria

| Criterion (weight) | Evidence to point to |
|---|---|
| Problem relevance and understanding (15) | Three labelled facts, three personas, built around the decision delay |
| Innovation and originality (15) | Emergency call first, one-RED-sign stop, voice with confirmation, "Why this result?", rules a clinician can review, honest Trust page |
| Technical implementation (20) | Deterministic engine, 205 tests, Python re-check on 12,420 cases, database tests in real Postgres, CI, offline service worker |
| Working MVP and demonstration (25) | End-to-end flow: first screen, voice or tap, RED, call, why, plan, slip, offline, Trust page. Demo video in `docs/demo`. |
| Feasibility and potential impact (15) | Static hosting, low cost, privacy by default, a clear pilot path, impact as measured goals not claims |
| User experience and accessibility (10) | One question per screen, pictures, tick and cross, large targets, Hindi and English with an audit, axe and small-screen audits |

---

## 6. Likely questions, with honest answers

1. **Has a doctor reviewed this?** No. It is a prototype and says so on screen. The rules are in one file, there is a review page, and we have a packet ready for a clinician (`docs/CLINICIAN_REVIEW_PACKET.md`).
2. **Why not use AI?** Because a result must be explainable and testable. Rules can be audited line by line. AI would add risk and cost without helping the family in the next ten minutes.
3. **What if voice mishears?** She sees the signs found and can remove them. A spoken "No" is confirmed. A misheard "Yes" only over-escalates. Tap is always available.
4. **Does voice work offline?** No. Browser speech recognition needs internet on most phones. The tap check works fully offline.
5. **Why do you over-escalate?** Missing a danger sign costs more than an extra visit. Published triage studies describe both errors, and we choose the safer one openly.
6. **Where do the three levels come from?** They are our own design based on the MCP card and WHO guidance. The card has one level. The About page says so.
7. **Is the data safe?** The check sends nothing anywhere. Accounts are optional and off until configured. The database is protected so each woman reads only her own rows, tested in a real Postgres. A legal and security review has not happened.
8. **Is the ambulance number right?** It is user-supplied for Madhya Pradesh and unconfirmed. The Trust page and the slip show that status. Only Tele-MANAS 14416 is confirmed.
9. **How is this different from other tools?** We believe none combines offline use, Hindi-first voice and pictures, a family action plan, auditable rules and a shareable slip. That is from limited searching, so we say "built around the decision delay" and do not claim to be first.
10. **What did you build in the hackathon versus use?** The app, rules engine integration, tests and docs were built during the event, with the help of Claude Code, an AI coding assistant. Third-party libraries and fonts are listed in the README with their licences.
11. **How will it make money?** It will not charge women. Deployments, grants and paid services around an open core would fund it. This is a proposal.
12. **What would you do with another month?** Clinician review, an ASHA field test, real-phone voice testing, Odia, Assamese and Bengali with native review, recorded voice clips and a connected daily log.

---

## 7. Claims we can make and claims we must not make

**We can say:** offline, Hindi-first, tap-and-voice checker. Deterministic rule file. Every verdict names its sign and source. The three levels are our own disclosed design. Automated tests confirm the code matches the rule table (not clinical validation). Built around the decision delay. Privacy by default.

**We must not say:** lives saved, reduced mortality, accuracy, sensitivity, validation, clinical approval, "official" or "MoHFW approved" levels, regulatory clearance, reach, that any helpline number is final (only 14416 is confirmed), that nobody has built this, that Bhashini is used, or that the backend is live.

# Start here: how to use this pack with Claude Code

## 1. Set up (5 minutes)

1. Create an empty folder named `maitri` and copy everything from this pack into it: `CLAUDE.md`, `docs/`, `src/data/`, `tests/`, `prompts/`.
2. Open a terminal in that folder and start Claude Code.
3. Paste the **first-session prompt** below. It does P01 only.

## 2. First-session prompt (paste once)

```
You are building Maitri, a hackathon project due today at 21:00 IST. Commits after the deadline disqualify us.

Read CLAUDE.md now. Then read docs/PHASES.md (the index and the "after every phase" rules), docs/implementation.md and docs/FRONTEND_DESIGN.md. Skim src/data/*.json and tests/rule_cases.json. Do not change any of these files.

When you have read them, reply in at most 8 lines:
- your one-paragraph understanding of Maitri and its five demo USPs
- anything in the spec that looks contradictory, missing or risky
- the npm packages you will install in P01

Then do phase P01 exactly as written in docs/PHASES.md. Finish with the 5-line phase summary and stop.
```

## 3. Every later phase (paste each time)

```
Do phase PXX from docs/PHASES.md. Follow CLAUDE.md. Stay within the phase's scope. Run npm test and npm run build, commit with the phase's message, reply with the 5-line summary, and stop.
```

Replace `PXX` with the phase id (P02, P03 and so on). If you run two Claude Code sessions in parallel (Track A and Track B), add one line telling the session its track: `You are Track A (logic). Do not edit src/ui or public/icons.` or `You are Track B (UI). Do not edit src/engine, src/state, src/lib, src/data, scripts or tests.`

## 4. If Claude Code drifts

```
Stop. Re-read CLAUDE.md and the text of phase PXX. List what you changed outside the phase's scope, revert it, and finish only the phase.
```

## 5. Human tasks running alongside (Track C)

Start these now. Section 16 of `docs/implementation.md` lists the details.

1. Send the rules to a doctor, ANM or ASHA for review (a message template is in section 16).
2. Confirm 108, 102, 112 and 104 for the demo state on an NHM or state page.
3. Find a native Hindi speaker to review every string and audio clip.
4. Get a Sarvam API key for audio generation (P28).
5. Create the GitHub repository and a Vercel account (P31).
6. Check the starred statistics in `docs/PITCH_FACTS.md` against primary sources.
7. Search the Play Store and GitHub for "pregnancy danger signs Hindi offline" before you claim novelty.

## 6. Hard times (IST)

- 20:15: code freeze and final commit, tagged `v1-submission`.
- 20:45: the hook blocks commits.
- 21:00: the repository link, PPT and demo video must all be submitted. No commits or pushes after this, not even a README typo.

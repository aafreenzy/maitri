# Maitri: rules for Claude Code

Maitri (मैत्री) is an offline, Hindi-first danger-sign checker for pregnant and postpartum women in India. It is being built for a hackathon. **Deadline: Sunday 25 Oct 2026, 00:00 IST (extended from 21:00, confirmed by the team). Any commit after the deadline disqualifies the team.** The pre-commit hook blocks commits after 23:50 IST. Never bypass it (`--no-verify` is forbidden).

## Read before working

1. `docs/PHASES.md` gives the build order. Do one phase at a time, only the phase you are asked to do.
2. `docs/implementation.md` is the spec: behaviour, data contracts, engine, safety and privacy.
3. `docs/FRONTEND_DESIGN.md` covers the visual system. Follow it exactly for any UI work.
4. `docs/PITCH_FACTS.md` holds the statistics with confidence labels. Use it for README and slide work only.

## Non-negotiables

- **The data is the clinical truth.** `src/data/rules.json` and `questions.json` hold the clinical content, and ids are stable. Never change a tier, a rule, a question or an id unless the human explicitly asks. If you think a rule is wrong, say so and stop. Never edit tests to make them pass without telling the human.
- **The verdict is deterministic.** No AI, LLM, free text or network call decides a result. `not_sure` and skipped answers escalate upward. The maximum tier wins.
- **Never say "fine" or "safe".** The lowest result is "No danger sign told", plus the go-if-worse line.
- **No numeric clinical thresholds in the UI** (blood pressure, temperature, Hb, pad count, kick count).
- **Phone numbers come only from `src/data/config.json`.** Never hard-code a helpline. Never add 181. Only 14416 is confirmed; the others show their status on the Trust page.
- **All user-facing text goes through `src/data/i18n/en.json` and `hi.json`.** Keep both files at key parity. Do not invent copy inside components.
- **Privacy.** No analytics, cookies or tracking. Accounts exist only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (decision D-17, 25 Oct 2026). The only external host is Supabase, contacted only after she signs in or saves a log entry. The emergency check never needs an account or a network and never contacts the backend. The `SUPABASE` service role key never goes in the app or in git. No names anywhere. Her phone number is held only by the sign-in service to send the code and is never written to our tables, the slip or logs. Answers stay in memory and sessionStorage unless she saves them to her log. localStorage is used only by the opt-in ASHA list and the sign-in session (`maitri:auth`), and Exit now clears every `maitri:` key.
- **No secrets in git.** `SARVAM_API_KEY` is read from the environment only. Never print or log it.
- **No fetal-sex features. No diagnosis wording. No probability scores.**
- **Disclose the tiers.** RED/AMBER/GREEN is the team's own design, and the About page must say so.

## Working style

- Small commits, one per phase, with the message given in the phase. Use conventional commit prefixes.
- Run `npm test` and `npm run build` after every phase. Both must pass before you commit.
- If a library or API does not exist or behaves differently than the spec says, say so plainly and pick the simplest safe fallback. Never pretend.
- Before you write code against an external API (Sarvam), read its current docs.
- When a phase is done, reply in at most 5 lines: what changed, test status, anything blocked or uncertain, and the next phase id. Then stop and wait.
- Stay inside your track's folders when working in parallel (see `docs/PHASES.md`).

## Commands

`npm run dev`, `npm test`, `npm run build`, `npm run check:contrast`, `npm run audio:plan`, `npm run audio:generate`, `npm run audio:check`, `npm run e2e` (once it exists), `python3 tests/reference_check.py`.

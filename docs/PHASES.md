# Maitri build plan: 37 phases

Each phase is small enough to finish, test and commit in one go. Paste the phase prompt into Claude Code, let it finish, read its 5-line summary, then move on. Every phase ends with passing tests, a passing build and one commit.

How to run a phase: open Claude Code in the repo and type `Do phase P07 from docs/PHASES.md. Follow CLAUDE.md.` Or paste the prompt block directly.

Time budgets include your review. Claude Code itself is often faster. Total sequential time is about 11.5 hours. With two people working in parallel tracks it fits comfortably before the 8:15 PM freeze. Phases marked Optional can be dropped, in the order P35, P33, P32.

## Index

| Phase | Title | Min | Track | Priority | Depends on |
|---|---|---|---|---|---|
| P01 | Scaffold, repo and deadline guard | 15 | A | Must | none |
| P02 | Types and data loader | 10 | A | Must | P01 |
| P03 | Rule engine | 15 | A | Must | P02 |
| P04 | Engine and data tests | 15 | A | Must | P03 |
| P05 | Test report and prebuild gate | 10 | A | Must | P04 |
| P06 | Fonts, tokens and base styles | 15 | B | Must | P01 |
| P07 | Brand mark, wordmark and app icons | 15 | B | Must | P06 |
| P08 | Core components | 20 | B | Must | P06 |
| P09 | Pictograms, part 1 | 25 | B | Must | P08 |
| P10 | Pictograms, part 2 | 25 | B | Must | P09 |
| P11 | Signal components and contrast check | 20 | B | Must | P08 |
| P12 | i18n library | 15 | A | Must | P02 |
| P13 | Config and helpline numbers library | 10 | A | Must | P02 |
| P14 | Session state | 15 | A | Must | P02, P12 |
| P15 | Routing shell and Exit now | 15 | A | Must | P08, P14 |
| P16 | Language screen | 15 | B | Must | P15, P07 |
| P17 | Mode screen | 10 | B | Must | P16, P10 |
| P18 | Stage screen | 10 | B | Must | P17 |
| P19 | Question screen | 25 | B | Must | P18, P11 |
| P20 | Result logic | 15 | A | Must | P14, P03 |
| P21 | Result signal wall | 25 | B | Must | P19, P20, P11 |
| P22 | Go-now plan | 15 | B | Must | P21, P13 |
| P23 | Slip screen and print | 20 | B | Must | P21 |
| P24 | Slip share as picture | 15 | B | Must | P23 |
| P25 | Support card and About | 15 | B | Must | P21 |
| P26 | Audio library and Listen button | 20 | A | Must | P19 |
| P27 | Audio generation script | 15 | A | Must | P26 |
| P28 | Generate, review and wire audio | 30 | A + human | Must | P27 |
| P29 | PWA and offline | 20 | A | Must | P25, P28 |
| P30 | Trust page | 20 | B | Must | P05, P25 |
| P31 | Deploy | 15 | A | Must | P29 |
| P32 | Rule review page | 20 | B | Optional | P30 |
| P33 | ASHA mode list | 25 | B | Optional | P25 |
| P34 | Accessibility pass | 25 | B | Must | P25 |
| P35 | End-to-end tests and performance | 25 | A | Optional | P31 |
| P36 | Device QA and polish | 45 | all | Must | P31, P34 |
| P37 | README, demo, slides and freeze | 30 | all | Must | P36 |

## Parallel tracks and gates

- **Track A (logic, files):** owns `src/engine`, `src/state`, `src/lib`, `src/data`, `scripts`, `tests`, config files.
- **Track B (UI):** owns `src/ui`, `public/icons`, styles.
- **Track C (human, no code):** clinician review of `rules.json` (message template in `implementation.md`), native Hindi review, confirm helpline numbers, check statistics, get the Sarvam key, create the GitHub repo and Vercel project, device testing, slides, video.
- Both tracks start after P01. Do not edit the other track's folders. Merge often (commit small, pull before each phase).

Gates (approximate clock if you start at 08:40 and run two tracks):
- **Gate 1, 09:45:** engine green, 46 of 46 cases pass (P01-P05).
- **Gate 2, 11:45:** design system, icons and plumbing done (P06-P15).
- **Gate 3, 14:15:** full Hindi and English flow clickable, with result, plan and slip (P16-P25).
- **Gate 4, 16:30:** audio, offline, Trust page, deployed (P26-P31).
- **Gate 5, 18:30:** accessibility, device QA done (P34, P36).
- **Freeze, 20:15:** last commit. Hard stop 20:45. Official deadline 21:00.

## After every phase (Claude Code must do this)

1. Run `npm test` and `npm run build`. Both must pass.
2. Commit with the message given in the phase.
3. Reply with at most 5 lines: what changed, test status, anything blocked or uncertain, and the next phase id. Then stop.

---

## P01. Scaffold, repo and deadline guard

Track A. 15 min. Must.

```
Do phase P01. Read CLAUDE.md, docs/implementation.md sections 5, 6 and 14.

Create the project in the repo root with Vite + React 18 + TypeScript in strict mode. The repo already contains docs/, src/data/, tests/, CLAUDE.md. Never overwrite anything in those folders.
- Dependencies: react, react-dom, react-router-dom. Dev: vite, @vitejs/plugin-react, typescript, vitest, jsdom, @testing-library/react, @testing-library/user-event.
- tsconfig: strict true, resolveJsonModule true, noUncheckedIndexedAccess true.
- Scripts: dev, build (tsc --noEmit && vite build), preview, typecheck, test (vitest run --passWithNoTests), test:watch.
- .gitignore: node_modules, dist, .env, .DS_Store, audio-cache. Add .env.example containing SARVAM_API_KEY=.
- App.tsx renders a plain placeholder with the text Maitri. index.html has lang="hi", viewport meta, theme-color.
- Deadline guard: create .githooks/pre-commit (executable, POSIX sh) that runs a small node one-liner. It reads src/data/config.json deadline_guard.hard_stop_iso and exits 1 with a clear message if Date.now() is later. For testing, honour an env var MAITRI_FAKE_NOW (ISO string). Create scripts/setup.sh that runs git config core.hooksPath .githooks and chmod +x on the hook, then run it.
- git init if needed. Make the first commit.
Prove the hook works: with MAITRI_FAKE_NOW=2026-10-25T21:30:00+05:30 a commit must be refused; with a time before the deadline it must be allowed. Do not leave a faked time set.
```

Done when: dev server runs, `npm test` and `npm run build` pass, the hook refuses a late faked commit and allows a normal one. Commit: `chore: scaffold vite react ts, add deadline guard hook`

## P02. Types and data loader

Track A. 10 min. Must.

```
Do phase P02. Read docs/implementation.md section 7.

Create src/engine/types.ts with the exact types from section 7 (Tier, Answer, StageId, Mode, Question, Rule, FiredRule, EvalResult) plus types for Stage, Config and the i18n dictionary (Record<string,string>).
Create src/engine/loadData.ts that imports src/data/rules.json, questions.json and config.json, casts them to the types, and exports one frozen `data` object { rules, questions, stages, modules, sources, config, tiers }. Export helper applicableQuestions(stage, enabledModules) that filters by stage and module and sorts by order. Module enablement defaults from config.feature_flags.newborn_module (false).
Do not change any JSON file or any id.
Add a tiny smoke test that applicableQuestions('pregnant') returns 11 questions, 'labour' returns 12, 'after_birth' returns 11 for the core module only. If the counts differ, STOP and tell me, do not edit the data to match.
```

Done when: typecheck passes and the smoke test passes. Commit: `feat(engine): types and typed data loader`

## P03. Rule engine

Track A. 15 min. Must.

```
Do phase P03. Read docs/implementation.md section 8 and src/data/rules.json (the "semantics" block).

Implement src/engine/evaluate.ts exporting evaluate(stage, answers, options?) where options = { modules?: string[], now?: () => string }.
Behaviour exactly as documented:
1. Applicable questions = stage and enabled modules.
2. Missing answers on applicable questions count as not_sure. Ignore answers to non-applicable questions.
3. Rule types single, all_of and count, as in the semantics block. count uses only yes answers.
4. Result tier is the highest fired tier, GREEN if none.
5. Return EvalResult: tier, fired (sorted RED first, then by rule id; each with rule_id, tier, question_ids, source_refs), flags (unique, sorted), stage, not_sure_ids, yes_ids, rules_version, evaluated_at.
Pure function. No console output, no I/O, no randomness, no network, no AI. Do not hard-code any rule id or question id in the engine; everything comes from the data.
Add JSDoc explaining the not_sure policy. Typecheck must pass. Do not write the full test suite yet (P04).
```

Done when: typecheck passes. Commit: `feat(engine): deterministic rule evaluator`

## P04. Engine and data tests

Track A. 15 min. Must.

```
Do phase P04. Read tests/rule_cases.json and tests/reference_check.py.

Create src/engine/evaluate.test.ts: load tests/rule_cases.json and run every case through evaluate(). Support default_answer, modules, answers, expect_tier, expect_rules_include, expect_rules_exclude, expect_no_rules, expect_flags. One test per case with the case id and title in the name. All 46 must pass.
Create src/engine/data.test.ts asserting:
- every rule references existing questions and existing source ids;
- every question is used by at least one rule;
- every rule has stages that exist;
- src/data/i18n/en.json and hi.json have identical key sets;
- every question has non-empty en, hi, short_en, short_hi;
- no helpline literal (108, 102, 112, 104, 14416, 181) appears as a standalone number in any file under src/ui or src/lib or src/state (a grep-style test using fs; src/data, tests and docs are allowed);
- tier_if values are valid tiers.
Run python3 tests/reference_check.py once and confirm it also reports 46 cases and 0 failures. If the TypeScript engine and the Python reference disagree on any case, find out why and tell me which one is wrong. Do not edit the test expectations to make tests pass without telling me.
```

Done when: 46 case tests and the integrity tests pass, and the Python reference agrees. Commit: `test(engine): 46 rule cases and data integrity tests`

## P05. Test report and prebuild gate

Track A. 10 min. Must.

```
Do phase P05. Read docs/implementation.md section 13.

Create scripts/run-rule-tests.mjs. It runs vitest (use the JSON reporter via the CLI) and writes src/generated/test-report.json with { passed, total, failed, rules_version, generated_at }. rules_version comes from src/data/rules.json. Exit non-zero if any test fails.
Wire package.json: "test:report": "node scripts/run-rule-tests.mjs" and "prebuild": "npm run test:report". The build must now fail when tests fail.
Commit the generated file. Add a src/generated/.gitkeep note in README stub: this file is build output and is committed on purpose because the Trust page reads it.
Verify: break one rule expectation temporarily, confirm npm run build fails, then restore it.
```

Done when: `npm run build` runs the tests first and the report file shows 46+ passed. Commit: `chore: test report generated at build, build gated on tests`

## P06. Fonts, tokens and base styles

Track B. 15 min. Must.

```
Do phase P06. Read docs/FRONTEND_DESIGN.md sections 2 and 3.

Install @fontsource/yatra-one and @fontsource/mukta. First check that both packages exist on npm. If one does not, tell me and fall back to system Devanagari fonts for that role.
Import only what we need: Yatra One 400 and Mukta 400, 600, 700, in the devanagari and latin subsets only (use the per-subset CSS files). No fonts from any CDN. No external requests at runtime.
Create src/ui/styles/tokens.css with the variables from FRONTEND_DESIGN section 3 exactly. Create src/ui/styles/base.css: reset, body background var(--chuna), color var(--ink), font family var(--font-body), html font-size 19px, line-height by lang, visible focus ring (3px haldi plus 2px ink offset), .visually-hidden, prefers-reduced-motion reset, touch-action manipulation, -webkit-tap-highlight-color transparent. Create an empty src/ui/styles/print.css. Import all three in main.tsx.
Replace the placeholder App with a type specimen showing the scale in Hindi and English (Yatra One verdict sample, Mukta body).
Check in the browser network panel that there are no requests to any external host.
```

Done when: fonts render in Hindi and English, zero external requests. Commit: `feat(ui): self-hosted fonts, design tokens, base styles`

## P07. Brand mark, wordmark and app icons

Track B. 15 min. Must.

```
Do phase P07. Read docs/FRONTEND_DESIGN.md sections 2 and 5 (brand mark).

Create src/ui/components/MaitriMark.tsx: two overlapping rounded arcs that form a lens (two hands meeting), one in nil indigo, one in haldi, 2.5px ink outline, scalable via a size prop. Create Wordmark.tsx: मैत्री in Yatra One with Maitri in Mukta 600 below. Both accept a compact prop.
Create public/icons/favicon.svg from the mark. Create scripts/make-icons.mjs using sharp (dev dependency) to render icon-192.png, icon-512.png and maskable-512.png (mark centred inside a safe zone of 80%, chuna background). Run it. If sharp will not install, hand-write the PNG sizes as SVG-only icons and tell me the PNG gap.
Show the mark and wordmark on the specimen page at 32px and 96px. Look at the rendered result and fix anything that looks unbalanced.
```

Done when: icons exist in public/icons and the mark is legible at 32 px. Commit: `feat(ui): maitri mark, wordmark and app icons`

## P08. Core components

Track B. 20 min. Must.

```
Do phase P08. Read docs/FRONTEND_DESIGN.md sections 2, 4 and 9.

Create components in src/ui/components with CSS Modules:
- Button: variants primary (nil fill, white text), answer (paper fill, 2.5px ink outline), ghost, danger (sindoor fill, white text). Heights 64 for answer, 56 otherwise. Radius var(--r-button). Pressed state shifts 1px, under 80ms. Loading and disabled states. Forwards aria props.
- ActionBar: sticky bottom container, respects env(safe-area-inset-bottom), holds buttons.
- Page: single column max-width 480px centred on the chuna background, gutters var(--gutter), min-height 100dvh, supports a fullBleed prop for the result screen.
- Header: MaitriMark compact, a slot for a ModeBadge, and a QuickExit button (48px minimum, takes onExit prop; label comes from a label prop for now).
Add unit tests: Button renders label, is disabled correctly, fires onClick, has an accessible name; ActionBar renders children.
Create src/ui/dev/Kit.tsx showing every variant and state. Render it from App when the URL has ?kit. Keep it out of the normal flow.
No hard-coded user-visible strings in components: pass labels in as props.
```

Done when: tests pass and the kit page shows all variants at 320 px width. Commit: `feat(ui): button, action bar, page and header components`

## P09. Pictograms, part 1

Track B. 25 min. Must.

```
Do phase P09. Read docs/FRONTEND_DESIGN.md section 5 and src/data/questions.json (the icon field of each question and stage).

Create src/ui/icons/ with one file per icon id and an index registry. Create the Pictogram component (props: id, size default 96, title optional) that renders inline SVG from the registry and falls back to a neutral placeholder (and logs a dev warning) for unknown ids.
Draw these as simple, bold, flat SVGs on a 96 x 96 viewBox: stage-pregnant, stage-labour, stage-after-birth, fits, bleeding, bleeding-cloth, head-eye, swelling, fever, discharge, water-leak.
Style rules: ink strokes 5px with round caps and joins, only two flat fills (nil indigo #23358A and haldi #F7B500) plus paper white, no gradients, no text, no photo-realism, culturally neutral figures (head circle and simple body shape). Each must read as one clear idea at 64px.
Add an icon gallery to the Kit page at 64px and 96px. Take a screenshot if you can (Playwright is not installed yet, so use any available browser tool or tell me to eyeball it). Tell me which icons you are least happy with.
```

Done when: 11 icons are registered and visible in the Kit gallery. Commit: `feat(ui): pictogram component and first 11 icons`

## P10. Pictograms, part 2

Track B. 25 min. Must.

```
Do phase P10. Continue from P09 using exactly the same style rules.

Draw: pale-weak, breathing, belly-pain, baby-moves, calf-pain, confused, clock-12, heavy-heart, baby-feed, baby-breath, baby-temp, baby-fit, baby-yellow, baby-cord, and three mode icons: mode-woman, mode-asha (a figure with a health bag), mode-family (two figures).
Add a unit test that every icon id used in src/data/questions.json (questions and stages) and the three mode icons exists in the registry.
Update the Kit gallery. Re-check legibility of all icons at 64px and in greyscale. Fix any two icons that look too similar to each other (for example bleeding versus water-leak, fever versus baby-temp) by changing silhouette, not colour.
```

Done when: registry test passes, all icons distinct at 64 px. Commit: `feat(ui): remaining pictograms and mode icons`

## P11. Signal components and contrast check

Track B. 20 min. Must.

```
Do phase P11. Read docs/FRONTEND_DESIGN.md sections 2, 4 and 9.

Create components: SignalShape (octagon for RED, triangle for AMBER, circle for GREEN; the tier word passed in as a prop is drawn inside in Yatra One; sized by prop; data-shape attribute for tests), ProgressDots (total, current, answered count, accessible text via a label prop), Sheet (bottom sheet, 28px top radius, focus trap, Escape closes, aria-modal), CallButton (a tel: link styled as a big button; props number and label; never defines a number itself), Chip.
Create scripts/check-contrast.mjs computing WCAG contrast ratios for these pairs and failing below 4.5 (3.0 for outlines and large text): white on #C4122F, white on #0F7A6B, #111B38 on #F7B500, white on #23358A, #111B38 on #E6EEF6, #4A5878 on #E6EEF6. Add npm script check:contrast. If any pair fails, adjust the token slightly and tell me.
Tests: SignalShape renders a different data-shape per tier and shows the tier word; ProgressDots exposes its text alternative; CallButton renders a tel: href from the number prop.
Add all of these to the Kit page.
```

Done when: tests pass and `npm run check:contrast` passes. Commit: `feat(ui): signal shape, progress dots, sheet, call button, contrast check`

## P12. i18n library

Track A. 15 min. Must.

```
Do phase P12.

Create src/lib/i18n.ts:
- t(key, params?) returns the string for the current language from src/data/i18n/{en,hi}.json, replacing {name} placeholders. Missing key in the current language falls back to English; missing everywhere returns the key and, in development only, warns once.
- A tiny store for the current language ('hi' | 'en', default 'hi') with subscribe/getSnapshot so React can use useSyncExternalStore, and a useLang() hook. Setting the language updates document.documentElement.lang.
- Helpers: questionText(q), questionShort(q), stageLabel(stage) that read the en/hi fields in questions.json by the current language.
Unit tests: placeholder substitution, fallback to English, language switch updates the html lang attribute, helpers return the Hindi text when language is hi.
Do not hard-code any user-visible string in code. All new copy goes into both JSON files.
```

Done when: tests pass. Commit: `feat(lib): i18n with hindi default and english fallback`

## P13. Config and helpline numbers library

Track A. 10 min. Must.

```
Do phase P13. Read src/data/config.json and docs/implementation.md sections 4 (D-11, D-12) and 12.

Create src/lib/config.ts exposing: getNumber(key) returning { number, label (by current language), status }, telHref(key), unconfirmedNumbers() (all numbers whose status is not confirmed), entitlement(lang), appInfo(), featureFlag(name).
Rules: numbers are only ever read from config.json. If a requested key is missing, throw in development and render nothing dangerous in production (return null; UI must hide the call button, not guess a number). Do not add the number 181.
Unit tests: telHref('ambulance_primary') matches config; unconfirmedNumbers excludes mental_health and includes the others; featureFlag works.
```

Done when: tests pass. Commit: `feat(lib): config and helpline number accessors`

## P14. Session state

Track A. 15 min. Must.

```
Do phase P14. Read docs/implementation.md sections 5, 10 and 12.

Create src/state/session.tsx: a React context with useReducer holding { mode, lang, stage, answers, index, startedAt }.
Actions: setMode, setStage (resets answers and index if the stage changes), answer(questionId, value), skip (records not_sure), next, back (moves back without losing answers), reset, clearAll.
clearAll wipes memory state, sessionStorage keys and localStorage keys that start with "maitri:". Mirror state to sessionStorage (key maitri:session) only for crash recovery within a tab and restore it on load. Never write anything to localStorage here.
Derived selector applicableQuestions for the current stage using the engine loader.
Unit tests: skip stores not_sure; back preserves earlier answers; changing stage resets answers; clearAll empties memory and storage; restore from sessionStorage works.
```

Done when: tests pass. Commit: `feat(state): session reducer with safe clear`

## P15. Routing shell and Exit now

Track A. 15 min. Must.

```
Do phase P15. Read docs/implementation.md sections 10 and 12.

Set up HashRouter with every route in the section 10 table as a placeholder screen: /, /mode, /stage, /q/:index, /result, /plan, /support, /about, /trust, /asha, /review. Wrap in the session provider. Add route guards: /q, /result and /plan redirect to / when there is no stage; /plan redirects to /result unless the result tier is RED (use a stub until P20).
Implement src/lib/exit.ts exitNow(): stop any audio (a stub hook until P26), clearAll(), then window.location.replace('about:blank').
Wire the Header QuickExit button on every screen to exitNow, label from i18n common.quick_exit.
Test with jsdom: exitNow clears state and calls location.replace (mock it). Test guards redirect.
Lazy-load /trust, /review and /asha routes.
```

Done when: you can click through every placeholder route and Exit now clears state. Commit: `feat: routing shell, route guards, exit now`

## P16. Language screen

Track B. 15 min. Must.

```
Do phase P16. Read docs/FRONTEND_DESIGN.md section 6 (Language).

Build the Language screen at /. MaitriMark and Wordmark at the top. A 12px patterned border band across the top: draw one simple repeating geometric motif as an inline SVG pattern in nil and haldi (it appears only here and on the slip, so make it a reusable component BorderBand).
Two very large buttons: "हिन्दी" and "English", each in its own script, each with a speaker icon slot (non-functional until P26). Hindi first. Tapping sets the language (updates html lang) and goes to /mode. Title uses lang.title. Add the app tagline under the wordmark.
Make sure it works at 320px and 360px without scroll. Check the greyscale and contrast. Header on this screen shows the Exit now button.
```

Done when: language choice persists to the next screens and `html lang` changes. Commit: `feat(ui): language screen`

## P17. Mode screen

Track B. 10 min. Must.

```
Do phase P17.

Build /mode: title mode.title, three large buttons with the mode-woman, mode-asha and mode-family pictograms and the strings mode.woman, mode.asha, mode.family. Selecting sets the mode and goes to /stage.
Header ModeBadge: small chip with the mode icon and short name. Tapping it opens a Sheet asking to change mode (strings from i18n; add any new keys to both language files and keep key parity). Changing mode keeps the stage and answers.
Add a component test that selecting each mode updates state and navigates.
```

Done when: test passes, mode badge visible on later screens. Commit: `feat(ui): mode screen and mode badge`

## P18. Stage screen

Track B. 10 min. Must.

```
Do phase P18.

Build /stage: title is stage.title for woman mode and stage.title_other for asha and family. Three large pictogram cards for pregnant, labour and after_birth using stage labels from questions.json in the current language. Selecting sets the stage (reset answers if it changed) and goes to /q/0.
Cards have the 2.5px outline because they are tappable. Minimum height 96px, 12px gap.
```

Done when: stage selection leads to the first question. Commit: `feat(ui): stage screen`

## P19. Question screen

Track B. 25 min. Must.

```
Do phase P19. Read docs/FRONTEND_DESIGN.md section 6 (Question) and the wireframe.

Build /q/:index. Use the applicable questions for the stage sorted by order. Layout per the wireframe: header, ProgressDots, a paper card with the Pictogram for the question icon, the question text in the current language (1.5rem, weight 600), and a slot for the Listen buttons (empty until P26). Bottom ActionBar: Yes and No side by side (answer variant, 64px), Not sure below (ghost, 56px), Back (ghost).
Behaviour: answering stores the answer and moves on; Not sure stores not_sure; skipping is the same as Not sure. Back returns to the previous question with its answer intact. After the last question go to /result. On the first question show the mode-specific intro line (question.intro_woman, intro_asha or intro_family). Question progress text uses question.progress.
Accessibility: move focus to the question text on each new question, announce progress through an aria-live region, make all buttons reachable by keyboard.
Component tests with Testing Library: full path through a stage stores answers; Back keeps answers; Not sure stores not_sure; invalid index redirects.
```

Done when: you can answer every question in all three stages in both languages and land on /result. Commit: `feat(ui): question flow`

## P20. Result logic

Track A. 15 min. Must.

```
Do phase P20. Read docs/implementation.md section 11.

Create src/state/useResult.ts: a hook that, on /result, calls evaluate(stage, answers) once (memoised), and returns { result, tier, headlineReason, reasons, yesLabels, unsureLabels, hasNotSure, hasWellbeingFlag, isRed, isAmber }.
headlineReason is the first fired rule's first question mapped to its short label in the current language. yesLabels and unsureLabels map ids to short labels. Redirect to / if there is no stage, and to /q/0 if there are no answers at all.
Replace the P15 stub so /plan is allowed only when the tier is RED.
Unit tests for three stages and tiers: after_birth heavy bleeding gives RED with the correct Hindi short label; pregnant baby moves less gives AMBER; pregnant all no gives GREEN; not sure sets hasNotSure; wellbeing sets hasWellbeingFlag.
No UI in this phase.
```

Done when: hook tests pass. Commit: `feat(state): result hook with reasons and flags`

## P21. Result signal wall

Track B. 25 min. Must.

```
Do phase P21. Read docs/FRONTEND_DESIGN.md sections 2, 6 (Result) and 7 (Motion), and docs/implementation.md section 11.

Build /result as the signal wall. Full-bleed page whose background is the tier colour (RED sindoor, AMBER haldi, GREEN calm teal) with text colour by tier (white on sindoor and calm, ink on haldi). Elements: Exit now (top right), a large SignalShape (about 60% of the width) with the tier word inside, the verdict in Yatra One at 2.8rem using t('result.TIER.title') or the _family variant in family mode, the action line using result.TIER.body with the ambulance number from config, and the "Because of" line with the headline reason (result.because). Show result.not_sure_note when hasNotSure. Show a wellbeing card linking to /support when the flag is set.
Buttons in the ActionBar: RED: big white CallButton (ambulance_primary), Open the go-now plan, Show this to the ASHA or doctor (slip). AMBER: CallButton, slip. GREEN: Check again (resets to /stage) and slip. Never show a call button if the number is missing. Show result.disclaimer_short at the bottom.
Motion: the one stamp moment only. Shape scales 1.15 to 1 over 220ms ease-out; call navigator.vibrate(200) once on RED if available. Respect prefers-reduced-motion (no scale). Nothing else animates.
Add aria-live="polite" to the verdict. Add a ?grayscale URL flag in development that applies filter: grayscale(1) so we can check the greyscale test.
Check all three tiers at 320px, with and without Hindi. Fix any text overflow.
```

Done when: all three tiers render correctly and read in greyscale. Commit: `feat(ui): result signal wall with stamp moment`

## P22. Go-now plan

Track B. 15 min. Must.

```
Do phase P22. Read docs/implementation.md section 11 (Go-now plan).

Build /plan, reachable only for RED. Title plan.title. Four steps on paper cards with large numerals (this content is a true sequence), using plan.step1 to plan.step4. Step 1 has the CallButton for ambulance_primary. Under the steps show plan.transport_line with the transport_pregnant number from config if present, and the JSSK entitlement text from config in the current language.
Each step has a tick control (local component state only). A pinned footer button opens /slip. Family mode wording is already in the strings.
Add a component test: renders four steps; the call link comes from config; the page redirects when the tier is not RED.
```

Done when: test passes and the RED path flows result to plan to slip. Commit: `feat(ui): go-now plan`

## P23. Slip screen and print

Track B. 20 min. Must.

```
Do phase P23. Read docs/implementation.md section 11 (Slip) and docs/FRONTEND_DESIGN.md section 6 (Slip).

Build /slip. White page, ink on white only. Content: BorderBand, MaitriMark and Wordmark, stage (stageLabel), the tier shape and word, "Signs told" (yes labels), "Not sure about" (unsure labels), date and time (use toLocaleString for the current language), the fired rule ids in small type, the footer slip.footer. No name field, no phone, no location, no ids of the person.
print.css: one page, A5 and A4 friendly, black and white safe (the shape and word carry the tier, not colour), hide the header, action bar and buttons when printing. A Print button calls window.print.
Test that the slip renders signs from a known answer set, contains no input fields, and includes the footer.
```

Done when: print preview fits on one page in black and white. Commit: `feat(ui): maitri slip with print styles`

## P24. Slip share as picture

Track B. 15 min. Must.

```
Do phase P24.

Install html-to-image. On /slip add a Share a picture of this slip button. It renders the slip node to a PNG (make sure the self-hosted fonts are included; wait for document.fonts.ready first), then calls navigator.share({ files }) when navigator.canShare allows it, else downloads the PNG. Use the slip.share string. On failure show a clear message that says what to do (use the Print button instead) using a new i18n key in both languages.
Keep the generated image under about 300KB. Test the helper (slip.ts) with a mocked toPng. Verify on desktop that it downloads a correct PNG with the Hindi text rendered.
```

Done when: a PNG downloads with correct fonts. Commit: `feat(ui): share slip as picture`

## P25. Support card and About

Track B. 15 min. Must.

```
Do phase P25. Read docs/FRONTEND_DESIGN.md section 6 (Support, About) and docs/implementation.md section 3.

Build /support: calm paper card on chuna, no tier colours, no shapes. Title wellbeing.title, body wellbeing.body, a CallButton for mental_health from config with wellbeing.call, then the danger line wellbeing.danger with emergency_general. Listen slot is empty until P26.
Build /about: safety.title, safety.not_diagnosis, safety.tiers_ours, safety.never_fine, safety.no_data, and safety.draft (show the draft line only while no rule has reviewed_by set). Links to /trust and a quiet link to /review. A Clear this check button calls clearAll and goes to /.
Make /about reachable from every screen header via a small info button (aria-label from i18n; add keys to both languages).
```

Done when: both screens render in both languages and the draft notice shows. Commit: `feat(ui): support card and about page`

## P26. Audio library and Listen button

Track A. 20 min. Must.

```
Do phase P26. Read docs/implementation.md section 9.

Create src/lib/audio.ts: play(id), stop(), isPlaying store, and a rate option (1 or 0.8 for slow). Clip URL is /audio/{lang}/{id}.mp3. Track a userHasInteracted flag set on the first pointer or key event; never start audio before it. Fallback chain: cached mp3; else speechSynthesis only if getVoices() contains a voice whose lang starts with the current language code; else return 'unavailable' so the UI shows common.audio_missing. Never assume voices exist.
Create the Listen component (Listen and Slow buttons, playing state, aria-pressed). Add it to Language, Mode, Stage, Question, Result, Plan and Support screens with these clip ids: lang_title, mode_title, stage ids (stage_pregnant, stage_labour, stage_after_birth), the question id, result_RED, result_AMBER, result_GREEN, plan_step1..plan_step4, wellbeing_body. Connect exitNow and every navigation to stop().
The question screen auto-plays its clip after the first user interaction. Missing clips must not break any screen.
Tests with a mocked Audio and speechSynthesis: no audio before interaction; fallback behaviour; stop on navigation.
```

Done when: tests pass and missing audio shows the friendly message. Commit: `feat(audio): audio playback library and listen button`

## P27. Audio generation script

Track A. 15 min. Must.

```
Do phase P27. Read docs/implementation.md section 9.

Create scripts/generate-audio.mjs. It builds the full clip list for hi and en from the data: every question, stage, result_RED/AMBER/GREEN (using the _body strings with the spoken number), plan_step1..4, wellbeing_body, intro_woman, intro_asha, intro_family, lang_title, mode_title (and newborn questions when the flag is on). It writes audio/manifest.json with { id, lang, text, chars }.
Spoken numbers: replace {number} with digit-by-digit speech (Hindi: एक शून्य आठ for 108; English: one zero eight), built from config.json, never hard-coded.
Default is dry-run: prints clip counts, total characters per language and an estimated cost at INR 30 per 10,000 characters (Sarvam Bulbul v3), and writes the manifest and audio/REVIEW.md (a checklist table with a reviewer initials column).
With --run it calls the TTS provider using SARVAM_API_KEY from the environment and writes public/audio/{lang}/{id}.mp3, skipping files that exist. BEFORE writing the API call, read the current Sarvam text-to-speech documentation at docs.sarvam.ai for the endpoint, model name, speaker and parameters. Do not guess them. If you cannot read the docs, keep dry-run working, put the provider call behind one clearly marked function with a TODO, and tell me. Never print, log or write the key. Use native Devanagari text for Hindi.
Add scripts: audio:plan (dry run), audio:generate (--run), audio:check (verifies every manifest file exists and totals the size).
```

Done when: `npm run audio:plan` prints counts and writes the manifest. Commit: `feat(audio): clip manifest and generation script`

## P28. Generate, review and wire audio

Track A and human. 30 min. Must.

```
Do phase P28. HUMAN FIRST: put SARVAM_API_KEY in your shell environment (never in a file), then run npm run audio:generate. If you do not have a key, skip generation and say so.

Then, Claude Code: run npm run audio:check and report missing clips by id and language, and the total size (target under 8MB for both languages). If a clip is missing or empty, re-run generation for only those ids. Ensure public/audio files are committed (they are plain assets). If no key was available, confirm the browser speech fallback behaves correctly for Hindi, show the unavailable message when no Hindi voice exists, and document in audio/REVIEW.md that clips are pending.
Update audio/REVIEW.md so each row can be signed off by a native Hindi speaker. Do not mark any row as reviewed yourself.
```

Done when: `npm run audio:check` passes, or lists exactly what is pending. Commit: `feat(audio): generated clips and review checklist`

## P29. PWA and offline

Track A. 20 min. Must.

```
Do phase P29. Read docs/implementation.md sections 5, 9 and 12.

Add vite-plugin-pwa (autoUpdate). Manifest: name Maitri, short_name Maitri, display standalone, start_url ./, scope ./, theme_color #23358A, background_color #E6EEF6, icons from public/icons including maskable. Precache the app shell, JSON data, fonts, icons and every audio file.
Show a small Ready to work without internet message (offline.ready) once the service worker has cached everything.
Add the CSP meta tag from section 12 to index.html. Confirm no runtime request leaves the origin.
Install @playwright/test for verification. Test: build, serve the preview, load the app, set the browser context offline, reload, and complete a full check including playing a clip (the audio element must load from cache). Report the result honestly. If something fails offline, fix it.
```

Done when: the full flow completes offline after the first load. Commit: `feat: pwa with offline precache and csp`

## P30. Trust page

Track B. 20 min. Must.

```
Do phase P30. Read docs/implementation.md section 13 and docs/FRONTEND_DESIGN.md section 6 (Trust).

Build /trust: plain labelled rows on paper cards. Show rule version (rules.json), tests passing from src/generated/test-report.json (for example 46 of 46, with a simple bar and the text, never colour alone), number of rules with reviewed_by set and the reviewer names (trust.reviewed_none when zero), the design disclosure (safety.tiers_ours), a sources list with links from rules.json sources and their confidence, and a table of every helpline number with its status text (trust.status_unverified or trust.status_confirmed) from config.
If the test report is missing, show Test report not available. Never show a made-up number.
Add a test that the page lists every number from config and shows the unconfirmed status for 108.
```

Done when: page renders in both languages with real data. Commit: `feat(ui): trust page with live test report and sources`

## P31. Deploy

Track A. 15 min. Must.

```
Do phase P31.

Add vercel.json with: build command npm run build, output dir dist, cache-control immutable for hashed assets and public/audio, and security headers (Content-Security-Policy matching the meta tag, X-Content-Type-Options nosniff, Referrer-Policy no-referrer, Permissions-Policy disabling camera, microphone, geolocation unless the QR scan feature is later enabled).
Document in README the deploy steps. HUMAN: create the GitHub repository (public), push, import it in Vercel, deploy. Do this BEFORE the deadline hook time; any push after the deadline disqualifies us.
After deploy: open the URL, confirm the PWA installs, goes offline after first load and passes a basic Lighthouse PWA check. Record the URL in README.
```

Done when: a live URL works offline after first load. Commit: `chore: vercel config and deploy notes`

## P32. Rule review page (Optional)

Track B. 20 min. Optional.

```
Do phase P32. Read docs/implementation.md section 2 (U6).

Build /review for the clinician. List every rule grouped by stage with its question text, tier, source link, confidence and note. For each rule: a Reviewed checkbox and a reviewer name field (local state only, nothing stored). A button exports a copy of rules.json with reviewed_by filled in for ticked rules, as a download. Add review.* strings in both languages.
Document in README how the team applies an export: replace src/data/rules.json, run npm test, commit, redeploy. No network calls. Test that the export contains the typed reviewer name for ticked rules and keeps every other field unchanged.
```

Done when: export works and the diff against rules.json shows only reviewed_by changes. Commit: `feat(ui): clinician rule review page`

## P33. ASHA mode list (Optional)

Track B. 25 min. Optional.

```
Do phase P33. Read docs/implementation.md section 2 (U7) and section 12.

In ASHA mode only, add a setting "Save checks on this phone", default OFF. When ON, after each result store a minimal record in localStorage under keys starting with "maitri:" : { id (random), stage, tier, yes_ids count, ts }. No names, no phone numbers, no locations, no answers detail.
Build /asha: list of saved checks sorted by tier (RED first) then newest, each showing stage, tier shape and word, time. Buttons: Check the next woman (resets to /stage), delete one, clear all. Show asha.list_note. Exit now and Clear this check also remove these records.
Tests: nothing is stored when the setting is off; records contain no personal fields; ordering is correct; clearAll removes them.
```

Done when: tests pass and nothing persists with the toggle off. Commit: `feat(ui): asha mode on-device list`

## P34. Accessibility pass

Track B. 25 min. Must.

```
Do phase P34. Read docs/FRONTEND_DESIGN.md section 9.

Run axe (install @axe-core/playwright) on every screen in Hindi and English at 360px and 320px. Fix every critical and serious issue. Check by script that all interactive elements are at least 48px and answer buttons at least 64px tall. Re-run npm run check:contrast. Verify: visible focus on every control, keyboard-only completion of a check, html lang updates, one h1 per screen, aria-live on the verdict, 200% zoom with no horizontal scroll, prefers-reduced-motion disables the stamp.
Take a greyscale screenshot of each result and confirm the tier still reads from shape and word. Write docs/A11Y_REPORT.md listing what was checked, what failed, what was fixed and what remains.
```

Done when: no critical or serious axe issues and the report is committed. Commit: `fix(a11y): accessibility pass and report`

## P35. End-to-end tests and performance (Optional)

Track A. 25 min. Optional.

```
Do phase P35.

Write Playwright tests for: (1) Hindi, family mode, after birth, heavy bleeding yes, expect RED result, open the plan, open the slip; (2) pregnant, baby moving less yes, expect AMBER; (3) after birth, all no, expect the calm result and never the word fine; (4) offline run of flow 1 after a first load; (5) Exit now clears state and leaves the app.
Add a bundle size check script: JS gzipped under 250KB excluding audio; report current size. Run a throttled CPU (4x) check and report load and interaction timings. Fix anything over budget (lazy load, trim fonts). Add npm run e2e.
```

Done when: all e2e tests pass and the bundle is within budget. Commit: `test(e2e): playwright flows and bundle budget`

## P36. Device QA and polish

All tracks. 45 min. Must.

```
Do phase P36. HUMAN FIRST: on a real, low-end Android phone, run the checklist in docs/implementation.md section 15 (full flow in Hindi in airplane mode with audio, install as PWA, three modes, RED/AMBER/GREEN, print and share the slip, Exit now, bright-sun readability). Paste your list of problems below.

PROBLEMS FOUND: <paste here>

Claude Code: fix each problem. Copy changes only through the i18n files and keep Hindi and English in parity. If the human has confirmed helpline numbers for the demo state, update config.json status for those numbers to "confirmed_by_team" with the source. If a clinician reviewed rules, set reviewed_by on the rules they confirmed (name as given). Never invent a reviewer. Never mark anything confirmed that the human did not confirm.
Re-run npm test, npm run build, npm run check:contrast, and the e2e tests if present.
```

Done when: every reported issue is fixed or explicitly deferred. Commit: `fix: device qa fixes and confirmed statuses`

## P37. README, demo, slides and freeze

All tracks. 30 min. Must.

```
Do phase P37. Read docs/implementation.md sections 14, 17, 18 and 19, and docs/PITCH_FACTS.md.

1. README.md: what Maitri is and who it is for; the USPs; how to run, test and build; folder structure; the deadline guard and rule review process; honest limitations (use section 19); evidence labels and where the statistics come from; Credits: list every third-party library, font (Yatra One, Mukta, with licences), TTS provider and data source, and the MCP card, HBNC leaflet, WHO guide and JSSK documents the rules are based on; the live URL.
2. docs/DEMO_SCRIPT.md: the final three-minute script from section 17 with exact taps and spoken lines, plus a backup plan if audio or the network fails.
3. docs/PPT_OUTLINE.md: slide-by-slide outline (problem with the six facts and their labels, the solution, the five demo USPs, how it works and the rule engine, evidence and honest claims, safety and limits, roadmap with clinician review and ASHA field test) and a mapping of each slide to the judging rubric.
4. Final checklist: tests green, build green, README complete, live URL works offline, repo public, history intact, no secrets committed (check git log and .env), all statistics on slides carry their labels, no unconfirmed number presented as confirmed.
5. Make the final commit and tag v1-submission BEFORE 20:15 IST. After that, do not commit, push, rebase or amend. Print the exact submission checklist for the human: repository link, PPT, demo video, due 21:00 IST.
```

Done when: README, demo script and slide outline are committed and the tag exists. Commit: `docs: readme, demo script, slide outline; tag v1-submission`

---

## If you fall behind

Drop in this order: P35, P33, P32. Never drop P05 (test gate), P21 (result), P22 (plan), P23 (slip), P26-P29 (audio and offline), P30 (Trust page), P34 (accessibility) or P36 (device QA). If P28 is blocked by the TTS key, ship with the browser fallback plus the "audio not available" message, and say so honestly in the demo. If time is under two hours at P21, skip P24 and P25's Support polish but keep the safety About page.

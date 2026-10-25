# Maitri frontend design brief

Read `docs/implementation.md` first for behaviour, routes and data. This file covers how Maitri looks, sounds and feels. Build exactly this. Do not substitute a default look.

## 1. Who and where

Users are pregnant and postpartum women, their families and ASHAs. Many read little. Many use a cheap Android phone in bright sun, in a crowded room, or in a crisis. The screen has one job: make the next action obvious in under five seconds. Test every decision against "a frightened family member glances at this for two seconds".

## 2. Concept: the village wall

Maitri borrows from **painted health walls and ASHA signage** in Indian villages: limewashed surface, flat bold colour, thick dark outlines, big pictures, hand-lettered headlines. It is warm, direct and sign-like. It is not a pastel femtech app, not a hospital portal, and not a SaaS dashboard.

Spend the boldness in **one place: the result screen**, the "signal wall". Everything else stays quiet, plain and large.

### Design plan (reviewed against defaults)

**Colour (named, flat, no gradients)**

| Name | Hex | Role |
|---|---|---|
| Chuna sky | `#E6EEF6` | Page background, the limewash wall |
| Paper | `#FFFFFF` | Question card, slip |
| Nil indigo | `#23358A` | Brand, primary buttons, links |
| Ink | `#111B38` | Text and outlines |
| Sindoor | `#C4122F` | RED tier (white text) |
| Haldi | `#F7B500` | AMBER tier (ink text only, never white) |
| Calm teal | `#0F7A6B` | GREEN-style tier (white text) |
| Muted ink | `#4A5878` | Secondary text |

Brand indigo is deliberately different from the three tier colours so a button is never mistaken for an alert.

**Type.** Two families, clearly distinct, both self-hosted, Devanagari plus Latin.
- **Yatra One** for the verdict, screen titles and the wordmark. It has the hand-lettered, painted-sign feel, and it supports Devanagari and Latin.
- **Mukta** (400, 600, 700) for everything else. It is highly legible in Devanagari at small sizes.
- Scale (rem, base 19px): 0.85 / 1 / 1.2 / 1.5 (question text, weight 600) / 2.1 (screen title) / 2.8 (verdict). Devanagari line-height 1.5 to 1.6; Latin 1.4. Keep lines under 32 characters in Hindi where possible. Left aligned everywhere except the verdict, which is left aligned too. Never centre paragraphs.
- Never use all caps. Never put a small label above a heading. Never accent a single word in a headline.

**Layout.** Single column, mobile first at 360 px, thumb-zone design: content on top, **all actions anchored to the bottom** in a sticky action bar. On wide screens, centre a 480 px column on the chuna background; the result screen stays full-bleed.

Structure encodes meaning, not decoration: a **thick ink outline (2.5 px) means "you can tap this"**. Content areas have no outline. Three corner radii by role: buttons 14 px, bottom sheets 28 px on top corners, chips fully round. Cards are flat with no shadow, because the outline already separates them.

```
Question screen (360 x 640)
+------------------------------------+
| [mark] Maitri      [mode]  [Exit now]|  <- header, 56px
|  o o o o o o o o o o o o            |  <- progress dots (answered = filled)
|                                      |
|   +--------------------------+       |
|   |        [pictogram]        |      |  <- 120px pictogram, paper card
|   +--------------------------+       |
|                                      |
|  बहुत तेज़ सिरदर्द, या आँखों के        |  <- 1.5rem, weight 600
|  आगे धुंधला दिखना?                   |
|                                      |
|  [ Listen ]            [ Slow ]      |  <- 56px, outlined
|======================================|
|  [   हाँ   ]      [   नहीं   ]        |  <- 64px, thumb zone
|        [ पक्का नहीं पता ]             |  <- 56px text button
|  [ पीछे ]                             |
+------------------------------------+

Result screen (full-bleed signal wall)
+------------------------------------+
|                         [Exit now]  |
|        ______                        |
|       /      \     giant shape       |
|      |  RED   |    (octagon)         |
|       \______/                       |
|                                      |
|  अभी अस्पताल जाइए                    |  <- Yatra One, 2.8rem
|  एम्बुलेंस के लिए 108 पर कॉल कीजिए।   |
|  कारण: बहुत ज़्यादा खून              |
|======================================|
|  [  108 पर कॉल करें  ]  (white, huge)|
|  [ अभी की योजना खोलिए ]              |
|  [ यह आशा या डॉक्टर को दिखाइए ]       |
+------------------------------------+
```

**Principles**
1. The tier is carried by **word, shape, colour and audio together**. A greyscale screenshot must still read. Shapes: RED octagon, AMBER triangle, GREEN circle.
2. One idea per screen. One question per screen.
3. The picture comes before the words. The words match the audio exactly.
4. Quiet everywhere except the result.
5. No decoration that does not help understanding.

**What was rejected and why.** Cream background with a serif and a clay accent (generic, and wrong for sun-glare legibility). Pastel pink or lavender femtech look (cliché, and tier colours would fight it). Soft grey shadow cards and gradient washes (SaaS kit). Neon accent on dark (wrong mood for a family in crisis). Eyebrow labels, middle-dot strings, arrow glyphs on buttons.

## 3. Tokens (paste into `src/ui/styles/tokens.css`)

```css
:root {
  --chuna: #E6EEF6; --paper: #FFFFFF; --nil: #23358A; --ink: #111B38; --muted: #4A5878;
  --sindoor: #C4122F; --haldi: #F7B500; --calm: #0F7A6B;
  --outline: 2.5px solid var(--ink);
  --r-button: 14px; --r-sheet: 28px; --r-chip: 999px;
  --font-display: 'Yatra One', 'Noto Sans Devanagari', system-ui, sans-serif;
  --font-body: 'Mukta', 'Noto Sans Devanagari', system-ui, sans-serif;
  --step--1: 0.85rem; --step-0: 1rem; --step-1: 1.2rem; --step-2: 1.5rem; --step-3: 2.1rem; --step-4: 2.8rem;
  --tap-min: 56px; --tap-main: 64px; --gutter: 16px;
}
html { font-size: 19px; }
html[lang="hi"] body { line-height: 1.55; }
html[lang="en"] body { line-height: 1.4; }
```

Dark mode: not required. The app is used in sun; do not ship a dark theme.

## 4. Components

| Component | Spec |
|---|---|
| `Button` | Variants: `primary` (nil fill, white text), `answer` (paper fill, ink outline), `ghost` (text only), `danger` (sindoor fill, white text, result only). Height 64 (answers) or 56. Full width in the action bar. Pressed state: translateY(1px), no animation longer than 80 ms. Visible focus ring: 3 px haldi plus 2 px ink offset. |
| `Pictogram` | 96 x 96 viewBox inline SVG. Ink strokes 5 px, round caps. Two flat fills only: nil and haldi. No gradients, no faces with detail, no skin-tone claims. One component, one file per icon id. |
| `SignalShape` | Octagon (RED), triangle (AMBER), circle (GREEN), with the tier word inside in Yatra One. Greyscale-safe. Sized to ~60% of screen width on the result screen. |
| `ProgressDots` | One dot per question. Filled = answered. Current = ringed. Includes a text alternative "Question 3 of 12". |
| `Listen` | Two buttons: Listen (plays the cached clip) and Slow. Shows a clear playing state. If audio is missing, shows `common.audio_missing`. |
| `CallButton` | Large, full width, `tel:` link, label from `common.call` with the number from config. Never hard-code. |
| `QuickExit` | Always in the header, 48 px minimum, label "Exit now" (Hindi: "अभी बाहर निकलें"). Calls `exit()`. |
| `ModeBadge` | Small chip in the header showing the current mode with its icon. Tap to change mode (confirm). |
| `Sheet` | Bottom sheet, 28 px top radius, used for the About links and the Wellbeing card. |
| `ActionBar` | Sticky bottom container holding the actions for the screen. Respects `env(safe-area-inset-bottom)`. |

## 5. Pictograms (one SVG per id, hand-built, simple geometry)

Style: bold, flat, readable at 64 px, no text inside, culturally neutral figures (a head circle and a simple body shape; no stereotyped clothing). Draw each as a clear single idea.

`stage-pregnant` (figure with round belly), `stage-labour` (figure with belly and pain lines), `stage-after-birth` (figure holding a small bundle), `fits` (figure with zigzag shake lines), `bleeding` (drop), `bleeding-cloth` (cloth with drops and a clock), `head-eye` (head with an eye and a spark), `swelling` (round puffy hand), `fever` (thermometer with heat lines), `discharge` (drop with wavy smell lines), `water-leak` (belly outline with drops), `pale-weak` (drooping figure, pale fill), `breathing` (chest outline with short wind lines), `belly-pain` (belly outline with spikes), `baby-moves` (belly with a small bump and arrows), `calf-pain` (lower leg with a flash), `confused` (head with a swirl), `clock-12` (clock showing a 12 hour sweep), `heavy-heart` (heart carrying a weight), and for the newborn module `baby-feed`, `baby-breath`, `baby-temp`, `baby-fit`, `baby-yellow`, `baby-cord`.

Brand mark: two overlapping rounded arcs forming a lens (two hands meeting), nil and haldi, 32 px in the header. Wordmark: मैत्री in Yatra One with "Maitri" in Mukta 600 below.

## 6. Screens

1. **Language.** The first thing seen. Mark and wordmark at the top. Two very large buttons: "हिन्दी" and "English", each with a speaker icon that plays the name. One 12 px patterned border band (a simple repeating geometric motif, drawn in SVG) runs across the top. This band appears only here and on the slip.
2. **Mode.** Three large buttons with pictograms (woman, ASHA with bag, family). Title spoken.
3. **Stage.** Three large pictogram cards. Title changes by mode.
4. **Question.** As in the wireframe. On entry, if audio is on and the user has tapped before, play the clip. Answers Yes and No sit side by side; "Not sure" is below. Back is a ghost button.
5. **Result.** Signal wall. Page background becomes the tier colour. Text colour by tier (white on sindoor and calm, ink on haldi). Elements as in the wireframe. For RED the primary button is the white call button. For AMBER it is the call button in white plus the slip. For GREEN there is no call button, but a go-if-worse line and a "Check again" button.
6. **Go-now plan.** Paper cards on chuna. Four steps with large numerals (this really is a sequence). Step 1 has the call button. Steps have a tick control. A pinned footer button opens the slip.
7. **Slip.** White page, ink on white only. Mark, border band, stage, the tier shape and word, the signs told, the signs unsure, time, rule ids in small type, footer. A4 and A5 print styles, one page. Looks good as a shared picture.
8. **Support (wellbeing).** Calm, quiet card. Title "You are not alone". Body, then a call button for 14416, then a danger line with 112. No tier colours. No shapes.
9. **About, Trust, ASHA list, Rule review.** Plain, paper cards on chuna, no flourish. The Trust page uses simple labelled rows and a progress bar for tests passing (for example 46 of 46). Unconfirmed numbers show a clear text status, never colour alone.

## 7. Motion

Only two moments.
1. **The stamp.** On the result screen, the shape scales from 1.15 to 1 over 220 ms ease-out and the tier colour fills the screen. On RED, call `navigator.vibrate(200)` once if available.
2. **Press feedback** on buttons (1 px shift, under 80 ms).
Everything else is instant. No page transitions, no hover effects, no scroll animations. Respect `prefers-reduced-motion`: no scale, no fade, vibrate allowed.

## 8. Copy rules

- Use the strings in `src/data/i18n/*.json` exactly. Do not invent new copy in components. If a new string is needed, add it to both language files.
- Sentence case. Plain verbs first. Under 12 words per sentence. One idea per sentence.
- A button names exactly what happens: "Open the go-now plan", "Print this slip". The toast or next screen uses the same words.
- Errors say what happened and what to do. They never apologise and never blame.
- Audio text equals screen text. Numbers are digits on screen and spoken digit by digit in audio.
- Never use medical jargon on the question screens. Allowed on the Trust and Rule review pages.

## 9. Accessibility floor

- Targets 56 px or more; answer buttons 64 px. Spacing at least 12 px between targets.
- Text contrast 4.5:1 or better, large text and UI outlines 3:1. Verify each tier pair: white on sindoor, white on calm, ink on haldi.
- Colour is never the only signal: tier = word + shape + colour + audio.
- Visible focus on every control. Full keyboard navigation. `lang="hi"` or `lang="en"` on `<html>`, updated on language change.
- Semantic headings, one `<h1>` per screen, `aria-live="polite"` on the result announcement.
- Respect user font size (all sizes in rem). Works at 200% zoom and 320 px width with no horizontal scroll.
- Audio never starts before a user gesture.

## 10. Performance (cheap phones)

- No images except inline SVG. Bundle under about 250 KB JS gzipped excluding audio. Self-host only the needed font subsets and weights.
- Lazy-load the Trust, Review and ASHA routes. Preload the current screen's audio only.
- Test on a throttled CPU (4x slowdown) and a real budget phone.

## 11. Definition of done for the UI

- Every screen implemented in Hindi and English with no layout break at 320 px.
- A greyscale screenshot of each result reads correctly.
- Result screen has the stamp moment, and nothing else on the page animates.
- No component contains a hard-coded helpline number or an invented string.
- A person who has never seen the app can complete a check in under two minutes with audio, without reading English.

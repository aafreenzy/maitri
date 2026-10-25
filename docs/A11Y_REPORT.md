# Accessibility and layout report

Checked on 25 Oct 2026 with axe-core (WCAG 2.0 A and AA, 2.1 AA, best practices) in Chromium on every screen in Hindi at 360 px, English at 360 px and Hindi at 320 px, plus scripts that measure target sizes, horizontal overflow, clipped text and hidden actions.

**Found and fixed**
- Action bars were outside any landmark. They are now `footer` regions.
- The slip page's scrolling area could not be reached by keyboard. It is now focusable.
- The Trust page progress bar had no name. It has one now.
- The action bar used to cover page text. It is now part of the layout and the page scrolls above it.
- **Clipped button text on short screens.** The page body is a scrolling column, and items with a minimum height were squeezed below their own content when the screen was short. Hit: the Support call button, "Speak instead of tapping" and "For doctors: review the rules" at 320 px. Fixed with one rule (`.page-body > * { flex-shrink: 0 }`).
- **Text in the wrong language.** A test renders every screen in Hindi and in English and fails on English words in Hindi (or Hindi text in English), including accessibility labels. It found the Trust and Review pages showing an English status sentence, raw confidence codes, English tier words and unmarked document titles. All fixed. Identifiers and document titles are marked (`translate="no"`, `lang="en"`) so they are excluded on purpose.

**Small-screen audit** (320x568, 360x640, 360x740, 412x915, Hindi and English, 15 screens): no horizontal overflow, no clipped or off-screen text, no button text clipped, the action bar always on screen, and the RED call link visible without scrolling. The smallest visible content area above the action bar was 250 px (the RED result at 320x568), which scrolls.

**Result after fixes:** no critical, serious or moderate axe findings, and all buttons and links at least 47 px tall.

**Remaining**
- Checkbox inputs are drawn 28 px square. The label around each one is 56 px tall and is the tap target.
- Colour contrast pairs pass 4.5:1 (`npm run check:contrast`).
- Not done: a test with a screen reader on a real phone, 200% zoom on a device, a run on a real low-end Android phone, and a test with real users. The greyscale view of each result was checked by eye on screenshots only.

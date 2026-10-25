# Accessibility report

Checked on 25 Oct 2026 with axe-core (WCAG 2.0 A and AA, 2.1 AA, best practices) in Chromium on every screen in Hindi at 360 px, English at 360 px and Hindi at 320 px, plus a script that measures target sizes and horizontal overflow.

**Found and fixed**
- Action bars were outside any landmark. They are now `footer` regions.
- The slip page's scrolling area could not be reached by keyboard. It is now focusable.
- The Trust page progress bar had no name. It has one now.
- The action bar used to cover page text. It is now part of the layout and the page scrolls above it.

**Result after fixes:** no critical, serious or moderate axe findings, no horizontal overflow at 320 px, and all buttons and links at least 47 px tall.

**Remaining**
- Checkbox inputs are drawn 28 px square. The label around each one is 56 px tall and is the tap target.
- Colour contrast pairs pass 4.5:1 (`npm run check:contrast`).
- Not done: a test with a screen reader on a real phone, 200% zoom on a device, and a test with real users. The greyscale view of each result was checked by eye on screenshots only.

# Maitri: the story script

**Team Decyphers** · Aafreen Khan (team leader) · Aastha Pandya · Prisha Sharma
recHERsion 2026 · Problem Statement 1, Women's Healthcare

Speak slowly. Pause where it says *(pause)*. The deck has 19 slides and the script follows them in order. Full run: about 6 minutes. A 90-second cut is at the end.

---

## Slide 1. The hook

*(Stand still. Do not start with your name.)*

"It is 11:40 at night. A woman, nine months pregnant, has a headache that will not go away. Her vision is blurry. Her husband is asleep, her mother-in-law says it is nothing, and the ASHA lives two villages away.

*(pause)*

Nobody in that room knows if this is nothing, or if it is the one night that matters.

We are Team Decyphers. This is Maitri. Maitri means friendship, and tonight, it is the friend who answers."

## Slide 2. The moment

"Look closely at that scene. It is an illustration, not a real case, but every ASHA in this room has seen it. The danger is not that nobody cares. The danger is that nobody can tell, quickly, which night is the emergency."

## Slide 3. The problem

"Here is what we know, and how sure we are.

India records about 25.2 million births a year. That figure is well sourced. A widely quoted study found that in nearly half of cases there was a delay in deciding to seek care. We label that as a single verified study, not a national fact. And roughly one in three, we derived ourselves, and we say so.

The pattern is three delays. The family delays *deciding*. They delay *reaching*. They delay *receiving* care. Maitri attacks the first delay, the one that costs minutes before anyone has even picked up a phone."

## Slide 4. Why today's options fail

"We looked at what a family has tonight.

A paper card is good, but nobody reads a card at midnight, and it is not in her language when she is panicking. A helpline works, but she needs to know she should call, and the line may be busy. A symptom chatbot asks her to type, needs data, stores her words, and, worst, may guess.

*(pause)*

That table is our own assessment, and we say so on the slide. Nothing on it is a ranking of anyone's work. It is the gap we saw."

## Slide 5. Who it is for

"Three people: the pregnant woman, the family around her, and the ASHA or ANM who serves dozens of families. Only the market-size number on this slide is from a source. The rest of the sizing is our estimate, marked as an estimate."

## Slide 6. Meet Maitri

"Maitri is a danger-sign checker. It does not diagnose. It does one thing: it tells the family what to do in the next ten minutes, and it shows exactly why.

Five things make it different. Remember these five. They are our USPs."

## Slides 7 to 11. The same night, with Maitri

*(Speed up slightly. This is the payoff. Replay the 11:40 scene.)*

**1. Speak and listen (slide 7).** "She does not type. She taps the microphone and says it in Hindi: *sir dard, aankhon ke saamne dhundhla*. Maitri turns her words into the same answers the buttons would give. She sees what it understood and can remove anything wrong. And it can read every question aloud, slowly. Honest note: voice needs a phone browser that supports it, and read-aloud uses the phone's own Hindi voice, because we have not shipped recorded clips yet."

**2. The call comes first (slide 8).** "The moment one danger sign is told, the check stops. No more questions. The biggest thing on the screen is the call button. Not a report. Not a score. A call."

**3. It shows its work (slide 9).** "Tap *Why this result* and she sees the rule, its source, and a line that says no AI decided this. The verdict is a fixed rule table. Same answers, same result, every time. If she says *not sure*, the result goes up, never down."

**4. Panic to plan (slide 10).** "After RED, a go-now plan: call, decide who goes, take the slip, ask about free transport. A one-page slip with the signs, the time and the result, with no name and no phone number. The family hands it to the nurse."

**5. Private, offline, for everyone (slide 11).** "Works offline after one visit. Nothing leaves the phone. One tap on *Exit now* wipes it all and leaves the app, for a shared phone. And the result reads in greyscale, because the word, the shape and the colour all say the same thing."

## Slide 12. See it work

"Scan this. It opens the project. The demo video's voice part uses a simulated recogniser, and the video says so. We would rather lose a point than mislead you."

## Slide 13. How it is built

"React and TypeScript, a hand-written offline service worker, no tracking, no analytics. An optional Supabase backend for a daily log and sign-in, off unless configured. The emergency check never touches it."

## Slide 14. Built to be trusted

"This is the slide we are proudest of, and it is mostly numbers about how we try to be wrong less. 205 automated tests. 46 clinical rule cases. 12,420 generated answer combinations checked against a second implementation written independently in Python. 15 safety properties.

*(pause)*

And the number we want you to remember: **zero** clinician reviews. The rules are a draft built from MoHFW and WHO material. We say it on the Trust page inside the app. A tool for pregnant women that hides its limits is dangerous. One that lists them is a start."

## Slide 15. Feasibility and roadmap

"What works today. What needs a field test. What is not done. In that order, on one slide. Next: clinician review, a pilot with ASHAs, recorded Hindi audio, then more languages."

## Slide 16. Sustainability

"Maitri is free to the woman, always. It is sustained through partnerships with state health programmes and NGOs who want ASHA tools. We have not signed anyone. This is a plan, not a deal."

## Slide 17. What broke, what we learned

"The voice demo cannot be real in a headless browser, so we simulated it and labelled it. Our first Hindi strings needed a native speaker. A test caught a screen that hid its own title. Every one of those made the product more honest."

## Slide 18. The close: the bang

*(Slow down. Look up from the notes.)*

"Go back to 11:40.

The headache. The blurry vision. The room full of people who do not know.

*(pause)*

With Maitri, she says four words into her phone. In under a minute, the screen turns red, the biggest button says *call*, and the family is already moving.

*(pause)*

**Every minute counts.**

**Maitri makes the next one clear.**

*(pause)*

We are not asking you to believe it is perfect. We are asking for three things to make it real: **a clinician reviewer** to sign the rules, **one ASHA district** to pilot it, and **language partners** to take it beyond Hindi and English.

We are Team Decyphers. Thank you."

## Slide 19. Sources

*(Do not read. Leave it up during questions.)*

---

## 90-second cut

1. Hook, 20 seconds: the 11:40 scene, "nobody in that room knows if this is nothing."
2. Gap, 15 seconds: "Cards are not read at midnight. Chatbots guess. Helplines need her to know she should call."
3. Five USPs, 30 seconds: "Speak it, hear it. The call comes first. It shows its work. Panic to plan. Private, offline, for everyone."
4. Trust, 10 seconds: "205 tests, 12,420 checked combinations, and zero clinician reviews, which we tell you ourselves."
5. Bang, 15 seconds: "Every minute counts. Maitri makes the next one clear. We need a clinician, an ASHA district and language partners."

## Delivery cues

- Do not read slides aloud. Speak the story; let the slide carry the facts.
- Never say "fine", "safe", "diagnose" or "AI decides". Say "no danger sign told", "tells the family what to do next", "fixed rules".
- If asked about the stats, say which are verified, derived or estimated. They are labelled in `docs/PITCH_FACTS.md`.

## Likely judge questions, honest answers

- **Is it clinically validated?** "No. The rules come from MoHFW and WHO material and the tests prove the code matches the table. A clinician has not reviewed it yet. That is our first ask."
- **Does voice work offline?** "No. Browser speech recognition needs internet. The tap path works fully offline."
- **Is the backend live?** "It is built and tested against a local Postgres. It is not connected to a real project yet and the check works without it."
- **Why not Bhashini?** "We do not use it today. It is a candidate for recorded Hindi audio and more languages."
- **Why not AI to decide?** "A wrong guess is a missed emergency. A fixed table can be audited line by line."

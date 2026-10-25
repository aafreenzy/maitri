# Maitri: the speaking script

For the final deck (10 slides) and the live demo. About 3 minutes 15 seconds at a calm pace. Say it in your own words, but keep the numbers and the honest lines exactly as written. Lines in *italics* are things to do, not to say.

**Rules for delivery**
- Slow down on the three numbers and on the honest limits. Judges remember both.
- Never say "fine", "safe", "accurate", "validated" or "lives saved". Say "No danger sign told" and "built around the decision delay".
- If something fails, say "that is why the tap check needs no internet" and carry on.

---

## Slide 1: Hook and title (0:00 to 0:20)

> "A woman has just given birth. The bleeding will not stop. Her family has minutes, and nobody knows whether to wait or go.
>
> This is Maitri. Maitri means friendship. It is the friend who tells the family what to do now, and shows exactly why.
>
> We are Team Maitri, and this is our answer to the Women's Healthcare problem statement."

*Point at the red result on the slide, then move on.*

## Slide 2: The problem (0:20 to 0:45)

> "About 25.2 million babies are born in India every year. Most births happen in a health facility, so contact is not the gap.
>
> The gap is the decision. In one Indian hospital study, 48.6 percent of maternal deaths involved a delay in deciding or seeking care. That is one study, not a national number, and we say so.
>
> And about one in three women still has fewer than four antenatal visits.
>
> What exists today does not help in the moment. A card has one level and no plan. Chatbots need typing and signal, hide their logic, and some say 'you are fine'. A helpline needs a phone and a clear head."

*Pause after "deciding or seeking care".*

## Slide 3: Who uses it first (0:45 to 1:05)

> "Three people use Maitri: the woman, the ASHA or ANM, and the family member who decides.
>
> About 36 percent of women do not own a phone, so the ASHA and family modes come first.
>
> For the market we only quote a number we can source: 25.2 million births a year. We have not invented the smaller slices. They are marked 'to be sized' until we have state data and a district health mission."

## Slide 4: The solution (1:05 to 1:25)

> "Say it. See why. Know what to do.
>
> Maitri is an offline, Hindi-first checker. You speak or tap. One RED sign stops the check and shows the call button. Every verdict names its sign and its source. It works offline. And it is private: no account is needed, and Exit Now clears everything."

## Slide 5: Live demo (1:25 to 2:10)

*Open the app on a phone or the live link. Keep the demo video ready as a backup.*

> "This is the real app. The emergency call is the first thing on the screen, so nobody in a crisis has to start a check first."

*Tap "Speak instead of tapping" and the big microphone.*

> "I say: the baby is born and there is heavy bleeding. Maitri shows what it heard and the sign it found. She can remove a wrong one. I continue."

*Tap Continue. The RED screen appears.*

> "One RED sign ends the check. Large call button. Now the part we are proudest of."

*Tap "Why this result?"*

> "It shows the rule, the sign, the source and the rule version, and it says no AI decides this. It is a fixed rule list, tested and re-checked by a second program.
>
> Then the go-now plan for the family, and a slip the ASHA can read instead of asking again. She shares it only after she agrees, and it has no name or phone number."

*If time allows: switch to English, tap "Not sure" and show that it goes up to AMBER. Optionally turn on airplane mode and show it still works.*

> "In the video the voice step uses a simulated recogniser, because a recording cannot speak. On a phone it uses the browser's own speech recognition, which needs internet. The tap check needs none."

## Slide 6: How it is built (2:10 to 2:30)

> "No model decides anything. Voice only turns spoken words into the same Yes, No, Not sure answers, using fixed word lists, and she can edit them. The verdict is a rule engine. We have 205 automated tests, and an independent Python program agrees on 12,420 generated cases.
>
> The optional cloud part, Google or phone sign-in and a daily log in Postgres with row level security, is built and tested, but it is not connected to a live project yet."

## Slide 7: Feasibility and milestones (2:30 to 2:45)

> "It is a static site, it works offline, it costs about six rupees per language for voice clips, and it needs no account.
>
> What stands between us and real use is people, not code. Next: a clinician reviews the rules, an ASHA field test, a real-phone voice test. Then Odia, Assamese and Bengali with native review."

## Slide 8: Business model (2:45 to 2:55)

> "Maitri stays free for women and families. Deployments by state missions and NGOs, grants and CSR for languages and clinical review, and paid services around an open core would fund it. We never sell data. This is a proposal, not yet tested with a funder."

## Slide 9: What broke and what we learned (2:55 to 3:10)

> "Three things broke. The build failed after a new screen changed the flow, so tests now gate the build and CI runs on every pull request. Buttons clipped on short phones, which one layout rule and a 15-screen audit fixed. And a misheard 'No' could hide a danger sign, so a spoken 'No' is confirmed.
>
> Our trade-offs: rules over AI, over-escalate rather than under-escalate, offline over cloud."

## Slide 10: Close (3:10 to 3:20)

> "No clinician has reviewed the rules yet. The prototype says so on screen. What we need is a clinician reviewer and an ASHA pilot.
>
> Maitri: the friend who tells the family what to do now. Thank you. The QR code has the code, the demo video and the live link."

---

## If you have only 90 seconds

Say slide 1's hook, then: "25.2 million births, and 48.6 percent of maternal deaths in one study involved a delay in deciding. Maitri is an offline, Hindi-first checker. One RED sign stops the check and shows the call button. Every result shows why, and no AI decides it. Tested 205 times and re-checked by a second program. No clinician has reviewed it yet, and we say so. We are looking for a clinician reviewer and an ASHA pilot."

## If a judge asks

- "Has a doctor reviewed it?" "No. It is a prototype and says so. We have a review packet and a review page ready."
- "Why not AI?" "A result must be explainable and testable. Rules can be audited line by line."
- "What if voice mishears?" "She sees the signs and can remove them. A spoken No is confirmed. Tap always works."
- "Does voice work offline?" "No, on most phones it needs internet. The tap check works fully offline."
- "Is the ambulance number right?" "It is user-supplied and unconfirmed, and the app says so. Only Tele-MANAS 14416 is confirmed."
- "Do you use Bhashini?" "Not today. It is on our roadmap for Odia, Assamese and Bengali, with native review, once we have read the terms and made the privacy decision."

More answers are in `docs/PITCH_AND_EXPLANATION.md`, section 6.

# Clinician review packet

Status: **prototype, not reviewed by a clinician.** Please do not treat anything here as approved. This file is generated from the app's data (`npm run packet`), so it matches what the app does. Rules file version 0.1-draft, last changed in commit 61035bc.

Maitri is an education tool for pregnant and postpartum women. It asks plain-language questions, one at a time, and shows one of three levels. It does not diagnose and shows no numbers such as blood pressure or temperature. The three levels are the team's own design. The national Mother and Child Protection card has a single level (take to hospital immediately).

## How the app decides

- Each sign is answered Yes, No or Not sure.
- The highest level among the rules that fire wins. If none fire the result is "No danger sign told" with a go-if-worse line. It never says someone is fine.
- A skipped or "Not sure" answer on a sign that matters counts as AMBER at least. The team accepts over-escalation because missing a danger sign costs more.
- One RED sign ends the check at once and shows a call button for the ambulance number.
- Two AMBER-class signs together become RED (rule R-MULTI-01).
- Postpartum means up to 42 days after birth (team convention; the card says one month).
- The wellbeing question never gives more than AMBER on its own. It also shows a support card (Tele-MANAS 14416, and 112 if anyone is in immediate danger).

## What we are asking you to check

1. Is any danger sign missing for pregnancy, labour or the 42 days after birth?
2. Is any level too mild or too strong? In particular the decisions marked for review below.
3. Is the lay wording right, in English and in Hindi, and safe for a frightened family member to read in two seconds?
4. Is the "Not sure goes up" policy acceptable?
5. Is the cluster rule (two AMBER-class signs become RED) acceptable?
6. Are the edge cases below handled sensibly?
7. Is the wellbeing wording acceptable for real use?

## Edge cases to look at

- **Labour and belly pain.** Pain is expected in labour. "Very bad belly pain" is RED in every stage, so a woman in strong labour may reach RED. Over-escalation is accepted. Is it acceptable here?
- **Baby moves less in labour.** AMBER, no kick count, no chart (the team found no primary-source count).
- **Swelling.** The question excludes "feet only" to limit over-escalation. RED when yes. A reviewer may downgrade.
- **Fever alone and discharge alone.** Fever is RED on yes. Bad-smelling discharge alone is AMBER class. Discharge with fever is RED (R-INF-02).
- **Breathing.** "Great difficulty breathing" is RED (team decision, no primary criteria found). "Very pale and weak, or short of breath" is a separate sign.
- **Calf pain after birth.** AMBER (possible clot, same-day review).
- **Water leaking before labour pains.** See the tables for its level.
- **Voice.** Spoken words are matched to the same signs with fixed word lists (summary below). A mention always counts, with no negation handling, so "no bleeding" is read as bleeding. She sees the signs found and can remove wrong ones. A spoken "No" to a question is confirmed before it counts.
- **Wellbeing.** Yes and Not sure both give AMBER and show the support card. It is excluded from the cluster rule.

## Rules, by stage

### I am pregnant

| Rule | Kind | Question(s) | Level | Flags | Sources and confidence | Team note |
|---|---|---|---|---|---|---|
| R-FITS-01 | One sign | "Fits (shaking), fainting, or not waking up?" (fits or fainting) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC, S-WHO-B. official_text_recheck | - |
| R-BLD-01 | One sign | "Bleeding from the vagina now?" (bleeding) | Yes: RED. Not sure: AMBER | - | S-MCP. official_text_recheck | - |
| R-HTN-01 | One sign | "Very bad headache, or blurred vision?" (bad headache or blurred vision) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | No blood pressure thresholds are encoded. BP is a health-worker measurement. |
| R-SWL-01 | One sign | "Swelling of the face, hands or whole body (not just the feet)?" (swelling of face, hands or body) | Yes: RED. Not sure: AMBER | - | S-MCP. official_text_recheck | The MCP card lists swelling inside a group with headache, blurred vision and fits. The question excludes swelling of the feet only. A reviewer may downgrade to AMBER to limit over-escalation. |
| R-FEV-01 | One sign | "High fever (body very hot)?" (high fever) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC, S-WHO-B. official_text_recheck | The MCP card gives no numeric temperature. The HBNC leaflet gives above 102 F for mothers. The app asks a lay question and encodes no number. |
| R-PROM-01 | One sign | "Water bag burst, or water leaking, without labour pains?" (water leaking before labour pains) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-D. official_text_recheck | - |
| R-ANA-01 | One sign | "Very pale and weak, or short of breath?" (very pale and weak, or short of breath) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | No haemoglobin number is encoded. Severe anaemia is a lab or clinician finding. |
| R-BRE-01 | One sign | "Great difficulty breathing?" (difficulty breathing) | Yes: RED. Not sure: AMBER | - | S-WHO-MCPC, S-TEAM (no official source). team_decision_plus_user_supplied_summary | No maternal breathing criteria were found in the primary text read. RED is a team decision because under-triage is the costlier error. Downgrade only if the clinician reviewer disagrees. |
| R-ABD-01 | One sign | "Very bad belly pain?" (very bad belly pain) | Yes: RED. Not sure: AMBER | - | S-WHO-B, S-WHO-MCPC, S-TEAM (no official source). team_decision_plus_user_supplied_summary | Earlier draft had AMBER. The team-supplied WHO summary calls severe abdominal pain a high-priority emergency sign, so the draft is now RED for 'very bad' pain. Reviewer may downgrade. |
| R-FM-01 | One sign | "Baby moving much less than usual, or not at all?" (baby moving much less) | Yes: AMBER. Not sure: AMBER | - | S-WHO-MCPC, S-TEAM (no official source). user_supplied_summary_unverified | No movement count is encoded. No kick chart. The team-supplied WHO summary says routine daily kick charts are recommended only within research frameworks. |
| R-CNF-01 | One sign | "Confused, or talking strangely?" (confusion or strange talk) | Yes: RED. Not sure: AMBER | - | S-HBNC. official_text_recheck | - |
| R-MULTI-01 | At least 2 of these | "Bad-smelling discharge from the vagina?" (bad-smelling discharge) + "Baby moving much less than usual, or not at all?" (baby moving much less) + "Pain or swelling in one calf?" (pain or swelling in one calf) | Yes: RED | - | S-TEAM (no official source). team_design | Two or more AMBER-class signs together escalate to RED. Over-escalation is accepted by design. q_wellbeing is deliberately excluded. |

### Labour pains have started

| Rule | Kind | Question(s) | Level | Flags | Sources and confidence | Team note |
|---|---|---|---|---|---|---|
| R-FITS-01 | One sign | "Fits (shaking), fainting, or not waking up?" (fits or fainting) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC, S-WHO-B. official_text_recheck | - |
| R-BLD-01 | One sign | "Bleeding from the vagina now?" (bleeding) | Yes: RED. Not sure: AMBER | - | S-MCP. official_text_recheck | - |
| R-HTN-01 | One sign | "Very bad headache, or blurred vision?" (bad headache or blurred vision) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | No blood pressure thresholds are encoded. BP is a health-worker measurement. |
| R-SWL-01 | One sign | "Swelling of the face, hands or whole body (not just the feet)?" (swelling of face, hands or body) | Yes: RED. Not sure: AMBER | - | S-MCP. official_text_recheck | The MCP card lists swelling inside a group with headache, blurred vision and fits. The question excludes swelling of the feet only. A reviewer may downgrade to AMBER to limit over-escalation. |
| R-FEV-01 | One sign | "High fever (body very hot)?" (high fever) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC, S-WHO-B. official_text_recheck | The MCP card gives no numeric temperature. The HBNC leaflet gives above 102 F for mothers. The app asks a lay question and encodes no number. |
| R-PROM-01 | One sign | "Water bag burst, or water leaking, without labour pains?" (water leaking before labour pains) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-D. official_text_recheck | - |
| R-ANA-01 | One sign | "Very pale and weak, or short of breath?" (very pale and weak, or short of breath) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | No haemoglobin number is encoded. Severe anaemia is a lab or clinician finding. |
| R-BRE-01 | One sign | "Great difficulty breathing?" (difficulty breathing) | Yes: RED. Not sure: AMBER | - | S-WHO-MCPC, S-TEAM (no official source). team_decision_plus_user_supplied_summary | No maternal breathing criteria were found in the primary text read. RED is a team decision because under-triage is the costlier error. Downgrade only if the clinician reviewer disagrees. |
| R-ABD-01 | One sign | "Very bad belly pain?" (very bad belly pain) | Yes: RED. Not sure: AMBER | - | S-WHO-B, S-WHO-MCPC, S-TEAM (no official source). team_decision_plus_user_supplied_summary | Earlier draft had AMBER. The team-supplied WHO summary calls severe abdominal pain a high-priority emergency sign, so the draft is now RED for 'very bad' pain. Reviewer may downgrade. |
| R-FM-01 | One sign | "Baby moving much less than usual, or not at all?" (baby moving much less) | Yes: AMBER. Not sure: AMBER | - | S-WHO-MCPC, S-TEAM (no official source). user_supplied_summary_unverified | No movement count is encoded. No kick chart. The team-supplied WHO summary says routine daily kick charts are recommended only within research frameworks. |
| R-CNF-01 | One sign | "Confused, or talking strangely?" (confusion or strange talk) | Yes: RED. Not sure: AMBER | - | S-HBNC. official_text_recheck | - |
| R-LAB-01 | One sign | "Labour pains for more than 12 hours?" (labour pains for over 12 hours) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-D. official_text_recheck | - |
| R-MULTI-01 | At least 2 of these | "Bad-smelling discharge from the vagina?" (bad-smelling discharge) + "Baby moving much less than usual, or not at all?" (baby moving much less) + "Pain or swelling in one calf?" (pain or swelling in one calf) | Yes: RED | - | S-TEAM (no official source). team_design | Two or more AMBER-class signs together escalate to RED. Over-escalation is accepted by design. q_wellbeing is deliberately excluded. |

### I had my baby (up to 42 days)

| Rule | Kind | Question(s) | Level | Flags | Sources and confidence | Team note |
|---|---|---|---|---|---|---|
| R-FITS-01 | One sign | "Fits (shaking), fainting, or not waking up?" (fits or fainting) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC, S-WHO-B. official_text_recheck | - |
| R-PPH-01 | One sign | "Heavy bleeding after birth. A cloth soaks in minutes, or the bleeding does not stop?" (heavy bleeding) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | WHO describes heavy postpartum bleeding as a pad or cloth soaked in under 5 minutes, or constant trickling. The app wording stays lay-friendly and encodes no pad count. |
| R-HTN-01 | One sign | "Very bad headache, or blurred vision?" (bad headache or blurred vision) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | No blood pressure thresholds are encoded. BP is a health-worker measurement. |
| R-FEV-01 | One sign | "High fever (body very hot)?" (high fever) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC, S-WHO-B. official_text_recheck | The MCP card gives no numeric temperature. The HBNC leaflet gives above 102 F for mothers. The app asks a lay question and encodes no number. |
| R-DIS-01 | One sign | "Bad-smelling discharge from the vagina?" (bad-smelling discharge) | Yes: AMBER. Not sure: AMBER | - | S-MCP, S-HBNC, S-TEAM (no official source). team_design_tier | HBNC gives foul discharge with temperature above 100 F as a danger sign. Foul discharge alone is AMBER by team decision. |
| R-INF-02 | All of these together | "Bad-smelling discharge from the vagina?" (bad-smelling discharge) + "High fever (body very hot)?" (high fever) | Yes: RED | - | S-HBNC, S-WHO-D. official_text_recheck | - |
| R-ANA-01 | One sign | "Very pale and weak, or short of breath?" (very pale and weak, or short of breath) | Yes: RED. Not sure: AMBER | - | S-MCP, S-WHO-B. official_text_recheck | No haemoglobin number is encoded. Severe anaemia is a lab or clinician finding. |
| R-BRE-01 | One sign | "Great difficulty breathing?" (difficulty breathing) | Yes: RED. Not sure: AMBER | - | S-WHO-MCPC, S-TEAM (no official source). team_decision_plus_user_supplied_summary | No maternal breathing criteria were found in the primary text read. RED is a team decision because under-triage is the costlier error. Downgrade only if the clinician reviewer disagrees. |
| R-ABD-01 | One sign | "Very bad belly pain?" (very bad belly pain) | Yes: RED. Not sure: AMBER | - | S-WHO-B, S-WHO-MCPC, S-TEAM (no official source). team_decision_plus_user_supplied_summary | Earlier draft had AMBER. The team-supplied WHO summary calls severe abdominal pain a high-priority emergency sign, so the draft is now RED for 'very bad' pain. Reviewer may downgrade. |
| R-DVT-01 | One sign | "Pain or swelling in one calf?" (pain or swelling in one calf) | Yes: AMBER. Not sure: AMBER | - | S-WHO-MCPC, S-TEAM (no official source). user_supplied_summary_unverified | - |
| R-CNF-01 | One sign | "Confused, or talking strangely?" (confusion or strange talk) | Yes: RED. Not sure: AMBER | - | S-HBNC. official_text_recheck | - |
| R-MH-01 | One sign | "Feeling very sad or hopeless, or thoughts of harming self or the baby?" (feeling very sad or hopeless) | Yes: AMBER. Not sure: AMBER | wellbeing_support | S-WHO-MCPC, S-TEAM (no official source). user_supplied_summary_unverified | Not a triage verdict. Show the support card (Tele-MANAS 14416, and 112 if anyone is in immediate danger). Clinician must review the wording before real use. |
| R-MULTI-01 | At least 2 of these | "Bad-smelling discharge from the vagina?" (bad-smelling discharge) + "Baby moving much less than usual, or not at all?" (baby moving much less) + "Pain or swelling in one calf?" (pain or swelling in one calf) | Yes: RED | - | S-TEAM (no official source). team_design | Two or more AMBER-class signs together escalate to RED. Over-escalation is accepted by design. q_wellbeing is deliberately excluded. |
| R-NB-01 | One sign | "Baby not feeding, or sucking very weakly?" (baby not feeding well) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC. official_text_recheck | - |
| R-NB-02 | One sign | "Baby breathing fast, or the chest pulling in with each breath?" (baby breathing fast) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC. official_text_recheck | HBNC gives breathing above 60 per minute or chest in-drawing. The app asks a lay question and encodes no count. |
| R-NB-03 | One sign | "Baby very hot, or cold to the touch?" (baby very hot or cold) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC. official_text_recheck | - |
| R-NB-04 | One sign | "Baby having fits, or very sleepy and limp?" (baby fits or very limp) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC. official_text_recheck | - |
| R-NB-05 | One sign | "Baby's palms and soles yellow, or yellow skin on the first day?" (baby yellow palms and soles) | Yes: RED. Not sure: AMBER | - | S-MCP, S-HBNC. official_text_recheck | - |
| R-NB-06 | One sign | "Pus, redness or swelling at the baby's cord stump?" (pus or redness at the cord) | Yes: RED. Not sure: AMBER | - | S-HBNC. official_text_recheck | - |

## Sources

- **S-MCP**: MoHFW Mother and Child Protection (MCP) Card, English (NHM copy) (https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/Guildelines_for_immunization/MCP_Card_English_version.pdf). Confidence: official_text_via_fetch_summary_recheck_raw_pdf.
- **S-HBNC**: HBNC leaflet (Assam NHM copy of national leaflet) (https://nhm.assam.gov.in/sites/default/files/swf_utility_folder/departments/nhm_lipl_in_oid_6/menu/document/hbnc_leaflet_revised_eng.pdf). Confidence: official_text_via_fetch_summary_recheck_raw_pdf.
- **S-WHO-B**: WHO Pregnancy, childbirth, postpartum and newborn care: a guide for essential practice, chapter B (quick check) (https://www.ncbi.nlm.nih.gov/books/NBK326676/). Confidence: official_text_via_fetch_summary_recheck_raw_pdf.
- **S-WHO-D**: WHO essential practice guide, chapter D (childbirth) (https://www.ncbi.nlm.nih.gov/books/NBK326674/). Confidence: official_text_via_fetch_summary_recheck_raw_pdf.
- **S-WHO-MCPC**: WHO Managing complications in pregnancy and childbirth, chapters C and E (summary supplied by the team, not independently read) (https://www.who.int/publications/i/item/9789241565493). Confidence: user_supplied_summary_unverified.
- **S-TEAM**: Team design decision (no official source). Needs clinician review.. Confidence: team_design.

## Decisions the team marked for your review

- D-02: MCP card items are RED. The reviewer may downgrade swelling.
- D-03: Swelling excludes "feet only" (draft).
- D-04: Difficulty breathing is RED (no primary criteria found).
- D-05: Very bad belly pain is RED (an earlier draft said AMBER).
- D-06: Baby moving less is AMBER, with no kick count.
- D-07: Calf pain or swelling after birth is AMBER.
- D-08: Two or more AMBER-class signs together are RED.
- D-09: The wellbeing question is a support card, not a tier.
- D-10: Postpartum is 42 days.

## Voice word lists (summary)

Strong phrases give Yes and weak phrases give Not sure. Full lists, in Hindi script, romanised Hindi and English, are in `src/data/voice_keywords.json` (status: DRAFT). Signs covered: fits or fainting; bad headache or blurred vision; swelling of face, hands or body; high fever; bad-smelling discharge; water leaking before labour pains; very pale and weak, or short of breath; difficulty breathing; very bad belly pain; baby moving much less; pain or swelling in one calf; confusion or strange talk; labour pains for over 12 hours; feeling very sad or hopeless; plus bleeding.

## How to respond

Anything is useful: a reply listing changes, or the in-app Rule review page (it exports an updated rules file with your name on each rule you tick). The team records your review in `docs/CLINICAL_SIGN_OFF.md` only after you agree in writing, with your name, credentials, the date and the commit shown at the top. Nothing is marked reviewed on your behalf.

## Message template

> We are building a danger-sign checker for pregnant and postpartum women for a hackathon. It is a prototype and is not in use. Could you look at the attached rules and wording and tell us if any danger sign is missing, wrong, or too mild or too strong? We will credit you only if you agree.

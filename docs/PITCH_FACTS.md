# Maitri pitch facts

Use these on the problem slide and in the video. **Every number carries its confidence label. Re-check the starred items against primary sources before they go on a slide.** Most figures were read from secondary pages because the primary PDFs were blocked during research.

## Statistics

| Fact | Value | Label | Source |
|---|---|---|---|
| Registered births, 2023* | about 25.2 million | [Secondary] | https://superkalam.com/current-affairs/14-10-2025/number-of-births-declines-deaths-rise-slightly-report-pg12-6886d7a6-3006-40e3-ad18-4ac48af94f9c |
| Maternal mortality ratio* | 88 per 100,000 (2021-23); 87 for 2022-24 is unconfirmed | [Secondary] | https://www.nextias.com/ca/current-affairs/09-09-2025/special-bulletin-maternal-mortality-india-2021-23 |
| Delay in deciding or seeking care | 48.6% of 317 maternal deaths in two West Bengal hospitals (2013-15); reaching a facility 33.8%; receiving care 18.9% | [Verified], single hospital study, not national | https://bmcpregnancychildbirth.biomedcentral.com/articles/10.1186/s12884-019-2458-5 |
| 4+ antenatal visits, NFHS-5 to NFHS-6* | 58.5% to 65.2% (up 6.7 points) | [Secondary] | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2288850 (link supplied by the team, not opened by the research agents) and https://medicaldialogues.in/news/health/india-sees-progress-in-maternal-and-child-health-immunisation-and-nutrition-nfhs-6-finds-171705 |
| Fewer than four visits, NFHS-6* | about 34.8% | [Inferred], 100 minus 65.2 | derived |
| Any antenatal care, NFHS-5 to NFHS-6* | 92.6% to 95.9% | [Secondary] | medicaldialogues link above |
| First-trimester antenatal care* | 70.0% to 76.2% | [Secondary] | medicaldialogues link above |
| Institutional births, NFHS-6* | 90.6% | [Secondary] | medicaldialogues link above |
| Women with their own mobile phone, NFHS-6* | 63.6% (NFHS-5: 53.9%), so about 36% do not | [Secondary] | medicaldialogues link above |
| Inadequate antenatal care, NFHS-5 analysis | 40.75% of 172,702 women had fewer than four visits; 68.2% at birth order 6+, 59.8% with no education, 57.7% poorest quintile | [Verified] | https://pmc.ncbi.nlm.nih.gov/articles/PMC10166529 |
| Nivi/CMU benchmark | emergency recall 86.7%, same-day recall 77.8%, over-escalation 15% (150 synthetic cases) | [Verified], preprint | https://arxiv.org/pdf/2603.13168 |
| Noora Health TRACE | nurses judged 17.8% of flags over-escalation; postnatal worst | [Verified], preprint | https://arxiv.org/pdf/2609.09356 |
| Kenya PROMPTS RCT | danger-sign knowledge and postnatal visits improved (6,139 women); no effect on postpartum or newborn danger-sign knowledge | [Verified] | https://poverty-action.org/impact-digital-health-platform-maternal-and-newborn-care-kenya |
| Cochrane 2020, mobile messaging | 27 RCTs; antenatal attendance OR 1.54 (0.80-2.96), low certainty | [Verified] | https://www.cochrane.org/evidence/CD013679_communicating-pregnant-woman-and-parents-through-their-mobile-devices-improve-maternal-neonatal-and |

Exposure arithmetic [Estimate], one slide at most, never as lives saved: 25.2 million births x 88 per 100,000 = about 22,000 maternal deaths a year. Applying the single-study 48.6% decision-delay share gives about 10,800 deaths involving a delay in deciding or seeking care. That is an upper-bound exposure from one hospital study.

## Suggested problem slide (six facts)

1. About 25.2 million births a year [Secondary].
2. MMR 88 per 100,000, down from 212 but nearly flat lately [Secondary].
3. Contact is high (90.6% institutional births) but about one in three still has fewer than four antenatal visits [Secondary].
4. In one Indian hospital study, 48.6% of maternal deaths involved a delay in deciding or seeking care [Verified, single study].
5. About 36% of women do not own a phone, which is why Maitri has ASHA and family modes [Secondary].
6. Indian triage tools both miss same-day cases (77.8% recall) and over-escalate (17.8% of flags), which is why Maitri escalates upward and shows its rule [Verified preprints].

## Claims we can make

Offline, Hindi-first, tap-and-voice checker. Deterministic rule file. Every verdict names the sign that triggered it and the source. The three levels are our own disclosed design. Automated tests confirm the code matches the rule table (this is not clinical validation). Designed around the decision delay. Privacy by default.

## Claims we must not make

Lives saved. Reduced mortality. Accuracy, sensitivity or validation. Clinical approval or review (until a reviewer is recorded). "Official" or "MoHFW approved" tiers. Regulatory clearance. User reach. That any helpline number is final (only 14416 is confirmed). That nobody has built this.

## Source documents for the rules

- MoHFW MCP Card (NHM copy): https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/Guildelines_for_immunization/MCP_Card_English_version.pdf
- HBNC leaflet (Assam NHM copy): https://nhm.assam.gov.in/sites/default/files/swf_utility_folder/departments/nhm_lipl_in_oid_6/menu/document/hbnc_leaflet_revised_eng.pdf
- WHO essential practice guide, chapter B: https://www.ncbi.nlm.nih.gov/books/NBK326676/ and chapter D: https://www.ncbi.nlm.nih.gov/books/NBK326674/
- WHO Managing complications in pregnancy and childbirth (chapters C and E, summary supplied by the team, not independently read): https://www.who.int/publications/i/item/9789241565493
- JSSK guidelines: https://nhm.gov.in/New_Updates_2018/NHM_Components/RMNCHA/MH/Guidelines/JSSK_Final_English.pdf
- Tele-MANAS (PIB): https://pib.gov.in/PressReleasePage.aspx?PRID=2022796

// Generates docs/CLINICIAN_REVIEW_PACKET.md from the data files, so it always matches what the app does.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const rules = read('src/data/rules.json');
const qdata = read('src/data/questions.json');
const voice = read('src/data/voice_keywords.json');
const Q = Object.fromEntries(qdata.questions.map((q) => [q.id, q]));
let hash = 'unknown';
try { hash = execSync('git log -1 --format=%h -- src/data/rules.json src/data/questions.json', { encoding: 'utf8' }).trim() || 'uncommitted'; } catch { /* not a git checkout */ }
const stageName = Object.fromEntries(qdata.stages.map((s) => [s.id, s.en]));
const tiers = (t) => Object.entries(t).map(([k, v]) => `${k === 'yes' ? 'Yes' : 'Not sure'}: ${v}`).join('. ');
const qs = (r) => [r.question_id, ...(r.question_ids ?? []), ...(r.among ?? [])].filter(Boolean).map((id) => `"${Q[id]?.en}" (${Q[id]?.short_en})`).join(' + ');
const kind = (r) => (r.type === 'single' ? 'One sign' : r.type === 'all_of' ? 'All of these together' : `At least ${r.min} of these`);

let md = `# Clinician review packet

Status: **prototype, not reviewed by a clinician.** Please do not treat anything here as approved. This file is generated from the app's data (\`npm run packet\`), so it matches what the app does. Rules file version ${rules.version}, last changed in commit ${hash}.

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
`;

for (const st of ['pregnant', 'labour', 'after_birth']) {
  md += `\n### ${stageName[st]}\n\n| Rule | Kind | Question(s) | Level | Flags | Sources and confidence | Team note |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rules.rules.filter((x) => x.stages.includes(st))) {
    const src = r.source_refs.map((s) => `${s}${rules.sources[s]?.url ? '' : ' (no official source)'}`).join(', ');
    md += `| ${r.id} | ${kind(r)} | ${qs(r)} | ${tiers(r.tier_if)} | ${(r.flags ?? []).join(', ') || '-'} | ${src}. ${r.confidence} | ${(r.note ?? '').replace(/\|/g, '/') || '-'} |\n`;
  }
}

md += `\n## Sources\n\n${Object.entries(rules.sources).map(([id, s]) => `- **${id}**: ${s.title}${s.url ? ` (${s.url})` : ''}. Confidence: ${s.confidence}.`).join('\n')}\n`;

md += `\n## Decisions the team marked for your review\n\n- D-02: MCP card items are RED. The reviewer may downgrade swelling.\n- D-03: Swelling excludes "feet only" (draft).\n- D-04: Difficulty breathing is RED (no primary criteria found).\n- D-05: Very bad belly pain is RED (an earlier draft said AMBER).\n- D-06: Baby moving less is AMBER, with no kick count.\n- D-07: Calf pain or swelling after birth is AMBER.\n- D-08: Two or more AMBER-class signs together are RED.\n- D-09: The wellbeing question is a support card, not a tier.\n- D-10: Postpartum is 42 days.\n`;

md += `\n## Voice word lists (summary)\n\nStrong phrases give Yes and weak phrases give Not sure. Full lists, in Hindi script, romanised Hindi and English, are in \`src/data/voice_keywords.json\` (status: ${voice.status.split('.')[0]}). Signs covered: ${Object.keys(voice.signs).map((id) => Q[id]?.short_en ?? id).join('; ')}; plus bleeding.\n`;

md += `\n## How to respond\n\nAnything is useful: a reply listing changes, or the in-app Rule review page (it exports an updated rules file with your name on each rule you tick). The team records your review in \`docs/CLINICAL_SIGN_OFF.md\` only after you agree in writing, with your name, credentials, the date and the commit shown at the top. Nothing is marked reviewed on your behalf.\n\n## Message template\n\n> We are building a danger-sign checker for pregnant and postpartum women for a hackathon. It is a prototype and is not in use. Could you look at the attached rules and wording and tell us if any danger sign is missing, wrong, or too mild or too strong? We will credit you only if you agree.\n`;

fs.writeFileSync('docs/CLINICIAN_REVIEW_PACKET.md', md);
console.log(`wrote docs/CLINICIAN_REVIEW_PACKET.md (${md.split('\n').length} lines)`);

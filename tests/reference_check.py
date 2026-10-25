#!/usr/bin/env python3
"""Reference evaluator for Maitri rules. Checks every case in rule_cases.json.

Run from the handoff folder:  python3 tests/reference_check.py
Claude Code may use this as a second opinion for the TypeScript engine.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rules = json.loads((ROOT / "src/data/rules.json").read_text(encoding="utf-8"))
questions = json.loads((ROOT / "src/data/questions.json").read_text(encoding="utf-8"))
cases = json.loads((ROOT / "tests/rule_cases.json").read_text(encoding="utf-8"))["cases"]

TIER = rules["tiers"]
QBY = {q["id"]: q for q in questions["questions"]}


def evaluate(stage, answers, default_answer, modules):
    applicable = [
        q["id"] for q in questions["questions"]
        if stage in q["stages"] and q["module"] in modules
    ]
    ans = {}
    for qid in applicable:
        ans[qid] = answers.get(qid, default_answer)
    fired, flags = [], []
    for r in rules["rules"]:
        if r["module"] not in modules or stage not in r["stages"]:
            continue
        tier = None
        if r["type"] == "single":
            a = ans.get(r["question_id"])
            if a is None:
                continue
            tier = r["tier_if"].get(a)
        elif r["type"] == "all_of":
            if all(ans.get(q) == "yes" for q in r["question_ids"]):
                tier = r["tier_if"]["yes"]
        elif r["type"] == "count":
            n = sum(1 for q in r["among"] if ans.get(q) == "yes")
            if n >= r["min"]:
                tier = r["tier_if"]["yes"]
        if tier:
            fired.append({"id": r["id"], "tier": tier})
            flags.extend(r.get("flags", []))
    top = max([TIER[f["tier"]] for f in fired], default=TIER["GREEN"])
    name = [k for k, v in TIER.items() if v == top][0]
    return name, fired, sorted(set(flags))


failed = 0
for c in cases:
    modules = c.get("modules", ["core"])
    tier, fired, flags = evaluate(c["stage"], c["answers"], c["default_answer"], modules)
    ids = {f["id"] for f in fired}
    problems = []
    if tier != c["expect_tier"]:
        problems.append(f"tier {tier} != {c['expect_tier']}")
    for rid in c.get("expect_rules_include", []):
        if rid not in ids:
            problems.append(f"missing rule {rid}")
    for rid in c.get("expect_rules_exclude", []):
        if rid in ids:
            problems.append(f"unexpected rule {rid}")
    if c.get("expect_no_rules") and ids:
        problems.append(f"expected no rules, got {sorted(ids)}")
    for fl in c.get("expect_flags", []):
        if fl not in flags:
            problems.append(f"missing flag {fl}")
    if problems:
        failed += 1
        print(f"FAIL {c['id']} {c['title']}: {'; '.join(problems)}")

# structural checks
rule_qs = set()
for r in rules["rules"]:
    for k in ("question_id",):
        if k in r:
            rule_qs.add(r[k])
    rule_qs.update(r.get("question_ids", []))
    rule_qs.update(r.get("among", []))
missing = [q for q in rule_qs if q not in QBY]
if missing:
    failed += 1
    print("FAIL rules reference unknown questions:", missing)
unruled = [q for q in QBY if q not in rule_qs]
if unruled:
    failed += 1
    print("FAIL questions with no rule:", unruled)
for q in questions["questions"]:
    for stg in q["stages"]:
        if stg not in {s["id"] for s in questions["stages"]}:
            failed += 1
            print("FAIL unknown stage", stg, "in", q["id"])
src_ids = set(rules["sources"])
for r in rules["rules"]:
    for s in r["source_refs"]:
        if s not in src_ids:
            failed += 1
            print("FAIL unknown source", s, "in", r["id"])

en = json.loads((ROOT / "src/data/i18n/en.json").read_text(encoding="utf-8"))
hi = json.loads((ROOT / "src/data/i18n/hi.json").read_text(encoding="utf-8"))
if set(en) != set(hi):
    failed += 1
    print("FAIL i18n key mismatch:", sorted(set(en) ^ set(hi)))

print(f"{len(cases) - 0} cases checked, {failed} failure(s)")
sys.exit(1 if failed else 0)

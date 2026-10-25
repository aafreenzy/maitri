#!/usr/bin/env python3
"""Independent check of the TypeScript engine on thousands of generated answer sets.

`npm run test:differential` first runs the property tests (which write tests/generated/combos.json
using the TypeScript engine), then this script re-evaluates every combination with its own
implementation written from the rule semantics in rules.json, and compares tier, fired rules and flags.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rules = json.loads((ROOT / "src/data/rules.json").read_text(encoding="utf-8"))
questions = json.loads((ROOT / "src/data/questions.json").read_text(encoding="utf-8"))
combos = json.loads((ROOT / "tests/generated/combos.json").read_text(encoding="utf-8"))
RANK = {"GREEN": 1, "AMBER": 2, "RED": 3}


def evaluate(stage, given):
    qids = [q["id"] for q in questions["questions"] if stage in q["stages"] and q["module"] == "core"]
    ans = {q: given.get(q, "not_sure") for q in qids}
    fired, flags = {}, set()
    for r in rules["rules"]:
        if r["module"] != "core" or stage not in r["stages"]:
            continue
        t = r["type"]
        tier = None
        if t == "single":
            a = ans.get(r["question_id"])
            tier = r["tier_if"].get(a) if a in ("yes", "not_sure") else None
        elif t == "all_of":
            tier = r["tier_if"].get("yes") if all(ans.get(q) == "yes" for q in r["question_ids"]) else None
        elif t == "count":
            tier = r["tier_if"].get("yes") if sum(ans.get(q) == "yes" for q in r["among"]) >= r["min"] else None
        if tier:
            fired[r["id"]] = tier
            flags.update(r.get("flags", []))
    top = max((RANK[x] for x in fired.values()), default=1)
    name = {1: "GREEN", 2: "AMBER", 3: "RED"}[top]
    return name, sorted(fired), sorted(flags)


bad = 0
for c in combos:
    tier, fired, flags = evaluate(c["stage"], c["answers"])
    if (tier, fired, flags) != (c["tier"], c["fired"], c["flags"]):
        bad += 1
        if bad <= 5:
            print("MISMATCH", c["stage"], json.dumps(c["answers"]), "ts:", c["tier"], c["fired"], "py:", tier, fired)
print(f"{len(combos)} combinations compared, {bad} mismatch(es)")
sys.exit(1 if bad else 0)

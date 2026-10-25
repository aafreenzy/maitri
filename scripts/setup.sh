#!/bin/sh
# Turns on the deadline guard for this clone. Run once after cloning: sh scripts/setup.sh
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
echo "Deadline guard is on. Commits after the hard stop will be refused."
echo "It does not cover commits made on github.com in the browser. Do not edit files there after the hard stop."

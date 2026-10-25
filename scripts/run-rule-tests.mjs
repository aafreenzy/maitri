import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const rules = JSON.parse(fs.readFileSync('src/data/rules.json', 'utf8'));
const tmp = fs.mkdtempSync(new URL('.', import.meta.url).pathname.replace(/scripts\/$/, '') + '.vitest-report-');
const outFile = tmp + '/out.json';
const r = spawnSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${outFile}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
let j;
try { j = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch { console.error('Could not read vitest output'); console.error(r.stderr); process.exit(1); }
finally { fs.rmSync(tmp, { recursive: true, force: true }); }
const report = {
  passed: j.numPassedTests, total: j.numTotalTests, failed: j.numFailedTests,
  rules_version: rules.version, generated_at: new Date().toISOString(),
};
fs.mkdirSync('src/generated', { recursive: true });
fs.writeFileSync('src/generated/test-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(`tests: ${report.passed}/${report.total} passed`);
if (report.failed > 0 || r.status !== 0) process.exit(1);

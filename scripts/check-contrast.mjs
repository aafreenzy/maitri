const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['white on sindoor', '#FFFFFF', '#C4122F', 4.5], ['white on calm teal', '#FFFFFF', '#0F7A6B', 4.5],
  ['ink on haldi', '#111B38', '#F7B500', 4.5], ['white on nil indigo', '#FFFFFF', '#23358A', 4.5],
  ['ink on chuna', '#111B38', '#E6EEF6', 4.5], ['muted on chuna', '#4A5878', '#E6EEF6', 4.5],
  ['nil indigo on chuna (links)', '#23358A', '#E6EEF6', 4.5],
];
let bad = 0;
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min; if (!ok) bad++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2)}:1  ${name} (needs ${min})`);
}
process.exit(bad ? 1 : 0);

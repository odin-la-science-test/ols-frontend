const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const srcDir = path.resolve(__dirname, 'src');
const files = walk(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/(border|bg|text)-(foreground|background|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|success|warning)\/([0-9.]+)/g, (match, prop, varName, opRaw) => {
    let op = parseFloat(opRaw);
    if (op < 1) op = op * 100;
    return `${prop}-${varName}-[color-mix(in_srgb,var(--color-${varName})_${op}%,transparent)]`;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

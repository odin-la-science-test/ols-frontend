const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const srcDir = path.resolve(process.cwd(), 'src');
const files = walk(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Regex to match our semantic variables with opacity shorthand
  // Example: bg-primary/30 or text-foreground/0.4
  const newContent = content.replace(/(border|bg|text)-(foreground|background|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|success|warning)\/([0-9.]+)/g, (match, prop, varName, opRaw) => {
    let op = parseFloat(opRaw);
    if (op < 1) op = op * 100;
    
    // Correct Tailwind arbitrary value syntax: prop-[value]
    // Example: bg-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
    return `${prop}-[color-mix(in_srgb,var(--color-${varName})_${op}%,transparent)]`;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

// Also fix the accidental "prop-var-[color-mix...]" from the previous run
const filesToCleanup = walk(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
filesToCleanup.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const cleanedContent = content.replace(/(border|bg|text)-(foreground|background|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|success|warning)-\[color-mix/g, (match, prop, varName) => {
    return `${prop}-[color-mix`;
  });
  if (content !== cleanedContent) {
    fs.writeFileSync(file, cleanedContent, 'utf8');
    console.log(`Cleaned: ${file}`);
  }
});

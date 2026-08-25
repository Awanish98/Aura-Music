const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const jsLines = jsContent.split('\n');

const elRegex = /<([a-zA-Z0-9]+)\b([^>]*)>/g;
let match;
const elements = [];

while ((match = elRegex.exec(htmlContent)) !== null) {
  const tag = match[1].toLowerCase();
  const attrs = match[2];
  const index = match.index;
  const lineNum = htmlContent.substring(0, index).split('\n').length;
  const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
  const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
  const typeMatch = attrs.match(/\btype=["']([^"']+)["']/i);
  const onclickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
  const ariaLabelMatch = attrs.match(/\baria-label=["']([^"']+)["']/i);
  const titleMatch = attrs.match(/\btitle=["']([^"']+)["']/i);

  const isInteractive = (
    ['button', 'input', 'select', 'textarea'].includes(tag) ||
    (tag === 'a' && /\bhref\b/i.test(attrs)) ||
    /\brole=["']button["']/i.test(attrs) ||
    /\b(onclick|onchange|oninput|onkeydown|onkeyup)\b/i.test(attrs) ||
    /\bclass=["'][^"']*\b(btn|toggle|switch|slider|chip|pill)\b[^"']*["']/i.test(attrs)
  );

  if (isInteractive) {
    elements.push({
      tag,
      id: idMatch ? idMatch[1] : null,
      classes: classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [],
      type: typeMatch ? typeMatch[1] : null,
      onclick: onclickMatch ? onclickMatch[1] : null,
      ariaLabel: ariaLabelMatch ? ariaLabelMatch[1] : null,
      title: titleMatch ? titleMatch[1] : null,
      line: lineNum,
      raw: match[0]
    });
  }
}

console.log(`Found ${elements.length} interactive elements in index.html.`);

// Check handler for each
const categorized = {
  wiredDirectlyById: [],
  wiredByClassOrDelegation: [],
  wiredInline: [],
  unwiredOrProblematic: []
};

elements.forEach(el => {
  let isWired = false;
  let wiringInfo = '';

  if (el.onclick) {
    categorized.wiredInline.push({ el, detail: `Inline onclick: ${el.onclick}` });
    return;
  }

  if (el.id) {
    // Check if ID is queried in JS and has an event listener or action
    const idOccurrences = [];
    jsLines.forEach((line, idx) => {
      if (line.includes(`'${el.id}'`) || line.includes(`"${el.id}"`) || line.includes(`\`${el.id}\``)) {
        idOccurrences.push({ line: idx + 1, code: line.trim() });
      }
    });

    if (idOccurrences.length > 0) {
      // Check if any occurrence attaches event listener or is used in click handler
      const hasListener = idOccurrences.some(o => /addEventListener|\.onclick|\.onchange|\.oninput|\.click\(\)/.test(o.code) || jsContent.includes(`${el.id}.addEventListener`));
      categorized.wiredDirectlyById.push({
        el,
        occurrences: idOccurrences.length,
        hasListener,
        lines: idOccurrences.map(o => o.line)
      });
      return;
    }
  }

  // Check class or data attribute delegation
  let delegationMatched = false;
  for (const cls of el.classes) {
    if (jsContent.includes(`.${cls}`) || jsContent.includes(`'${cls}'`) || jsContent.includes(`"${cls}"`)) {
      categorized.wiredByClassOrDelegation.push({ el, detail: `Class query: .${cls}` });
      delegationMatched = true;
      break;
    }
  }

  if (!delegationMatched) {
    // Check data attributes
    const raw = el.raw;
    const dataMatches = [...raw.matchAll(/data-([a-zA-Z0-9_-]+)=["']([^"']+)["']/g)];
    for (const dm of dataMatches) {
      if (jsContent.includes(`data-${dm[1]}`) || jsContent.includes(`dataset.${dm[1]}`)) {
        categorized.wiredByClassOrDelegation.push({ el, detail: `Dataset query: data-${dm[1]}="${dm[2]}"` });
        delegationMatched = true;
        break;
      }
    }
  }

  if (!delegationMatched) {
    categorized.unwiredOrProblematic.push(el);
  }
});

console.log('--- SUMMARY ---');
console.log('Wired directly by ID:', categorized.wiredDirectlyById.length);
console.log('Wired by Class / Dataset delegation:', categorized.wiredByClassOrDelegation.length);
console.log('Wired inline:', categorized.wiredInline.length);
console.log('Unwired or potentially problematic:', categorized.unwiredOrProblematic.length);

console.log('\n--- UNWIRED / PROBLEMATIC ELEMENTS LIST ---');
categorized.unwiredOrProblematic.forEach(el => {
  console.log(`Line ${el.line}: <${el.tag}> ID: "${el.id || ''}" Classes: [${el.classes.join(', ')}] Raw: ${el.raw}`);
});

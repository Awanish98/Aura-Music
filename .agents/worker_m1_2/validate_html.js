const fs = require('fs');
const html = fs.readFileSync('p:/Agents/ishq-radio-2.0/index.html', 'utf8');

const voidTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr', '!doctype'
]);
const svgSelfClosingTags = new Set([
  'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'use', 'stop', 'feDropShadow', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feColorMatrix'
]);

// Strip comments and attribute strings before parsing tags
const cleanedHtml = html.replace(/<!--[\s\S]*?-->/g, '').replace(/="[^"]*"/g, '=""').replace(/='[^']*'/g, "=''");

const tagRegex = /<\/?([a-zA-Z0-9:-]+)([^>]*?)>/g;
let stack = [];
let match;
let errors = 0;

while ((match = tagRegex.exec(cleanedHtml)) !== null) {
  const full = match[0];
  const tagName = match[1].toLowerCase();
  const isClosing = full.startsWith('</');
  const isSelfClosing = full.endsWith('/>') || voidTags.has(tagName) || (svgSelfClosingTags.has(tagName) && (full.endsWith('/>') || !isClosing));
  const lineNum = cleanedHtml.substring(0, match.index).split('\n').length;

  if (tagName === '!doctype') continue;

  if (isClosing) {
    if (stack.length === 0) {
      console.log(`ERROR: Unexpected closing tag </${tagName}> at line ${lineNum} with empty stack`);
      errors++;
      continue;
    }
    const top = stack[stack.length - 1];
    if (top.tagName === tagName) {
      stack.pop();
    } else {
      console.log(`ERROR: Mismatched closing tag </${tagName}> at line ${lineNum}, expected </${top.tagName}> opened at line ${top.lineNum}`);
      errors++;
      const idx = stack.findLastIndex(item => item.tagName === tagName);
      if (idx !== -1) {
        console.log(`  -> Unclosed tags between:`, stack.slice(idx + 1).map(x => `${x.tagName}:${x.lineNum}`));
        stack.splice(idx, stack.length - idx);
      }
    }
  } else if (!isSelfClosing) {
    stack.push({ tagName, lineNum, full: full.substring(0, 40) });
  }
}

if (stack.length > 0) {
  console.log('Unclosed tags remaining at EOF:', stack);
  errors += stack.length;
}

console.log(`Validation finished with ${errors} errors.`);

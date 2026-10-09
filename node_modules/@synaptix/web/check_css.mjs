import fs from 'fs';

const css = fs.readFileSync('./src/index.css', 'utf-8');

console.log(`CSS Total Lines: ${css.split('\n').length}`);
console.log(`CSS Total Bytes: ${css.length}`);

// Check bracket balance
let openBrackets = 0;
const lines = css.split('\n');
lines.forEach((line, idx) => {
  for (const char of line) {
    if (char === '{') openBrackets++;
    if (char === '}') openBrackets--;
    if (openBrackets < 0) {
      console.error(`Unmatched closing bracket at line ${idx + 1}: ${line}`);
    }
  }
});

if (openBrackets !== 0) {
  console.error(`Bracket mismatch end state: ${openBrackets}`);
} else {
  console.log(`Brackets balanced perfectly!`);
}

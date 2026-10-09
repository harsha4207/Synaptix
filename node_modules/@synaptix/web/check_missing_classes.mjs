import fs from 'fs';
import path from 'path';

const css = fs.readFileSync('./src/index.css', 'utf-8');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('./src');
const classRegex = /className=["']([^"']+)["']/g;
const missingClasses = new Set();
const foundClasses = new Set();

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const classes = match[1].split(/\s+/);
    classes.forEach((cls) => {
      if (!cls || cls.includes('${') || cls.includes('?')) return;
      if (css.includes(`.${cls}`)) {
        foundClasses.add(cls);
      } else {
        missingClasses.add(cls);
      }
    });
  }
});

console.log(`Found classes in CSS: ${foundClasses.size}`);
console.log(`Missing classes in CSS: ${missingClasses.size}`);
console.log(`Missing class list:`);
console.log(Array.from(missingClasses).sort().join('\n'));

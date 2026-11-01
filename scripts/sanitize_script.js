const fs = require('fs');

function sanitize(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Strip any existing BOMs at start
  while (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFD) {
    content = content.slice(1);
  }
  // Replace em-dash and en-dash
  content = content.replace(/[\u2014\u2013]/g, '-');
  // Replace quotes
  content = content.replace(/[\u201C\u201D]/g, '"');
  content = content.replace(/[\u2018\u2019]/g, "'");
  // Replace bullet points
  content = content.replace(/[\u2022\u25CF\u2023]/g, '*');
  // Replace [System.Drawing.Color]::White with $global:COL_WHITE
  content = content.replace(/\[System\.Drawing\.Color\]::White/g, '$global:COL_WHITE');
  
  // Save with single UTF-8 BOM
  const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
  const buf = Buffer.concat([bom, Buffer.from(content, 'utf8')]);
  fs.writeFileSync(filePath, buf);
  console.log(`Sanitized ${filePath} successfully.`);
}

sanitize('scripts/figure_drawing_lib.ps1');
sanitize('scripts/render_group_a_figures.ps1');
sanitize('scripts/render_group_b_interfaces.ps1');
sanitize('scripts/render_group_c_outputs.ps1');

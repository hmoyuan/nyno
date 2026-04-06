#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const scripts = ['run-dev.sh', 'run-prod.sh'];
const failures = [];

for (const script of scripts) {
  const scriptPath = path.resolve(script);
  const source = fs.readFileSync(scriptPath, 'utf8');

  const supportsUnixVenv = source.includes('.venv/bin/activate');
  const supportsWindowsVenv = source.includes('.venv/Scripts/activate');
  const sourcesOneOfThem = source.includes('source "$VENV_ACTIVATE"');

  if (!supportsUnixVenv || !supportsWindowsVenv || !sourcesOneOfThem) {
    failures.push({
      script: scriptPath,
      supportsUnixVenv,
      supportsWindowsVenv,
      sourcesOneOfThem,
    });
  }
}

if (failures.length > 0) {
  console.log(JSON.stringify({
    expect: 'Run scripts activate Python venv from Unix and Windows default uv locations',
    failures,
  }));
  process.exit(1);
}

console.log(JSON.stringify({
  expect: 'Run scripts activate Python venv from Unix and Windows default uv locations',
  scripts: scripts.map((script) => path.resolve(script)),
  output: 'Cross-platform venv activation detected',
}));

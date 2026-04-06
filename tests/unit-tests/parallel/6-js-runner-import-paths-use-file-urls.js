#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const runnerPath = path.resolve('./src/lib-manual/runners/runner.ts');
const runnerSource = fs.readFileSync(runnerPath, 'utf8');

const usesPathToFileURL = runnerSource.includes('pathToFileURL') &&
  runnerSource.includes('await import(pathToFileURL(cmdFile).href)');

if (!usesPathToFileURL) {
  console.log(JSON.stringify({
    expect: 'JS runner converts absolute command.js paths into file:// URLs before dynamic import',
    file: runnerPath,
    failure: 'Missing pathToFileURL(cmdFile).href import specifier'
  }));
  process.exit(1);
}

console.log(JSON.stringify({
  expect: 'JS runner converts absolute command.js paths into file:// URLs before dynamic import',
  file: runnerPath,
  output: 'pathToFileURL(cmdFile).href detected'
}));

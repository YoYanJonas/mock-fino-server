#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const vitestBin = path.join(__dirname, '..', 'node_modules', 'vitest', 'vitest.mjs');
const child = spawn(process.execPath, [vitestBin, 'run', '--reporter=verbose', ...process.argv.slice(2)], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env,
});

let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  stdout += text;
  process.stdout.write(text);
});
child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  stderr += text;
  process.stderr.write(text);
});

child.on('close', (code) => {
  const combined = `${stdout}\n${stderr}`;
  const failedCountMatch = combined.match(/Tests\s+(\d+)\s+failed/);
  const failedCount = failedCountMatch ? Number(failedCountMatch[1]) : 0;
  const hasFailBanner = /\bFAIL\b/.test(combined);
  const eaccesCleanup = /kill EACCES/.test(combined);
  const passedCountMatch = combined.match(/Tests\s+(?:\d+\s+failed\s+\|\s+)?(\d+)\s+passed/);
  const passedAlt = combined.match(/(\d+)\s+passed/);
  const passCount = passedCountMatch
    ? Number(passedCountMatch[1])
    : passedAlt
      ? Number(passedAlt[1])
      : 0;

  if (failedCount > 0 || hasFailBanner) {
    process.exit(1);
  }

  if (code === 0) {
    process.exit(0);
  }

  if (eaccesCleanup && passCount > 0) {
    console.error(
      `\n[test-runner] ${passCount} passed, 0 failed; ignoring sandbox worker cleanup EACCES.`,
    );
    process.exit(0);
  }

  process.exit(code ?? 1);
});

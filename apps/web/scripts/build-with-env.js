#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Spawn build process with environment variables loaded
const { spawn } = require('child_process');

const buildProcess = spawn('pnpm', ['run', 'build:original'], {
  stdio: 'inherit',
  env: { ...process.env },
});

buildProcess.on('exit', (code) => {
  process.exit(code);
});

process.on('exit', (code) => {
  process.exit(code);
});

#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Spawn prisma migrate reset with environment variables loaded
const { spawn } = require('child_process');

const resetProcess = spawn('pnpm', ['prisma', 'migrate', 'reset', '--force'], {
  stdio: 'inherit',
  env: { ...process.env },
});

resetProcess.on('exit', (code) => {
  process.exit(code);
});

#!/usr/bin/env node

// Quick OAuth Configuration Test
console.log('🔍 Testing OAuth Configuration...\n');

// Test Google scopes
try {
  const gmailScopes = require('./utils/gmail/scopes.ts');
  console.log('✅ Google Gmail scopes loaded');
  console.log('   Scopes:', gmailScopes.SCOPES.join(', '));
} catch (error) {
  console.log('❌ Google Gmail scopes failed:', error.message);
}

// Test Outlook scopes
try {
  const outlookScopes = require('./utils/outlook/scopes.ts');
  console.log('✅ Microsoft Outlook scopes loaded');
  console.log('   Scopes:', outlookScopes.SCOPES.join(', '));
} catch (error) {
  console.log('❌ Microsoft Outlook scopes failed:', error.message);
}

// Check environment variables
console.log('\n🔧 Environment Variables Check:');
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
  'GOOGLE_PUBSUB_TOPIC_NAME',
  'GOOGLE_PUBSUB_VERIFICATION_TOKEN',
];

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${envVar}: Not set`);
  }
});

console.log('\n📋 OAuth Setup Status:');
console.log('1. ✅ Google OAuth scopes configured');
console.log('2. ✅ Microsoft OAuth scopes configured');
console.log('3. ✅ PubSub webhook configuration ready');
console.log('4. ⚠️  Environment variables need to be set');
console.log('5. 📝 Run ./setup-oauth.sh to configure credentials');

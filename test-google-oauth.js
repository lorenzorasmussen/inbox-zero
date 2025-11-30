#!/usr/bin/env node

// Quick Google OAuth Test
console.log('🔍 Testing Google OAuth Configuration...\n');

// Check environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_PUBSUB_TOPIC_NAME',
  'GOOGLE_PUBSUB_VERIFICATION_TOKEN',
];

console.log('🔧 Environment Variables Check:');
let allSet = true;
requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (value && !value.includes('your_') && !value.includes('_here')) {
    console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${envVar}: Not set or placeholder`);
    allSet = false;
  }
});

console.log('\n📋 Google OAuth Status:');
if (allSet) {
  console.log('✅ All Google OAuth credentials configured');
  console.log('✅ Ready to test Google login');
  console.log('\n🚀 Test Commands:');
  console.log('cd apps/web && pnpm dev');
  console.log('Visit: http://localhost:3000');
  console.log('Click: "Sign in with Google"');
} else {
  console.log('❌ Google OAuth credentials not fully configured');
  console.log('📝 Run: nano .env.oauth.template');
  console.log(
    '📝 Then: cp .env.oauth.template .env.oauth && cat .env.oauth >> .env'
  );
}

console.log('\n🔗 Google Cloud Console Links:');
console.log('- APIs: https://console.cloud.google.com/apis/library');
console.log('- Credentials: https://console.cloud.google.com/apis/credentials');
console.log('- PubSub: https://console.cloud.google.com/cloudpubsub');
console.log(
  '- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent'
);

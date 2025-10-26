// Quick script to check if your environment variables are set up correctly

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking your environment setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: .env.local file not found!');
  console.log('\n📝 You need to create a .env.local file in your project root.\n');
  console.log('Follow the instructions in: QUICK_FIX_ENV.md\n');
  process.exit(1);
}

console.log('✅ .env.local file exists');

// Read the file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for Supabase URL
const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
const hasPlaceholderUrl = envContent.includes('placeholder.supabase.co') || 
                          envContent.includes('your-project-url-here') ||
                          envContent.includes('YOUR-PROJECT-REF');

if (!hasSupabaseUrl) {
  console.log('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  console.log('   Add your Supabase URL to .env.local\n');
  process.exit(1);
}

if (hasPlaceholderUrl) {
  console.log('⚠️  WARNING: You still have placeholder values in .env.local');
  console.log('   Replace them with your actual Supabase credentials\n');
  console.log('   Get them from: https://supabase.com/dashboard\n');
  process.exit(1);
}

console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set');

// Check for Supabase anon key
const hasAnonKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
const hasPlaceholderKey = envContent.includes('your-anon-key-here') || 
                          envContent.includes('YOUR-ANON-KEY') ||
                          envContent.includes('placeholder-key');

if (!hasAnonKey) {
  console.log('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
  console.log('   Add your Supabase anon key to .env.local\n');
  process.exit(1);
}

if (hasPlaceholderKey) {
  console.log('⚠️  WARNING: You still have placeholder values for anon key');
  console.log('   Replace with your actual Supabase anon key\n');
  console.log('   Get it from: https://supabase.com/dashboard > Settings > API\n');
  process.exit(1);
}

console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');

// Extract URL to show user
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
if (urlMatch) {
  const url = urlMatch[1].trim();
  console.log(`\n📍 Your Supabase URL: ${url}`);
  
  if (url.startsWith('https://') && url.endsWith('.supabase.co')) {
    console.log('✅ URL format looks correct!\n');
  } else {
    console.log('⚠️  URL format may be incorrect. Should be: https://xxxxx.supabase.co\n');
  }
}

console.log('🎉 Environment variables are configured!\n');
console.log('Next steps:');
console.log('1. Restart your dev server: pnpm dev');
console.log('2. Visit: http://localhost:3000/auth/login');
console.log('3. Set up Google OAuth: Follow GOOGLE_AUTH_CHECKLIST.md\n');


# Quick Reference - Certificate Schema Error Fix
# Windows PowerShell Version

Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CERTIFICATE SCHEMA ERROR - QUICK FIX GUIDE              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔴 ERROR" -ForegroundColor Red
Write-Host "   Could not find the 'credential_code' column of 'certificates' in the schema cache" -ForegroundColor Red
Write-Host ""

Write-Host "🎯 ROOT CAUSE" -ForegroundColor Yellow
Write-Host "   Database is missing 6 columns (credential_code, level, grade, etc.)" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ HOW TO FIX (2-5 minutes)" -ForegroundColor Green
Write-Host ""

Write-Host "   STEP 1: Open Supabase Dashboard" -ForegroundColor Green
Write-Host "   ──────────────────────────────────────" -ForegroundColor Green
Write-Host "   URL: https://app.supabase.com/" -ForegroundColor White
Write-Host "   Action: Sign in → Select KitchenOfTech project" -ForegroundColor White
Write-Host ""

Write-Host "   STEP 2: Open SQL Editor" -ForegroundColor Green
Write-Host "   ──────────────────────────────────────" -ForegroundColor Green
Write-Host "   Left Sidebar → SQL Editor → New Query" -ForegroundColor White
Write-Host ""

Write-Host "   STEP 3: Copy SQL from File" -ForegroundColor Green
Write-Host "   ──────────────────────────────────────" -ForegroundColor Green
Write-Host "   File: supabase/migrations/20260320_fix_certificate_schema.sql" -ForegroundColor White
Write-Host "   OR read: URGENT_CERTIFICATE_SCHEMA_FIX.md" -ForegroundColor White
Write-Host ""

Write-Host "   STEP 4: Run SQL" -ForegroundColor Green
Write-Host "   ──────────────────────────────────────" -ForegroundColor Green
Write-Host "   Click: [Run] button" -ForegroundColor White
Write-Host "   Wait for: ✓ Success" -ForegroundColor White
Write-Host ""

Write-Host "   STEP 5: Verify" -ForegroundColor Green
Write-Host "   ──────────────────────────────────────" -ForegroundColor Green
Write-Host "   npx ts-node scripts/verify-certificate-schema.ts" -ForegroundColor Cyan
Write-Host "   Expected: '✅ Certificate schema is correct!'" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📊 COLUMNS BEING ADDED" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. credential_code    →  Unique credential code (e.g., WEB-DEV-001)" -ForegroundColor White
Write-Host "  2. level              →  Proficiency level (Beginner/Intermediate/etc)" -ForegroundColor White  
Write-Host "  3. issue_date         →  When certificate was issued" -ForegroundColor White
Write-Host "  4. grade              →  Final score (0-100)" -ForegroundColor White
Write-Host "  5. institution        →  Issuing organization" -ForegroundColor White
Write-Host "  6. instructor_notes   →  Notes about certificate holder" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "🧪 TEST AFTER APPLYING MIGRATION" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Verify schema:" -ForegroundColor White
Write-Host "     npx ts-node scripts/verify-certificate-schema.ts" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Build project:" -ForegroundColor White
Write-Host "     npx next build" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Start dev server:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. Test in browser:" -ForegroundColor White
Write-Host "     http://localhost:3000/dashboard/certificates" -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "❓ TROUBLESHOOTING" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Error                        Solution" -ForegroundColor White
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  'Already exists'             → OK! Run full SQL again" -ForegroundColor White
Write-Host "  'Permission denied'          → Use service role key from .env.local" -ForegroundColor White
Write-Host "  'Schema cache not updated'   → Wait 30s and refresh page" -ForegroundColor White
Write-Host "  'Cannot connect'             → Check SUPABASE URL in .env.local" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📈 AFTER SUCCESSFUL MIGRATION" -ForegroundColor Green
Write-Host ""
Write-Host "  ✅ API endpoint: /api/dashboard/certificates/single-insert" -ForegroundColor Green
Write-Host "  ✅ API endpoint: /api/dashboard/certificates/batch-insert" -ForegroundColor Green
Write-Host "  ✅ API endpoint: /api/dashboard/certificates/csv-import" -ForegroundColor Green
Write-Host "  ✅ API endpoint: /api/education/certificate/verify-by-credential" -ForegroundColor Green
Write-Host "  ✅ Build: 102/102 pages, 0 errors" -ForegroundColor Green
Write-Host "  ✅ Dashboard: Certificate creation works" -ForegroundColor Green
Write-Host ""

Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TIME: 2-5 minutes  |  DIFFICULTY: Easy  |  RESULT: All Fixed ✅ ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

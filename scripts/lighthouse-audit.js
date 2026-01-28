const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const PAGES_TO_AUDIT = [
  { name: 'Homepage', url: 'http://localhost:3000/' },
  { name: 'Services', url: 'http://localhost:3000/services' },
  { name: 'Portfolio', url: 'http://localhost:3000/portfolio' },
  { name: 'Team', url: 'http://localhost:3000/team' },
  { name: 'Education', url: 'http://localhost:3000/education' },
  { name: 'Blog', url: 'http://localhost:3000/blog' },
  { name: 'Contact', url: 'http://localhost:3000/contact' },
  { name: 'Login', url: 'http://localhost:3000/login' },
];

const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['accessibility', 'best-practices', 'performance', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
};

async function runLighthouse(url, chrome) {
  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options, LIGHTHOUSE_CONFIG);

  return runnerResult.lhr;
}

async function main() {
  console.log('🚀 Starting Lighthouse audits...\n');

  // Create reports directory
  const reportsDir = path.join(__dirname, '..', 'lighthouse-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Launch Chrome
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const results = [];

  try {
    for (const page of PAGES_TO_AUDIT) {
      console.log(`📊 Auditing: ${page.name} (${page.url})`);

      try {
        const report = await runLighthouse(page.url, chrome);

        const result = {
          name: page.name,
          url: page.url,
          scores: {
            accessibility: Math.round(report.categories.accessibility.score * 100),
            performance: Math.round(report.categories.performance.score * 100),
            bestPractices: Math.round(report.categories['best-practices'].score * 100),
            seo: Math.round(report.categories.seo.score * 100),
          },
          accessibilityIssues: report.categories.accessibility.auditRefs
            .filter(ref => {
              const audit = report.audits[ref.id];
              return audit.score !== null && audit.score < 1;
            })
            .map(ref => {
              const audit = report.audits[ref.id];
              return {
                id: ref.id,
                title: audit.title,
                description: audit.description,
                score: audit.score,
              };
            }),
        };

        results.push(result);

        console.log(`  ✅ Accessibility: ${result.scores.accessibility}/100`);
        console.log(`  ⚡ Performance: ${result.scores.performance}/100`);
        console.log(`  📋 Best Practices: ${result.scores.bestPractices}/100`);
        console.log(`  🔍 SEO: ${result.scores.seo}/100\n`);
      } catch (error) {
        console.error(`  ❌ Error auditing ${page.name}:`, error.message);
        results.push({
          name: page.name,
          url: page.url,
          error: error.message,
        });
      }
    }
  } finally {
    await chrome.kill();
  }

  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    results,
    averageScores: {
      accessibility: Math.round(
        results
          .filter(r => !r.error)
          .reduce((sum, r) => sum + r.scores.accessibility, 0) / results.filter(r => !r.error).length
      ),
      performance: Math.round(
        results
          .filter(r => !r.error)
          .reduce((sum, r) => sum + r.scores.performance, 0) / results.filter(r => !r.error).length
      ),
      bestPractices: Math.round(
        results
          .filter(r => !r.error)
          .reduce((sum, r => sum + r.scores.bestPractices, 0) / results.filter(r => !r.error).length
      ),
      seo: Math.round(
        results
          .filter(r => !r.error)
          .reduce((sum, r) => sum + r.scores.seo, 0) / results.filter(r => !r.error).length
      ),
    },
    failingPages: results.filter(
      r => !r.error && (r.scores.accessibility < 90 || r.scores.performance < 75)
    ),
  };

  // Save JSON summary
  fs.writeFileSync(
    path.join(reportsDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 LIGHTHOUSE AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n📅 Timestamp: ${summary.timestamp}`);
  console.log(`\n📈 Average Scores:`);
  console.log(`  Accessibility: ${summary.averageScores.accessibility}/100`);
  console.log(`  Performance: ${summary.averageScores.performance}/100`);
  console.log(`  Best Practices: ${summary.averageScores.bestPractices}/100`);
  console.log(`  SEO: ${summary.averageScores.seo}/100`);

  if (summary.failingPages.length > 0) {
    console.log(`\n⚠️  Pages needing improvement:`);
    summary.failingPages.forEach(page => {
      console.log(`  - ${page.name}: A11y ${page.scores.accessibility}, Perf ${page.scores.performance}`);
    });
  } else {
    console.log(`\n✅ All pages meet quality thresholds!`);
  }

  console.log(`\n📁 Full report saved to: ${reportsDir}/summary.json`);
  console.log('='.repeat(60) + '\n');

  // Exit with error if accessibility is below 90
  if (summary.averageScores.accessibility < 90) {
    console.error('❌ Accessibility score is below 90. Please fix issues before deploying.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = process.env.BASE_URL || 'http://localhost:3003';
const OUT = './test-results/qa';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

// ====================================
// 1. Console errors + runtime check
// ====================================
console.log('\n━━━ Runtime check (1440x900) ━━━');
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

const consoleErrors = [];
const consoleWarnings = [];
const pageErrors = [];

page.on('console', (msg) => {
  const type = msg.type();
  const text = msg.text();
  if (type === 'error') consoleErrors.push(text);
  if (type === 'warning') consoleWarnings.push(text);
});
page.on('pageerror', (err) => pageErrors.push(err.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Scroll progresivo para disparar todos los reveal/ScrollTrigger y ver si explotan
const steps = [0, 1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000];
for (const y of steps) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await page.waitForTimeout(400);
}

console.log(`Page errors: ${pageErrors.length}`);
pageErrors.forEach((e) => console.log(`  ✗ ${e}`));
console.log(`Console errors: ${consoleErrors.length}`);
consoleErrors.forEach((e) => console.log(`  ✗ ${e.slice(0, 200)}`));
console.log(`Console warnings: ${consoleWarnings.length}`);
consoleWarnings.slice(0, 5).forEach((e) => console.log(`  ! ${e.slice(0, 200)}`));

// Screenshot específico del calculator (verificar fix de clases)
await page.evaluate(() => {
  const el = document.getElementById('simulador');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/calculator-desktop-fixed.png`, type: 'png' });

await ctx.close();

// ====================================
// 2. Mobile layout (375x812 iPhone)
// ====================================
console.log('\n━━━ Mobile layout (375x812) ━━━');
const mobileCtx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mpage = await mobileCtx.newPage();

await mpage.goto(URL, { waitUntil: 'networkidle' });
await mpage.waitForTimeout(1500);

async function forceAll(p) {
  await p.evaluate(() => {
    document.querySelectorAll('[data-reveal], [data-hero-reveal]').forEach((el) => {
      const e = el;
      e.style.opacity = '1';
      e.style.transform = 'none';
    });
    document.querySelectorAll('.hero-word').forEach((el) => {
      const e = el;
      e.style.transform = 'translateY(0)';
      e.style.opacity = '1';
    });
  });
}

const mobileShots = [
  { id: null, y: 0, file: 'mobile-01-hero.png' },
  { id: 'como-funciona', y: 0, file: 'mobile-02-features.png' },
  { id: 'analista-ia', y: 0, file: 'mobile-03-ai.png' },
  { id: 'simulador', y: 0, file: 'mobile-04-calculator.png' },
  { id: 'traccion', y: 0, file: 'mobile-05-social.png' },
  { id: 'seguridad', y: 0, file: 'mobile-06-security.png' },
  { id: 'faq', y: 0, file: 'mobile-07-faq.png' },
  { id: 'cta-final', y: 0, file: 'mobile-08-cta.png' },
];

for (const s of mobileShots) {
  if (s.id) {
    await mpage.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    }, s.id);
  } else {
    await mpage.evaluate(() => window.scrollTo(0, 0));
  }
  await mpage.waitForTimeout(500);
  await forceAll(mpage);
  await mpage.waitForTimeout(200);
  await mpage.screenshot({ path: `${OUT}/${s.file}`, type: 'png' });
  console.log(`  ✓ ${s.file}`);
}

await browser.close();

// Exit code según errores críticos
const critical = pageErrors.length + consoleErrors.filter((e) => !e.includes('favicon')).length;
console.log(`\n━━━ Summary ━━━\nCritical issues: ${critical}`);
process.exit(critical > 0 ? 1 : 0);

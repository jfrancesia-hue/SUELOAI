import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = 'http://localhost:3000';
const OUT = './test-results/landing-shots';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Helper: forzar todas las animaciones a estado final
async function forceAll() {
  await page.evaluate(() => {
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
    document.querySelectorAll('.stack-card').forEach((el, i) => {
      const e = el;
      e.style.transform = `translate(${i * 16}px, ${i * 36}px)`;
    });
    document.querySelectorAll('.chart-bar').forEach((el) => {
      const e = el;
      e.style.transform = 'scaleY(1)';
    });
  });
}

// Helper: screenshot de una sección por ID (captura altura variable)
async function shotById(id, file, label, { fullHeight = false, offset = 0 } = {}) {
  const y = await page.evaluate(
    (selId) => {
      const el = document.getElementById(selId);
      if (!el) return 0;
      return el.getBoundingClientRect().top + window.scrollY;
    },
    id
  );
  const targetY = Math.max(0, y + offset);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), targetY);
  await page.waitForTimeout(600);
  await forceAll();
  await page.waitForTimeout(300);

  if (fullHeight) {
    const h = await page.evaluate((selId) => {
      const el = document.getElementById(selId);
      return el?.getBoundingClientRect().height ?? 900;
    }, id);
    await page.screenshot({
      path: `${OUT}/${file}`,
      type: 'png',
      clip: { x: 0, y: 0, width: 1440, height: Math.min(h, 2000) },
    });
  } else {
    await page.screenshot({ path: `${OUT}/${file}`, type: 'png' });
  }
  console.log(`✓ ${label} → ${file} (y=${targetY})`);
}

// Helper: screenshot por scrollY directo
async function shotAt(y, file, label) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await page.waitForTimeout(500);
  await forceAll();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${file}`, type: 'png' });
  console.log(`✓ ${label} → ${file}`);
}

// 1. Hero
await shotAt(0, '01-hero.png', 'Hero');

// 2-3. Features
await shotById('como-funciona', '02-features-top.png', 'Features (top)');
await shotById('como-funciona', '03-features-bottom.png', 'Features (bottom)', { offset: 600 });

// 4. AI Analyst
await shotById('analista-ia', '04-ai-analyst.png', 'AI Analyst demo');

// 5-6. Sticky story (escenas 1 y 4)
await shotById('proceso', '05-sticky-scene1.png', 'Sticky story — escena 1');
// scroll a mitad del sticky para escena 3/4
const procesoTop = await page.evaluate(() => {
  const el = document.getElementById('proceso');
  return el?.getBoundingClientRect().top + window.scrollY ?? 0;
});
await shotAt(procesoTop + 2400, '06-sticky-scene4.png', 'Sticky story — escena 4');

// 7. Calculator
await shotById('calculadora', '07-calculator.png', 'Investment calculator');

// 8. Social proof
await shotById('traccion', '08-social-proof.png', 'Social proof');

// 9. Security
await shotById('seguridad', '09-security.png', 'Security section');

// 10. FAQ
await shotById('faq', '10-faq.png', 'FAQ');

// 11. Final CTA
await shotById('cta-final', '11-final-cta.png', 'Final CTA');

await browser.close();
console.log('\nDone! Screenshots en:', OUT);

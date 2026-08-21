import { chromium } from 'playwright';
import path from 'path';

async function capture() {
  console.log('🚀 Iniciando captura automática de screenshots em alta definição...');
  
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge', // Usa o Edge nativo do Windows
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // 2x Retina para máxima nitidez
  });

  await page.goto('http://localhost:5173/play.html', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#gameCanvas');
  await page.waitForTimeout(1500);

  // 1. Screenshot do Gabinete Arcade (Gameplay / Tela Inicial)
  console.log('📸 1/4 Capturando Gameplay / Gabinete...');
  const cabinetEl = await page.$('.cabinet-bezel');
  if (cabinetEl) {
    await cabinetEl.screenshot({
      path: path.join(process.cwd(), 'site', 'assets', 'images', 'gameplay-preview.png'),
    });
  }

  // 2. Screenshot das Conquistas Progressivas
  console.log('📸 2/4 Capturando Modal de Conquistas...');
  await page.click('#btnOpenAchievements');
  await page.waitForSelector('#achievementsModal.open');
  await page.waitForTimeout(600);
  const achContent = await page.$('#achievementsModal .editor-content');
  if (achContent) {
    await achContent.screenshot({
      path: path.join(process.cwd(), 'site', 'assets', 'images', 'achievements-preview.png'),
    });
  }
  await page.click('#btnCloseAchievements');
  await page.waitForTimeout(400);

  // 3. Screenshot da Lojinha de Upgrades & Skins
  console.log('📸 3/4 Capturando Modal da Lojinha...');
  await page.click('#btnOpenShop');
  await page.waitForSelector('#shopModal.open');
  await page.waitForTimeout(600);
  const shopContent = await page.$('#shopModal .editor-content');
  if (shopContent) {
    await shopContent.screenshot({
      path: path.join(process.cwd(), 'site', 'assets', 'images', 'shop-preview.png'),
    });
  }
  await page.click('#btnCloseShop');
  await page.waitForTimeout(400);

  // 4. Screenshot do Estúdio de Labirintos Compacto (54vw)
  console.log('📸 4/4 Capturando Modal do Estúdio de Labirintos...');
  await page.click('#btnOpenEditor');
  await page.waitForSelector('#editorModal.open');
  await page.waitForTimeout(600);
  const editorContent = await page.$('#editorModal .editor-content');
  if (editorContent) {
    await editorContent.screenshot({
      path: path.join(process.cwd(), 'site', 'assets', 'images', 'editor-preview.png'),
    });
  }
  await page.click('#btnCloseEditor');

  await browser.close();
  console.log('🎉 Todas as 4 screenshots capturadas com 100% de sucesso!');
}

capture().catch((err) => {
  console.error('Erro na captura:', err);
  process.exit(1);
});

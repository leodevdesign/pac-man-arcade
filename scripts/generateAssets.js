import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

async function generateAssets() {
  console.log('🎨 Iniciando geração de Favicons, Ícones e Imagem OpenGraph para Redes Sociais...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. GERAÇÃO DO ÍCONE / FAVICON (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        canvas {
          display: block;
        }
      </style>
    </head>
    <body>
      <canvas id="iconCanvas" width="512" height="512"></canvas>
      <script>
        const canvas = document.getElementById('iconCanvas');
        const ctx = canvas.getContext('2d');

        // Fundo circular roxo escuro com borda neon
        const center = 256;
        const radius = 240;

        // Sombra / Brilho Neon
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 35;

        // Gradiente do fundo do ícone
        const bgGrad = ctx.createRadialGradient(center, center, 40, center, center, radius);
        bgGrad.addColorStop(0, '#2d1054');
        bgGrad.addColorStop(0.7, '#140826');
        bgGrad.addColorStop(1, '#080412');

        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        // Borda Roxa Violeta
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#c084fc';
        ctx.stroke();

        ctx.shadowBlur = 0; // reseta sombra para desenhar o Pac-Man

        // Pac-Man Amarelo Dourado
        const pacX = 230;
        const pacY = 256;
        const pacRadius = 140;

        // Brilho do Pac-Man
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 25;

        const pacGrad = ctx.createRadialGradient(pacX - 30, pacY - 30, 20, pacX, pacY, pacRadius);
        pacGrad.addColorStop(0, '#fff475');
        pacGrad.addColorStop(0.5, '#ffe600');
        pacGrad.addColorStop(1, '#e6b800');

        ctx.fillStyle = pacGrad;
        ctx.beginPath();
        const startAngle = 0.25 * Math.PI;
        const endAngle = 1.75 * Math.PI;
        ctx.arc(pacX, pacY, pacRadius, startAngle, endAngle, false);
        ctx.lineTo(pacX, pacY);
        ctx.closePath();
        ctx.fill();

        // Olho do Pac-Man
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0d051c';
        ctx.beginPath();
        ctx.arc(pacX + 25, pacY - 70, 18, 0, Math.PI * 2);
        ctx.fill();

        // Pastilhas de Energia (Dots)
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';

        // Pastilha 1
        ctx.beginPath();
        ctx.arc(380, 256, 18, 0, Math.PI * 2);
        ctx.fill();

        // Pastilha 2 (Energizer maior)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(435, 256, 14, 0, Math.PI * 2);
        ctx.fill();
      </script>
    </body>
    </html>
  `);

  await page.waitForTimeout(500);
  const iconCanvas = await page.$('#iconCanvas');

  const publicDir = path.join(process.cwd(), 'public');
  const buildDir = path.join(process.cwd(), 'build');
  const siteAssetsDir = path.join(process.cwd(), 'site', 'assets', 'images');

  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(buildDir, { recursive: true });
  fs.mkdirSync(siteAssetsDir, { recursive: true });

  const icon512Path = path.join(buildDir, 'icon.png');
  const faviconPath = path.join(publicDir, 'favicon.png');
  const siteFaviconPath = path.join(siteAssetsDir, 'favicon.png');

  await iconCanvas.screenshot({ path: icon512Path });
  await iconCanvas.screenshot({ path: faviconPath });
  await iconCanvas.screenshot({ path: siteFaviconPath });
  console.log('✅ Favicon e Icon PNG (512x512) gerados com sucesso!');

  // Gera o icon.ico nativo Windows com múltiplos tamanhos
  const icoBuffer = await pngToIco(icon512Path);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✅ icon.ico e favicon.ico gerados com sucesso!');

  // 2. GERAÇÃO DA IMAGEM OPEN GRAPH (1200x630) PARA REDES SOCIAIS
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700;800&family=Press+Start+2P&family=Inter:wght@600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1200px;
          height: 630px;
          background: #080412;
          background: radial-gradient(circle at 75% 30%, #351268 0%, #15072d 45%, #05020a 100%);
          color: #f3e8ff;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: row;
          padding: 60px 70px;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        /* Grade de fundo sutil */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .glow-sphere {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(0,0,0,0) 70%);
          top: -100px;
          left: -100px;
          pointer-events: none;
        }

        .left-content {
          max-width: 650px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124, 58, 237, 0.25);
          border: 1.5px solid #a855f7;
          color: #d8b4fe;
          font-family: 'Chakra Petch', sans-serif;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 6px 14px;
          border-radius: 20px;
          width: fit-content;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #00ff66;
          border-radius: 50%;
          box-shadow: 0 0 8px #00ff66;
        }

        .main-title {
          font-family: 'Chakra Petch', sans-serif;
          font-size: 52px;
          font-weight: 800;
          line-height: 1.05;
          color: #ffffff;
          letter-spacing: -1px;
        }

        .text-gradient {
          background: linear-gradient(135deg, #ffe600 0%, #ff69b4 60%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tagline {
          font-size: 20px;
          color: #c4b5fd;
          line-height: 1.4;
          font-weight: 600;
        }

        .features-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .feature-tag {
          background: rgba(26, 12, 50, 0.85);
          border: 1.5px solid rgba(168, 85, 247, 0.5);
          padding: 8px 14px;
          border-radius: 10px;
          font-family: 'Chakra Petch', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #f3e8ff;
        }

        .right-graphic {
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .arcade-card {
          background: rgba(20, 8, 42, 0.9);
          border: 3px solid #7c3aed;
          box-shadow: 0 0 50px rgba(124, 58, 237, 0.5);
          border-radius: 24px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .pacman-big {
          font-size: 100px;
          line-height: 1;
          filter: drop-shadow(0 0 20px rgba(255, 230, 0, 0.6));
        }

        .ghosts-row {
          display: flex;
          gap: 14px;
          font-size: 38px;
        }

        .platform-badge {
          background: #7c3aed;
          color: #ffffff;
          font-family: 'Chakra Petch', sans-serif;
          font-size: 13px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 8px;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="glow-sphere"></div>

      <div class="left-content">
        <div class="badge-pill">
          <span class="pulse-dot"></span>
          <span>NEXT AUTOMATIK • DEFINITIVE EDITION</span>
        </div>

        <h1 class="main-title">
          PAC-MAN ARCADE<br />
          <span class="text-gradient">TOTALMENTE REINVENTADO</span>
        </h1>

        <p class="tagline">
          IA Autêntica dos 4 Fantasmas • 150 Conquistas • Lojinha de Upgrades • Criador de Labirintos • 5 Modos de Jogo
        </p>

        <div class="features-row">
          <div class="feature-tag">🏆 150 Conquistas</div>
          <div class="feature-tag">👥 2P Co-op & Versus</div>
          <div class="feature-tag">🛠️ Estúdio Criador</div>
          <div class="feature-tag">🎁 100% Gratuito</div>
        </div>
      </div>

      <div class="right-graphic">
        <div class="arcade-card">
          <div class="pacman-big">🟡</div>
          <div class="ghosts-row">
            <span>🔴</span>
            <span>🌸</span>
            <span>🩵</span>
            <span>🟠</span>
          </div>
          <div class="platform-badge">PC WINDOWS (.EXE) & WEB</div>
        </div>
      </div>
    </body>
    </html>
  `);

  await page.waitForTimeout(600);
  const ogImagePath = path.join(publicDir, 'og-image.png');
  const siteOgImagePath = path.join(siteAssetsDir, 'og-image.png');

  await page.screenshot({ path: ogImagePath });
  await page.screenshot({ path: siteOgImagePath });
  console.log('✅ Imagem Open Graph (1200x630) gerada com sucesso em public/og-image.png!');

  await browser.close();
  console.log('🎉 Todos os assets visuais e ícones gerados com 100% de perfeição!');
}

generateAssets().catch(err => {
  console.error('Erro na geração de assets:', err);
  process.exit(1);
});

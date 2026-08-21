import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

async function generateAssets() {
  console.log('🎨 Iniciando geração de Favicons Transparentes, Ícones e Banner OpenGraph...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. GERAÇÃO DO FAVICON / ÍCONE COM FUNDO 100% TRANSPARENTE
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          background: transparent !important;
        }
        canvas {
          background: transparent !important;
        }
      </style>
    </head>
    <body>
      <canvas id="iconCanvas" width="512" height="512"></canvas>
      <script>
        const canvas = document.getElementById('iconCanvas');
        const ctx = canvas.getContext('2d');

        // Garante transparência total
        ctx.clearRect(0, 0, 512, 512);

        const pacX = 230;
        const pacY = 256;
        const pacRadius = 175;

        // 1. Contorno Neon Roxo / Violeta (Next Automatik Identity)
        ctx.save();
        ctx.shadowColor = '#9333ea';
        ctx.shadowBlur = 30;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 18;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const startAngle = 0.26 * Math.PI;
        const endAngle = 1.74 * Math.PI;
        ctx.arc(pacX, pacY, pacRadius + 4, startAngle, endAngle, false);
        ctx.lineTo(pacX, pacY);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // 2. Corpo do Pac-Man (Amarelo Vibrante com Gradiente Radial)
        ctx.save();
        const pacGrad = ctx.createRadialGradient(pacX - 40, pacY - 40, 20, pacX, pacY, pacRadius);
        pacGrad.addColorStop(0, '#fff677');
        pacGrad.addColorStop(0.65, '#ffe600');
        pacGrad.addColorStop(1, '#e5b700');

        ctx.fillStyle = pacGrad;
        ctx.beginPath();
        ctx.arc(pacX, pacY, pacRadius, startAngle, endAngle, false);
        ctx.lineTo(pacX, pacY);
        ctx.closePath();
        ctx.fill();

        // Borda interna suave
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

        // 3. Olho do Pac-Man (Roxo Escuro Profundo)
        ctx.save();
        ctx.fillStyle = '#140826';
        ctx.beginPath();
        ctx.arc(pacX + 30, pacY - 85, 22, 0, Math.PI * 2);
        ctx.fill();

        // Brilho do olho
        ctx.fillStyle = '#f3e8ff';
        ctx.beginPath();
        ctx.arc(pacX + 36, pacY - 90, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Pastilhas de Energia (Dots) com Brilho Neon Violeta/Dourado
        ctx.save();
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 18;

        // Pastilha 1 (Branca)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(425, 256, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Pastilha 2 (Dourada)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(485, 256, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      </script>
    </body>
    </html>
  `);

  await page.waitForTimeout(400);

  // Extrai os dados em formato PNG direto do Canvas (100% transparente)
  const base64Data = await page.evaluate(() => {
    const canvas = document.getElementById('iconCanvas');
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const iconPngBuffer = Buffer.from(base64Data, 'base64');

  const publicDir = path.join(process.cwd(), 'public');
  const buildDir = path.join(process.cwd(), 'build');
  const siteAssetsDir = path.join(process.cwd(), 'site', 'assets', 'images');

  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(buildDir, { recursive: true });
  fs.mkdirSync(siteAssetsDir, { recursive: true });

  const icon512Path = path.join(buildDir, 'icon.png');
  const faviconPath = path.join(publicDir, 'favicon.png');
  const siteFaviconPath = path.join(siteAssetsDir, 'favicon.png');

  fs.writeFileSync(icon512Path, iconPngBuffer);
  fs.writeFileSync(faviconPath, iconPngBuffer);
  fs.writeFileSync(siteFaviconPath, iconPngBuffer);
  console.log('✅ Favicon PNG Transparente (sem fundo branco) gerado com sucesso!');

  // Gera o icon.ico nativo Windows com múltiplos tamanhos a partir do PNG transparente
  const icoBuffer = await pngToIco(icon512Path);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✅ icon.ico e favicon.ico transparentes gerados com sucesso!');

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
          background: radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(0,0,0,0) 70%);
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

  await page.waitForTimeout(500);
  const ogImagePath = path.join(publicDir, 'og-image.png');
  const siteOgImagePath = path.join(siteAssetsDir, 'og-image.png');

  await page.screenshot({ path: ogImagePath });
  await page.screenshot({ path: siteOgImagePath });
  console.log('✅ Imagem Open Graph (1200x630) gerada com sucesso em public/og-image.png!');

  await browser.close();
  console.log('🎉 Todos os assets visuais transparentes gerados com sucesso!');
}

generateAssets().catch(err => {
  console.error('Erro na geração de assets:', err);
  process.exit(1);
});

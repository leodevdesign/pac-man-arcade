export class GhostGuideModal {
  private modalEl: HTMLElement | null = null;
  private closeBtnEl: HTMLElement | null = null;

  constructor() {
    this.createModalDOM();
    this.initEvents();
  }

  private createModalDOM() {
    let existing = document.getElementById('ghostGuideModal');
    if (existing) {
      this.modalEl = existing;
      this.closeBtnEl = document.getElementById('btnCloseGhostGuide');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'ghostGuideModal';
    modal.className = 'arcade-modal-overlay hidden';
    modal.innerHTML = `
      <div class="arcade-modal-box ghost-guide-box">
        <div class="arcade-modal-header">
          <h2 class="arcade-modal-title">👻 BESTIÁRIO DOS FANTASMAS</h2>
          <button class="arcade-modal-close" id="btnCloseGhostGuide">✕</button>
        </div>

        <div class="ghost-guide-body">
          <p class="ghost-guide-intro">
            Cada fantasma possui sua própria inteligência artificial e personalidade clássica original do Arcade de 1980. Conheça seus padrões de perseguição:
          </p>

          <div class="ghost-guide-grid">
            <!-- Blinky -->
            <div class="ghost-guide-card card-blinky">
              <div class="ghost-guide-header">
                <div class="ghost-guide-avatar ghost-red-glow">🔴</div>
                <div class="ghost-guide-meta">
                  <div class="ghost-guide-name">BLINKY <span class="ghost-nickname">("Sombra")</span></div>
                  <div class="ghost-guide-role">O Caçador Incansável</div>
                </div>
              </div>
              <p class="ghost-guide-desc">
                Persegue o Pac-Man diretamente pelo menor caminho geométrico. É o líder mais agressivo do grupo.
              </p>
              <div class="ghost-guide-perk">
                ⚡ <strong>Cruise Elroy:</strong> Conforme as pastilhas acabam no mapa, Blinky acelera gradualmente até superar a velocidade do Pac-Man!
              </div>
            </div>

            <!-- Pinky -->
            <div class="ghost-guide-card card-pinky">
              <div class="ghost-guide-header">
                <div class="ghost-guide-avatar ghost-pink-glow">🌸</div>
                <div class="ghost-guide-meta">
                  <div class="ghost-guide-name">PINKY <span class="ghost-nickname">("Veloz")</span></div>
                  <div class="ghost-guide-role">A Emboscadora Estrategista</div>
                </div>
              </div>
              <p class="ghost-guide-desc">
                Não segue suas pegadas: tenta cortar caminho calculando <strong>4 blocos à frente</strong> da direção para onde você está andando.
              </p>
              <div class="ghost-guide-perk">
                🎯 <strong>Dica Tática:</strong> Virar de frente para Pinky força o algoritmo a recalcular a rota, facilitando desvios em cruzamentos.
              </div>
            </div>

            <!-- Inky -->
            <div class="ghost-guide-card card-inky">
              <div class="ghost-guide-header">
                <div class="ghost-guide-avatar ghost-cyan-glow">🔷</div>
                <div class="ghost-guide-meta">
                  <div class="ghost-guide-name">INKY <span class="ghost-nickname">("Tímido")</span></div>
                  <div class="ghost-guide-role">O Mestre da Pinça</div>
                </div>
              </div>
              <p class="ghost-guide-desc">
                O mais imprevisível de todos. Sua IA calcula um vetor geométrico que combina a posição do Pac-Man com a posição do <strong>Blinky</strong>.
              </p>
              <div class="ghost-guide-perk">
                📐 <strong>Dica Tática:</strong> Se Blinky estiver longe de você, Inky se torna passivo; se Blinky estiver perto, Inky tenta fechar seu cerco.
              </div>
            </div>

            <!-- Clyde -->
            <div class="ghost-guide-card card-clyde">
              <div class="ghost-guide-header">
                <div class="ghost-guide-avatar ghost-orange-glow">🍊</div>
                <div class="ghost-guide-meta">
                  <div class="ghost-guide-name">CLYDE <span class="ghost-nickname">("Fingido")</span></div>
                  <div class="ghost-guide-role">O Solitário Covarde</div>
                </div>
              </div>
              <p class="ghost-guide-desc">
                Quando está longe (mais de 8 blocos), corre atrás do Pac-Man. Ao se aproximar a menos de 8 blocos, se assusta e foge para o canto inferior esquerdo.
              </p>
              <div class="ghost-guide-perk">
                🛡️ <strong>Dica Tática:</strong> Ficar próximo a ele impede que ele persiga você, criando uma zona segura temporária.
              </div>
            </div>
          </div>

          <!-- Tabela de Pontos -->
          <div class="ghost-score-table">
            <div class="ghost-score-title">⭐ PONTUAÇÃO DE FANTASMAS COMIDOS (CADEIA DE ENERGIZER)</div>
            <div class="ghost-score-row">
              <div class="ghost-score-item">1º Fantasma: <strong>200 pts</strong></div>
              <div class="ghost-score-item">2º Fantasma: <strong>400 pts</strong></div>
              <div class="ghost-score-item">3º Fantasma: <strong>800 pts</strong></div>
              <div class="ghost-score-item">4º Fantasma: <strong>1.600 pts</strong></div>
            </div>
            <div class="ghost-score-total">Combo Completo dos 4 Fantasmas = <strong>3.000 Pontos Extras!</strong></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.closeBtnEl = document.getElementById('btnCloseGhostGuide');
  }

  private initEvents() {
    this.closeBtnEl?.addEventListener('click', () => this.hide());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  public show() {
    this.modalEl?.classList.remove('hidden');
  }

  public hide() {
    this.modalEl?.classList.add('hidden');
  }
}

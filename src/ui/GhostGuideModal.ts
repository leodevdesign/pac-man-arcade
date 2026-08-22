export class GhostGuideModal {
  private modalEl: HTMLElement | null = null;
  private closeBtnEl: HTMLElement | null = null;

  constructor() {
    this.modalEl = document.getElementById('ghostGuideModal');
    this.closeBtnEl = document.getElementById('btnCloseGhostGuide');
    this.initEvents();
  }

  private initEvents() {
    this.closeBtnEl?.addEventListener('click', () => this.hide());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl?.classList.contains('open')) {
        this.hide();
      }
    });
  }

  public show() {
    this.modalEl?.classList.add('open');
  }

  public hide() {
    this.modalEl?.classList.remove('open');
  }
}

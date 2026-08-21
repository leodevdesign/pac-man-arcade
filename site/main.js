// JavaScript para Interatividade da Landing Page Pac-Man Arcade
document.addEventListener('DOMContentLoaded', () => {
  // 1. Alternância de Abas na Seção Galeria / Showcase
  const tabButtons = document.querySelectorAll('.tab-btn');
  const showcasePanels = document.querySelectorAll('.showcase-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;

      // Atualiza botões
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Atualiza painéis com animação suave
      showcasePanels.forEach((panel) => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // 2. Accordion na Seção de FAQ (Perguntas Frequentes)
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');

      // Fecha todos os outros itens
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
      });

      // Se não estava aberto, abre
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 3. Clique no Botão de Download (.exe) antes de subir o executável
  const btnDownloadExe = document.getElementById('btnDownloadExe');
  if (btnDownloadExe) {
    btnDownloadExe.addEventListener('click', (e) => {
      if (btnDownloadExe.getAttribute('href') === '#') {
        e.preventDefault();
        alert(
          '🎮 O executável do Windows está sendo preparado para o próximo release no GitHub!\n\nVocê já pode experimentar a versão 100% completa clicando em "Jogar no Navegador"!'
        );
      }
    });
  }

  // 4. Efeito de parallax suave no mockup do herói
  const mockup = document.querySelector('.arcade-cabinet-mockup');
  if (mockup && window.innerWidth > 900) {
    window.addEventListener('mousemove', (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
      mockup.style.transform = `perspective(1000px) rotateY(${xAxis - 4}deg) rotateX(${yAxis + 2}deg)`;
    });
  }
});

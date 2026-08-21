# 🕹️ Pac-Man Arcade: Definitive Edition

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/Web_Audio_API-333333?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-100%25_Playable-success?style=for-the-badge" />
</p>

Uma recriação completa e definitiva do clássico **Pac-Man Arcade (1980)** desenvolvida em **TypeScript Puro + HTML5 Canvas**, com fidelidade matemática aos algoritmos originais da Namco/Midway, enriquecida com recursos modernos: **5 Modos de Jogo Inéditos**, **7 Labirintos Temáticos e Gerador Procedural**, **50 Conquistas Progressivas (150 Tiers)**, **Lojinha de Upgrades Multi-Nível**, **8 Skins Pixel-Art** e **Sintetizador de Áudio Web Audio API**.

---

## 🌟 Principais Recursos

### 👻 IAs Autênticas dos Fantasmas (Namco 1980 Exact AI)
- **🔴 Blinky (Shadow):** Perseguição implacável direta à coordenada exata do Pac-Man com aceleração *Cruise Elroy* nos estágios finais.
- **🌸 Pinky (Speedy):** Especialista em emboscadas, mirando 4 tiles à frente da posição do jogador (incluindo o famoso overflow original ao mirar para cima).
- **🔷 Inky (Bashful):** Movimento em pinça dupla vetorial usando o dobro do vetor entre Blinky e a posição 2 tiles à frente do Pac-Man.
- **🍊 Clyde (Pokey):** Caçador covarde — persegue quando está a mais de 8 tiles de distância e recua para o canto inferior esquerdo quando se aproxima.

---

### 👥 5 Modos de Jogo Inéditos
1. **🟡 Clássico 1P:** A experiência lendária dos fliperamas de 1980 com temporizadores de Dispersão (Scatter) e Perseguição (Chase).
2. **👻 Modo Invertido (Ghost Hunter):** Você assume o controle do Fantasma Blinky e tenta capturar uma IA inteligente do Pac-Man que devora o mapa!
3. **👥 2P Co-op (Pac & Ms. Pac):** Dois jogadores no mesmo teclado compartilhando o mapa e unindo forças contra os 4 fantasmas.
4. **⚔️ 2P Versus (Pac vs Blinky):** Um jogador controla o Pac-Man e o segundo assume o comando do Fantasma Vermelho em combate direto!
5. **⚡ Modo Turbo (Frenesi 2x):** Velocidade dobrada, fantasmas implacáveis em modo Chase permanente e pontuação em dobro.

---

### 🗺️ Labirintos e Mapas Criativos
- 🟡 **Clássico 1980:** O labirinto icônico original com túneis bilaterais e interseções proibidas.
- 🌸 **Ms. Pac-Man Rosa (1):** Corredores duplos com túneis duplos no topo e na base.
- 🍊 **Ms. Pac-Man Laranja (2):** Labirinto vertical com zonas centrais de fuga.
- 🔷 **Ms. Pac-Man Ciano (3):** Túneis laterais quádruplos de alta velocidade.
- 🟤 **Ms. Pac-Man Dourado (4):** Layout desafiador de formato espiral.
- 🌐 **Google 30th Anniversary:** O lendário doodle comemorativo em formato das letras "GOOGLE".
- 🔤 **PAC-MAN Typography:** Labirinto desenhado exclusivamente com as letras "PACMAN".
- 🎲 **Gerador Procedural:** Algoritmo recursivo com garantia de simetria bilateral e caminhos 100% jogáveis.
- 🛠️ **Editor de Labirintos Integrado:** Crie, teste, exporte e importe seus próprios mapas em JSON.

---

### ⚡ Power-Ups Especiais no Mapa
Surgem dinamicamente a cada 20 a 30 segundos no corredor central do labirinto:
- 💣 **Bomba Flashbang:** Onda de choque luminosa que atordoa e paralisa os fantasmas em área por 1 a 4 segundos.
- 🧲 **Super Ímã:** Cria um vórtice magnético que atrai e devora pastilhas num raio de até 8 tiles.
- 🛡️ **Escudo de Energia:** Absorve de 1 a 4 colisões fatais com fantasmas antes de se romper.
- ⏳ **Relógio de Congelamento:** Emite um cristal sonoro e paralisa totalmente os 4 fantasmas.

---

### 🏪 Lojinha de Upgrades & Skins Temáticas
- **7 Trilhas de Upgrades Multi-Nível:** Vidas Iniciais (+1 a +2 vidas), Frutas Turbinadas (+10% a +50%), Pílulas Estendidas (+0.25s a +5.0s), Super Ímã, Bomba, Escudo e Congelamento.
- **Mecânica de Vidas Acumuladas:** Concluir qualquer fase sem morrer concede **+1 Vida Extra Acumulada** sem limite máximo!
- **8 Skins Pixel-Art:** Clássico, Óculos Escuros (Thug Life), Pac Dourado com Estrelas, Ms. Pac-Man, Pac de Natal, Pac de Halloween, Pac de Páscoa e Cyber Mecha.

---

### 🏆 50 Conquistas Progressivas (150 Tiers)
Dashboard amplo e legível com 50 missões divididas em 3 níveis cada (Bronze, Prata, Ouro), acompanhamento de estrelas de maestria e recompensas automáticas em moedas.

---

## ⌨️ Controles

| Ação | Teclas Jogador 1 (P1) | Teclas Jogador 2 (P2) |
| :--- | :---: | :---: |
| **Mover para Cima** | `↑` (Seta Cima) | `W` |
| **Mover para Baixo** | `↓` (Seta Baixo) | `S` |
| **Mover para Esquerda** | `←` (Seta Esquerda) | `A` |
| **Mover para Direita** | `→` (Seta Direita) | `D` |
| **Pausar / Retomar** | `P` ou Botão UI | - |
| **Mutar Efeitos Sonoros**| `M` ou Botão UI | - |
| **Ligar/Desligar Sirene**| `S` ou Botão UI | - |
| **Debug IAs dos Fantasmas**| `H` ou Botão UI | - |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)

### Instalação & Execução

```bash
# 1. Clone o repositório
git clone https://github.com/leodevdesign/pac-man-arcade.git

# 2. Acesse a pasta do projeto
cd pac-man-arcade

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Abra no navegador:
# http://localhost:5173/
```

### Compilação de Produção & Testes

```bash
# Executa a bateria de testes automatizados
node scripts/testSuite.js

# Compila o bundle para produção (TypeScript + Vite)
npm run build
```

---

## 🛠️ Tecnologias Utilizadas
- **Linguagem:** TypeScript 5+ (Strict Mode)
- **Bundler:** Vite 5
- **Renderização:** HTML5 2D Canvas com escala por pixel art (`image-rendering: pixelated`)
- **Áudio:** Web Audio API com osciladores senoidais, dente de serra e gerador de ruído branco
- **Estilização:** CSS3 Glassmorphism, Google Fonts (`Chakra Petch`, `Press Start 2P`)

---

## 📄 Licença
Este projeto foi desenvolvido para fins educacionais e de entretenimento. Pac-Man é uma marca registrada da Bandai Namco Entertainment Inc.

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // 📱 DETECTA MOBILE
  // ===============================
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // ===============================
  // 🎮 ESTADO
  // ===============================
  let audioLiberado = false;
  let jogoIniciado = false;
  let dragging = false;

  // ===============================
  // 🎮 ELEMENTOS
  // ===============================
  const player = document.getElementById("player");
  const game = document.getElementById("game");
  const contadorEl = document.getElementById("contador");
  const jumpscare = document.getElementById("jumpscare");
  const som = document.getElementById("som");
  const bgm = document.getElementById("bgm");
  const startScreen = document.getElementById("startScreen");
  const startBtn = document.getElementById("startBtn");
  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("stick");

  // ===============================
  // 📍 POSIÇÃO E FÍSICA
  // ===============================
  let x = 100;
  let y = 100;
  let moedas = 0;
  let velocityX = 0;
  let velocityY = 0;
  let currentAngle = 0;

  const playerSize = isMobile ? 60 : 80;
  const acceleration = isMobile ? 0.25 : 0.35;
  const friction = 0.92;
  const maxSpeedMobile = 3.5; // Velocidade máxima no joystick

  player.style.width = playerSize + "px";
  player.style.height = playerSize + "px";
  player.style.display = "none";
  game.style.opacity = "0";

  // ===============================
  // 🎮 INICIAR JOGO
  // ===============================
  startBtn.addEventListener("click", async () => {
    jogoIniciado = true;
    startScreen.style.display = "none";
    player.style.display = "block";
    game.style.opacity = "1";

    if (game.querySelectorAll(".coin").length === 0) {
      for (let i = 0; i < 10; i++) criarMoeda();
    }

    try {
      await bgm.play();
      bgm.pause();
      bgm.currentTime = 0;
      audioLiberado = true;
      bgm.volume = 0.3;
      bgm.play();
    } catch (err) {
      console.log("Erro áudio:", err);
    }
  });

  // ===============================
  // 🎮 TECLADO
  // ===============================
  const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowdown: false,
    arrowleft: false,
    arrowright: false,
  };

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = true;
  });

  document.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = false;
  });

  // ===============================
  // 🎮 JOYSTICK MOBILE (NORMALIZADO)
  // ===============================
  if (joystick && stick) {
    const handleStart = () => {
      dragging = true;
    };
    const handleEnd = () => {
      dragging = false;
      stick.style.transform = "translate(0px, 0px)";
      velocityX = 0;
      velocityY = 0;
    };

    joystick.addEventListener("touchstart", handleStart);
    window.addEventListener("touchend", handleEnd); // Window para não travar se soltar fora

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging) return;

        const rect = joystick.getBoundingClientRect();
        const touch = e.touches[0];

        // Centro do joystick
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;

        const maxRadius = 40;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Limita visualmente o stick
        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        stick.style.transform = `translate(${dx}px, ${dy}px)`;

        // Lógica de velocidade proporcional
        const intensity = Math.min(dist / maxRadius, 1);
        const angle = Math.atan2(dy, dx);

        velocityX = Math.cos(angle) * maxSpeedMobile * intensity;
        velocityY = Math.sin(angle) * maxSpeedMobile * intensity;
      },
      { passive: false },
    );
  }

  // ===============================
  // 🛠️ FUNÇÕES DE SUPORTE
  // ===============================
  function aplicarLimites() {
    const w = game.clientWidth;
    const h = game.clientHeight;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > w - playerSize) x = w - playerSize;
    if (y > h - playerSize) y = h - playerSize;
  }

  function atualizarPosicao() {
    player.style.left = x + "px";
    player.style.top = y + "px";
  }

  function criarMoeda() {
    const coin = document.createElement("div");
    coin.classList.add("coin");
    const size = isMobile ? 25 : 40;
    coin.style.width = size + "px";
    coin.style.height = size + "px";
    coin.style.left = Math.random() * (game.clientWidth - size) + "px";
    coin.style.top = Math.random() * (game.clientHeight - size) + "px";
    game.appendChild(coin);
  }

  function criarRastro() {
    const p = document.createElement("div");
    p.classList.add("particle");
    p.style.left = x + playerSize / 2 + "px";
    p.style.top = y + playerSize / 2 + "px";
    game.appendChild(p);
    setTimeout(() => p.remove(), 500);
  }

  function verificarColisao() {
    document.querySelectorAll(".coin").forEach((coin) => {
      const c = coin.getBoundingClientRect();
      const p = player.getBoundingClientRect();
      if (
        p.left < c.right &&
        p.right > c.left &&
        p.top < c.bottom &&
        p.bottom > c.top
      ) {
        coin.remove();
        moedas++;
        contadorEl.innerText = moedas;
        if (moedas === 6) ativarJumpscare();
      }
    });
  }

  // ===============================
  // 💀 JUMPSCARE (COM VOLUME E DURAÇÃO)
  // ===============================
  function ativarJumpscare() {
    jumpscare.style.display = "block";

    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }

    if (audioLiberado && som) {
      // 🔊 AJUSTE DE VOLUME (0.0 a 1.0)
      // 0.5 é 50% do volume original
      som.volume = 0.3;

      som.currentTime = 0;
      som.play().catch(() => {});

      // 🕒 AJUSTE DE DURAÇÃO (em milissegundos)
      // 1500 = 1.5 segundos. Depois disso, o som para.
      setTimeout(() => {
        som.pause();
        som.currentTime = 0; // Reseta para o início
      }, 1500);
    }

    document.body.classList.add("shake");
    setTimeout(() => {
      document.body.classList.remove("shake");
    }, 1000);
  }

  // ===============================
  // 🔄 LOOP PRINCIPAL
  // ===============================
  function gameLoop() {
    if (jogoIniciado) {
      if (!dragging) {
        if (keys.w || keys.arrowup) velocityY -= acceleration;
        if (keys.s || keys.arrowdown) velocityY += acceleration;
        if (keys.a || keys.arrowleft) velocityX -= acceleration;
        if (keys.d || keys.arrowright) velocityX += acceleration;
        velocityX *= friction;
        velocityY *= friction;
      }

      x += velocityX;
      y += velocityY;

      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (speed > 0.5) {
        criarRastro();
        const targetAngle =
          Math.atan2(velocityY, velocityX) * (180 / Math.PI) + 90;
        let diff = targetAngle - currentAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        currentAngle += diff * 0.2;
        player.style.transform = `rotate(${currentAngle}deg)`;
      }

      aplicarLimites();
      atualizarPosicao();
      verificarColisao();
    }
    requestAnimationFrame(gameLoop);
  }

  // Inicia o loop
  gameLoop();
});

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // 🎮 ESTADO
    // ===============================
    let audioLiberado = false;
    let jogoIniciado = false;

    // ===============================
    // 🎮 ELEMENTOS
    // ===============================
    const player = document.getElementById("player");
    const game = document.getElementById("game");
    const contadorEl = document.getElementById("contador");

    const jumpscare = document.getElementById("jumpscare");
    const som = document.getElementById("som");     // jumpscare
    const bgm = document.getElementById("bgm");     // música

    const startScreen = document.getElementById("startScreen");
    const startBtn = document.getElementById("startBtn");

    // ===============================
    // 🔒 ESTADO INICIAL
    // ===============================
    player.style.display = "none";
    game.style.opacity = "0";

    // ===============================
    // 🎮 BOTÃO INICIAR
    // ===============================
    startBtn.addEventListener("click", () => {

    console.log("JOGO INICIADO 🚀");

    jogoIniciado = true;

    // 🎮 mostrar jogo
    startScreen.style.display = "none";
    player.style.display = "block";
    game.style.opacity = "1";

    // 🪙 criar moedas
    for (let i = 0; i < 10; i++) criarMoeda();

    // 🔥 FORÇAR LIBERAÇÃO DE ÁUDIO
    const unlockAudio = () => {
        som.muted = true;
        som.play()
            .then(() => {
                som.pause();
                som.currentTime = 0;
                som.muted = false;

                audioLiberado = true;
                console.log("🔊 Áudio liberado");

                // 🎵 tocar música
                if (bgm) {
                    bgm.volume = 0.3;
                    bgm.play().then(() => {
                        console.log("🎵 BGM tocando");
                    }).catch(err => console.log("Erro BGM:", err));
                }

            })
            .catch(err => console.log("Erro unlock:", err));
    };

    unlockAudio();
});

    // ===============================
    // 📍 POSIÇÃO
    // ===============================
    let x = 100;
    let y = 100;
    let moedas = 0;

    const playerSize = 80;

    // ===============================
    // 🚀 FÍSICA
    // ===============================
    let velocityX = 0;
    let velocityY = 0;

    const acceleration = 0.5;
    const friction = 0.95;

    let currentAngle = 0;

    // ===============================
    // 🎮 CONTROLES (DIAGONAL OK)
    // ===============================
    const keys = {
        w: false, a: false, s: false, d: false,
        arrowup: false, arrowdown: false, arrowleft: false, arrowright: false
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
    // 🔒 LIMITES
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

    // ===============================
    // 🪙 MOEDAS
    // ===============================
    function criarMoeda() {
        const coin = document.createElement("div");
        coin.classList.add("coin");

        coin.style.left = Math.random() * (game.clientWidth - 40) + "px";
        coin.style.top = Math.random() * (game.clientHeight - 40) + "px";

        game.appendChild(coin);
    }

    // ===============================
    // 🔥 RASTRO DA NAVE
    // ===============================
    function criarRastro() {
        const p = document.createElement("div");
        p.classList.add("particle");

        p.style.left = (x + playerSize / 2) + "px";
        p.style.top = (y + playerSize / 2) + "px";

        game.appendChild(p);

        setTimeout(() => p.remove(), 500);
    }

    // ===============================
    // 💥 EFEITO MOEDA
    // ===============================
    function efeitoMoeda(px, py) {
        const e = document.createElement("div");

        e.style.position = "absolute";
        e.style.left = px + "px";
        e.style.top = py + "px";
        e.style.width = "20px";
        e.style.height = "20px";
        e.style.background = "yellow";
        e.style.borderRadius = "50%";

        game.appendChild(e);

        setTimeout(() => {
            e.style.transform = "scale(3)";
            e.style.opacity = "0";
        }, 10);

        setTimeout(() => e.remove(), 500);
    }

    // ===============================
    // 🪙 COLISÃO
    // ===============================
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
                efeitoMoeda(p.left, p.top);
                coin.remove();
                moedas++;
                contadorEl.innerText = moedas;

                if (moedas === 6) ativarJumpscare();
            }
        });
    }

    // ===============================
    // 💀 JUMPSCARE + SOM + TREMOR
    // ===============================
    function ativarJumpscare() {

        jumpscare.style.display = "block";

        // 🔇 parar música
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
        }

        // 🔊 som jumpscare
        if (audioLiberado) {
            som.currentTime = 0;
            som.volume = 1;
            som.play().catch(() => {});
        }

        // 💥 tremor
        document.body.classList.add("shake");
        setTimeout(() => {
            document.body.classList.remove("shake");
        }, 1000);
    }

    // ===============================
    // 🔄 GAME LOOP
    // ===============================
    function gameLoop() {

        if (jogoIniciado) {

            // movimento
            if (keys.w || keys.arrowup) velocityY -= acceleration;
            if (keys.s || keys.arrowdown) velocityY += acceleration;
            if (keys.a || keys.arrowleft) velocityX -= acceleration;
            if (keys.d || keys.arrowright) velocityX += acceleration;

            // atrito
            velocityX *= friction;
            velocityY *= friction;

            x += velocityX;
            y += velocityY;

            // 🔥 rastro ativo
            if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                criarRastro();
            }

            // rotação
            if (velocityX !== 0 || velocityY !== 0) {
                const target = Math.atan2(velocityY, velocityX) * (180 / Math.PI) + 90;
                currentAngle += (target - currentAngle) * 0.2;
                player.style.transform = `rotate(${currentAngle}deg)`;
            }

            aplicarLimites();
            atualizarPosicao();
            verificarColisao();
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
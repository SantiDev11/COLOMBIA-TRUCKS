/* ============================================================
   COLOMBIA TRUCKS — Juego Interactivo: MEMORIA CAMIONERA
   16 cartas (8 parejas temáticas de tractocamiones reales):
   - Mula Amarilla (Kenworth T800)
   - Mula Roja (Kenworth T680)
   - Mula Blanca/Beige (Kenworth W900)
   - Mula Marrón (International Eagle 9400i)
   - Motor Cummins X15, Caja Fuller, Jake Brake, Quinta Rueda
   ============================================================ */

(function initMemoryGame() {
  const board = document.getElementById("gameBoard");
  if (!board) return;

  const movesEl = document.getElementById("gameMoves");
  const pairsEl = document.getElementById("gamePairs");
  const timeEl = document.getElementById("gameTime");
  const scoreEl = document.getElementById("gameScore");
  const bestEl = document.getElementById("gameBest");
  const winBox = document.getElementById("gameWin");
  const winText = document.getElementById("gameWinText");
  const restartBtn = document.getElementById("gameRestart");
  const playAgainBtn = document.getElementById("gamePlayAgain");

  const PAIRS_DATA = [
    {
      id: "t800",
      title: "Kenworth T800",
      icon: "🚛",
      hint: "Mula Amarilla · Rey de la Montaña"
    },
    {
      id: "t680",
      title: "Kenworth T680",
      icon: "🔴",
      hint: "Mula Roja · Aerodinámica Next-Gen"
    },
    {
      id: "w900",
      title: "Kenworth W900",
      icon: "⚪",
      hint: "Mula Blanca · Trompa Larga y Cromo"
    },
    {
      id: "9400i",
      title: "International 9400i",
      icon: "🟤",
      hint: "Mula Marrón · Pro-Sleeper Eagle"
    },
    {
      id: "cummins",
      title: "Motor Cummins X15",
      icon: "🔧",
      hint: "605 HP & 2,050 lb-pie de Torque"
    },
    {
      id: "fuller",
      title: "Caja Eaton Fuller",
      icon: "⚙️",
      hint: "18 Velocidades con Splitter"
    },
    {
      id: "jake",
      title: "Freno Jake Brake",
      icon: "🛑",
      hint: "Freno de Ahogo por Descompresión"
    },
    {
      id: "quinta",
      title: "Quinta Rueda Holland",
      icon: "🔗",
      hint: "Enganche de Semirremolque 52 Ton"
    }
  ];

  let deck = [];
  let flipped = [];
  let matched = 0;
  let moves = 0;
  let lock = false;
  let timer = null;
  let seconds = 0;
  let started = false;

  const STORAGE_KEY = "colombia_trucks_memory_best";

  function getBestScore() {
    return localStorage.getItem(STORAGE_KEY) || "--";
  }

  function setBestScore(score) {
    const currentBest = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!currentBest || score > currentBest) {
      localStorage.setItem(STORAGE_KEY, score);
      if (bestEl) bestEl.textContent = score + " pts";
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function startTimer() {
    if (started) return;
    started = true;
    timer = setInterval(() => {
      seconds++;
      if (timeEl) timeEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function calculateScore() {
    const base = 2000;
    const penalty = (moves * 25) + (seconds * 10);
    return Math.max(100, base - penalty);
  }

  function buildDeck() {
    deck = [];
    PAIRS_DATA.forEach((item) => {
      deck.push({
        pair: item.id,
        kind: "title",
        icon: item.icon,
        text: item.title,
        sub: "Modelo / Componente"
      });
      deck.push({
        pair: item.id,
        kind: "hint",
        icon: "📋",
        text: item.hint,
        sub: "Identificación de Mula"
      });
    });
    shuffle(deck);
  }

  function render() {
    board.innerHTML = "";
    deck.forEach((card, i) => {
      const btn = document.createElement("button");
      btn.className = "mcard";
      btn.type = "button";
      btn.dataset.pair = card.pair;
      btn.dataset.index = i;
      btn.setAttribute("aria-label", "Carta oculta " + (i + 1));
      btn.style.animationDelay = (i * 30) + "ms";

      btn.innerHTML = `
        <span class="mcard-inner">
          <span class="mcard-front" aria-hidden="true">
            <span class="mcard-logo">🚛</span>
            <span class="mcard-front-text">COLOMBIA<br>TRUCKS</span>
          </span>
          <span class="mcard-back ${card.kind}">
            <span class="mcard-back-icon">${card.icon}</span>
            <span class="mcard-back-title">${card.text}</span>
            <span class="mcard-back-sub">${card.sub}</span>
          </span>
        </span>
      `;

      btn.addEventListener("click", () => flip(btn));
      board.appendChild(btn);
    });

    if (bestEl) bestEl.textContent = getBestScore() !== "--" ? getBestScore() + " pts" : "--";
  }

  function flip(cardEl) {
    if (lock || cardEl.classList.contains("is-flipped") || cardEl.classList.contains("is-matched")) return;

    startTimer();
    cardEl.classList.add("is-flipped");
    flipped.push(cardEl);

    if (flipped.length < 2) return;

    moves++;
    if (movesEl) movesEl.textContent = moves;
    const [a, b] = flipped;

    if (a.dataset.pair === b.dataset.pair) {
      matched++;
      if (pairsEl) pairsEl.textContent = `${matched}/${PAIRS_DATA.length}`;
      a.classList.add("is-matched");
      b.classList.add("is-matched");
      flipped = [];

      if (scoreEl) scoreEl.textContent = calculateScore();

      if (window.playAirPurgeSound) window.playAirPurgeSound();

      if (matched === PAIRS_DATA.length) {
        setTimeout(win, 600);
      }
    } else {
      lock = true;
      a.classList.add("shake");
      b.classList.add("shake");
      setTimeout(() => {
        a.classList.remove("is-flipped", "shake");
        b.classList.remove("is-flipped", "shake");
        flipped = [];
        lock = false;
      }, 850);
    }
  }

  function win() {
    clearInterval(timer);
    const finalScore = calculateScore();
    setBestScore(finalScore);

    if (winText) {
      winText.innerHTML = `
        Completaste el reto en <strong>${moves} movimientos</strong> y <strong>${formatTime(seconds)}</strong>.<br>
        Puntuación final: <strong style="color: #ffb703; font-size: 1.2em;">${finalScore} pts</strong>.
      `;
    }

    if (window.playAirHornSound) window.playAirHornSound();

    if (winBox) {
      winBox.hidden = false;
      requestAnimationFrame(() => winBox.classList.add("show"));
    }
  }

  function reset() {
    clearInterval(timer);
    timer = null;
    seconds = 0;
    started = false;
    moves = 0;
    matched = 0;
    flipped = [];
    lock = false;

    if (movesEl) movesEl.textContent = "0";
    if (pairsEl) pairsEl.textContent = `0/${PAIRS_DATA.length}`;
    if (timeEl) timeEl.textContent = "0:00";
    if (scoreEl) scoreEl.textContent = "2000";

    if (winBox) {
      winBox.classList.remove("show");
      winBox.hidden = true;
    }

    buildDeck();
    render();
  }

  if (restartBtn) restartBtn.addEventListener("click", reset);
  if (playAgainBtn) playAgainBtn.addEventListener("click", reset);

  reset();
})();

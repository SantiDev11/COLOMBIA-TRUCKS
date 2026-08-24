/* ============================================================
   COLOMBIA TRUCKS — Desafío de la Línea: Simulador de Conducción
   Juego interactivo 2D de descenso de cordillera y conducción
   en carretera colombiana para los 4 tractocamiones emblemáticos.
   ============================================================ */

(function initTruckRunnerGame() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Elementos HUD
  const scoreEl = document.getElementById("gameScoreVal");
  const distanceEl = document.getElementById("gameDistanceVal");
  const speedEl = document.getElementById("gameSpeedVal");
  const brakeTempEl = document.getElementById("gameBrakeTempVal");
  const fuelEl = document.getElementById("gameFuelVal");
  const startScreen = document.getElementById("gameStartScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const gameWinScreen = document.getElementById("gameWinScreen");
  const btnStartGame = document.getElementById("btnStartTruckGame");
  const btnRestartOver = document.getElementById("btnRestartOver");
  const btnRestartWin = document.getElementById("btnRestartWin");

  // Botones táctiles móviles
  const btnLeft = document.getElementById("ctrlLeft");
  const btnRight = document.getElementById("ctrlRight");
  const btnGas = document.getElementById("ctrlGas");
  const btnJake = document.getElementById("ctrlJake");
  const btnHorn = document.getElementById("ctrlHorn");

  // Selector de Camión
  const truckSelectBtns = document.querySelectorAll(".truck-select-btn");
  let selectedTruckId = "t800";

  const TRUCK_SKINS = {
    t800: {
      name: "Kenworth T800",
      color: "#ffb703",
      accent: "#8338ec",
      width: 44,
      height: 90,
      handling: 1.1,
      topSpeed: 95,
      brakePower: 1.2,
      imgSrc: "assets/images/kenworth-t800.jpg"
    },
    "international-9400i": {
      name: "International Eagle 9400i",
      color: "#8d5b4c",
      accent: "#d4a373",
      width: 44,
      height: 90,
      handling: 1.0,
      topSpeed: 90,
      brakePower: 1.0,
      imgSrc: "assets/images/international-9400i.jpg"
    },
    w900: {
      name: "Kenworth W900",
      color: "#f8f9fa",
      accent: "#e5e5e5",
      width: 46,
      height: 98,
      handling: 0.9,
      topSpeed: 100,
      brakePower: 1.1,
      imgSrc: "assets/images/kenworth-w900.jpg"
    },
    t680: {
      name: "Kenworth T680",
      color: "#e63946",
      accent: "#1d3557",
      width: 44,
      height: 88,
      handling: 1.25,
      topSpeed: 105,
      brakePower: 1.15,
      imgSrc: "assets/images/kenworth-t680.jpg"
    }
  };

  // Selección de Camión
  truckSelectBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      truckSelectBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTruckId = btn.dataset.truck;
    });
  });

  // Estado del Juego
  let isPlaying = false;
  let animationId = null;
  let score = 0;
  let distance = 0; // en metros (meta: 5000m)
  const TOTAL_DISTANCE = 5000;
  let speed = 40;
  let fuel = 100;
  let brakeTemp = 20; // 20% a 100%

  // Posición del Camión
  let playerX = 200;
  let playerY = 400;
  let isMovingLeft = false;
  let isMovingRight = false;
  let isThrottling = false;
  let isBraking = false;

  // Obstáculos y Coleccionables
  let obstacles = [];
  let collectibles = [];
  let roadOffset = 0;
  let curveOffset = 0;
  let targetCurve = 0;
  let curveTimer = 0;

  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const width = Math.min(parent.clientWidth, 680);
    canvas.width = width;
    canvas.height = 540;
    playerY = canvas.height - 110;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Control de Teclado
  const keys = {};
  window.addEventListener("keydown", (e) => {
    if (!isPlaying) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s", "h"].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "h" && window.playAirHornSound) {
      window.playAirHornSound();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Controles Táctiles Móviles
  if (btnLeft) {
    btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); isMovingLeft = true; });
    btnLeft.addEventListener("touchend", () => { isMovingLeft = false; });
    btnLeft.addEventListener("mousedown", () => { isMovingLeft = true; });
    btnLeft.addEventListener("mouseup", () => { isMovingLeft = false; });
  }

  if (btnRight) {
    btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); isMovingRight = true; });
    btnRight.addEventListener("touchend", () => { isMovingRight = false; });
    btnRight.addEventListener("mousedown", () => { isMovingRight = true; });
    btnRight.addEventListener("mouseup", () => { isMovingRight = false; });
  }

  if (btnGas) {
    btnGas.addEventListener("touchstart", (e) => { e.preventDefault(); isThrottling = true; });
    btnGas.addEventListener("touchend", () => { isThrottling = false; });
    btnGas.addEventListener("mousedown", () => { isThrottling = true; });
    btnGas.addEventListener("mouseup", () => { isThrottling = false; });
  }

  if (btnJake) {
    btnJake.addEventListener("touchstart", (e) => { 
      e.preventDefault(); 
      isBraking = true; 
      if (window.playJakeBrakeSound) window.playJakeBrakeSound(); 
    });
    btnJake.addEventListener("touchend", () => { isBraking = false; });
    btnJake.addEventListener("mousedown", () => { 
      isBraking = true; 
      if (window.playJakeBrakeSound) window.playJakeBrakeSound(); 
    });
    btnJake.addEventListener("mouseup", () => { isBraking = false; });
  }

  if (btnHorn) {
    btnHorn.addEventListener("click", () => {
      if (window.playAirHornSound) window.playAirHornSound();
    });
  }

  function spawnObstacle() {
    const laneWidth = (canvas.width - 120) / 3;
    const lane = Math.floor(Math.random() * 3);
    const x = 60 + lane * laneWidth + laneWidth / 2 - 20;

    const types = [
      { name: "carro", color: "#38bdf8", width: 34, height: 55, speed: 2 },
      { name: "camion", color: "#64748b", width: 42, height: 80, speed: 1.5 },
      { name: "derrumbe", color: "#b45309", width: 48, height: 40, speed: 0 }
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    obstacles.push({
      x: x,
      y: -100,
      width: type.width,
      height: type.height,
      speed: type.speed,
      color: type.color,
      name: type.name
    });
  }

  function spawnCollectible() {
    const laneWidth = (canvas.width - 120) / 3;
    const lane = Math.floor(Math.random() * 3);
    const x = 60 + lane * laneWidth + laneWidth / 2 - 14;

    const types = [
      { type: "fuel", symbol: "⛽", points: 150 },
      { type: "cargo", symbol: "📦", points: 300 }
    ];
    const item = types[Math.floor(Math.random() * types.length)];

    collectibles.push({
      x: x,
      y: -60,
      width: 28,
      height: 28,
      type: item.type,
      symbol: item.symbol,
      points: item.points
    });
  }

  function startGame() {
    resizeCanvas();
    isPlaying = true;
    score = 0;
    distance = 0;
    speed = 45;
    fuel = 100;
    brakeTemp = 20;
    obstacles = [];
    collectibles = [];
    playerX = canvas.width / 2 - 22;

    if (startScreen) startScreen.style.display = "none";
    if (gameOverScreen) gameOverScreen.style.display = "none";
    if (gameWinScreen) gameWinScreen.style.display = "none";

    if (window.playIdleSound) window.playIdleSound();

    lastTime = performance.now();
    gameLoop();
  }

  function endGame(isWin) {
    isPlaying = false;
    if (animationId) cancelAnimationFrame(animationId);

    if (isWin) {
      const winScoreEl = document.getElementById("winFinalScore");
      if (winScoreEl) winScoreEl.textContent = Math.round(score);
      if (gameWinScreen) gameWinScreen.style.display = "grid";
      if (window.playAirHornSound) window.playAirHornSound();
    } else {
      const overScoreEl = document.getElementById("overFinalScore");
      const overDistEl = document.getElementById("overFinalDist");
      if (overScoreEl) overScoreEl.textContent = Math.round(score);
      if (overDistEl) overDistEl.textContent = `${Math.round(distance)}m`;
      if (gameOverScreen) gameOverScreen.style.display = "grid";
    }
  }

  let lastTime = 0;
  let spawnTimer = 0;
  let itemTimer = 0;

  function gameLoop(now = performance.now()) {
    if (!isPlaying) return;

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    update(dt);
    draw();

    animationId = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    const truck = TRUCK_SKINS[selectedTruckId] || TRUCK_SKINS.t800;

    // Aceleración y Frenado
    const left = keys["arrowleft"] || keys["a"] || isMovingLeft;
    const right = keys["arrowright"] || keys["d"] || isMovingRight;
    const gas = keys["arrowup"] || keys["w"] || isThrottling;
    const brake = keys[" "] || keys["arrowdown"] || keys["s"] || isBraking;

    // Manejo Horizontal
    if (left) playerX -= 260 * truck.handling * dt;
    if (right) playerX += 260 * truck.handling * dt;

    // Límites de calzada
    const minX = 50;
    const maxX = canvas.width - 50 - truck.width;
    playerX = Math.max(minX, Math.min(maxX, playerX));

    // Dinámica de Velocidad
    if (gas) {
      speed = Math.min(truck.topSpeed, speed + 40 * dt);
      fuel = Math.max(0, fuel - 2.5 * dt);
      brakeTemp = Math.max(20, brakeTemp - 8 * dt);
    } else if (brake) {
      speed = Math.max(15, speed - 65 * truck.brakePower * dt);
      brakeTemp = Math.min(100, brakeTemp + 15 * dt);
    } else {
      // Descenso natural por gravedad en cordillera
      speed = Math.min(truck.topSpeed * 0.85, speed + 8 * dt);
      brakeTemp = Math.max(20, brakeTemp - 4 * dt);
    }

    // Sobrecalentamiento de frenos
    if (brakeTemp >= 95) {
      score = Math.max(0, score - 50 * dt);
    }

    // Progreso de Ruta
    const distanceStep = (speed * 0.28) * 10 * dt;
    distance += distanceStep;
    score += distanceStep * 0.8;
    fuel = Math.max(0, fuel - 0.8 * dt);

    if (fuel <= 0) {
      endGame(false);
      return;
    }

    if (distance >= TOTAL_DISTANCE) {
      endGame(true);
      return;
    }

    // Curvas dinámicas de cordillera
    curveTimer += dt;
    if (curveTimer > 3.5) {
      curveTimer = 0;
      targetCurve = (Math.random() - 0.5) * 60;
    }
    curveOffset += (targetCurve - curveOffset) * 0.03;

    // Movimiento de Carretera
    roadOffset = (roadOffset + speed * 10 * dt) % 60;

    // Generar obstáculos
    spawnTimer += dt;
    if (spawnTimer > Math.max(1.1, 2.2 - (speed / 100))) {
      spawnTimer = 0;
      spawnObstacle();
    }

    // Generar coleccionables
    itemTimer += dt;
    if (itemTimer > 2.8) {
      itemTimer = 0;
      spawnCollectible();
    }

    // Actualizar Obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.y += (speed * 8 - obs.speed * 15) * dt;

      // Colisión con el Camión Jugador
      if (
        playerX < obs.x + obs.width &&
        playerX + truck.width > obs.x &&
        playerY < obs.y + obs.height &&
        playerY + truck.height > obs.y
      ) {
        endGame(false);
        return;
      }

      if (obs.y > canvas.height + 100) {
        obstacles.splice(i, 1);
        score += 80;
      }
    }

    // Actualizar Coleccionables
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const item = collectibles[i];
      item.y += speed * 8 * dt;

      // Recolección
      if (
        playerX < item.x + item.width &&
        playerX + truck.width > item.x &&
        playerY < item.y + item.height &&
        playerY + truck.height > item.y
      ) {
        if (item.type === "fuel") {
          fuel = Math.min(100, fuel + 25);
        }
        score += item.points;
        collectibles.splice(i, 1);
        continue;
      }

      if (item.y > canvas.height + 60) {
        collectibles.splice(i, 1);
      }
    }

    // Actualizar HUD
    if (scoreEl) scoreEl.textContent = Math.round(score);
    if (distanceEl) distanceEl.textContent = `${Math.round(distance)}m / ${TOTAL_DISTANCE}m`;
    if (speedEl) speedEl.textContent = `${Math.round(speed)} km/h`;
    if (brakeTempEl) {
      brakeTempEl.textContent = `${Math.round(brakeTemp)}%`;
      brakeTempEl.style.color = brakeTemp > 80 ? "#ef233c" : brakeTemp > 50 ? "#ffb703" : "#10b981";
    }
    if (fuelEl) fuelEl.textContent = `${Math.round(fuel)}%`;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Fondo de Montaña / Vegetación Colombiana
    ctx.fillStyle = "#0c150c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cordillera al horizonte
    ctx.fillStyle = "#152615";
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(100 + curveOffset, 20);
    ctx.lineTo(240, 55);
    ctx.lineTo(400 + curveOffset, 15);
    ctx.lineTo(550, 50);
    ctx.lineTo(canvas.width, 30);
    ctx.lineTo(canvas.width, 100);
    ctx.lineTo(0, 100);
    ctx.fill();

    // 2. Calzada de Asfalto
    const roadLeft = 45 + curveOffset * 0.4;
    const roadRight = canvas.width - 45 + curveOffset * 0.4;
    const roadWidth = roadRight - roadLeft;

    ctx.fillStyle = "#121820";
    ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);

    // Bordillo / Berma de Seguridad
    ctx.fillStyle = "#ffb703";
    ctx.fillRect(roadLeft - 4, 0, 4, canvas.height);
    ctx.fillRect(roadRight, 0, 4, canvas.height);

    // Líneas Divisorias de Carril (Doble Amarilla y Blancas)
    const lane1 = roadLeft + roadWidth / 3;
    const lane2 = roadLeft + (roadWidth / 3) * 2;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 20]);
    ctx.lineDashOffset = -roadOffset;

    ctx.beginPath();
    ctx.moveTo(lane1, 0);
    ctx.lineTo(lane1, canvas.height);
    ctx.moveTo(lane2, 0);
    ctx.lineTo(lane2, canvas.height);
    ctx.stroke();

    // Línea central doble amarilla
    ctx.strokeStyle = "#ffb703";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(roadLeft + roadWidth / 2 - 2, 0);
    ctx.lineTo(roadLeft + roadWidth / 2 - 2, canvas.height);
    ctx.moveTo(roadLeft + roadWidth / 2 + 2, 0);
    ctx.lineTo(roadLeft + roadWidth / 2 + 2, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);

    // 3. Dibujar Coleccionables
    collectibles.forEach((item) => {
      ctx.fillStyle = item.type === "fuel" ? "#10b981" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(item.x + 14, item.y + 14, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.symbol, item.x + 14, item.y + 14);
    });

    // 4. Dibujar Obstáculos (Carros y Derrumbes)
    obstacles.forEach((obs) => {
      if (obs.name === "derrumbe") {
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(obs.x + 24, obs.y + 20, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🪨", obs.x + 24, obs.y + 24);
      } else {
        // Vehículo de tráfico
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Parabrisas y luces traseras
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(obs.x + 4, obs.y + 10, obs.width - 8, 14);
        ctx.fillStyle = "#ef233c";
        ctx.fillRect(obs.x + 3, obs.y + obs.height - 4, 6, 3);
        ctx.fillRect(obs.x + obs.width - 9, obs.y + obs.height - 4, 6, 3);
      }
    });

    // 5. Dibujar Tractomula del Jugador
    const truck = TRUCK_SKINS[selectedTruckId] || TRUCK_SKINS.t800;

    // Sombra del Camión
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(playerX - 2, playerY + 6, truck.width + 4, truck.height);

    // Chasis & Remolque (Tráiler de 3 Ejes C3-S3)
    ctx.fillStyle = "#334155";
    ctx.fillRect(playerX + 4, playerY + 36, truck.width - 8, truck.height - 36);

    // Cabina Principal
    ctx.fillStyle = truck.color;
    ctx.fillRect(playerX, playerY, truck.width, 36);

    // Parabrisas & Vidrios
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(playerX + 5, playerY + 12, truck.width - 10, 10);

    // Capó / Trompa
    ctx.fillStyle = truck.accent;
    ctx.fillRect(playerX + 8, playerY, truck.width - 16, 12);

    // Luces Delanteras (Faros LED Amarillos / Blancos)
    ctx.fillStyle = "#fffae5";
    ctx.fillRect(playerX + 2, playerY, 6, 4);
    ctx.fillRect(playerX + truck.width - 8, playerY, 6, 4);

    // Espejos Laterales
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(playerX - 4, playerY + 8, 4, 8);
    ctx.fillRect(playerX + truck.width, playerY + 8, 4, 8);

    // Chimeneas de Escape (Cromo)
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(playerX + 2, playerY + 28, 4, 10);
    ctx.fillRect(playerX + truck.width - 6, playerY + 28, 4, 10);

    // Efecto de Luces en el Pavimento
    const glow = ctx.createLinearGradient(playerX, playerY, playerX, playerY - 140);
    glow.addColorStop(0, "rgba(255, 240, 150, 0.35)");
    glow.addColorStop(1, "rgba(255, 240, 150, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.moveTo(playerX - 10, playerY - 130);
    ctx.lineTo(playerX + truck.width + 10, playerY - 130);
    ctx.lineTo(playerX + truck.width, playerY);
    ctx.lineTo(playerX, playerY);
    ctx.closePath();
    ctx.fill();

    // Alerta de Frenos Calientes
    if (brakeTemp > 80) {
      ctx.fillStyle = "rgba(239, 35, 60, 0.85)";
      ctx.font = "bold 13px 'Barlow Condensed', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚠️ ¡FRENOS CALIENTES! USA JAKE BRAKE", canvas.width / 2, 85);
    }
  }

  // Event Listeners de Botones
  if (btnStartGame) btnStartGame.addEventListener("click", startGame);
  if (btnRestartOver) btnRestartOver.addEventListener("click", startGame);
  if (btnRestartWin) btnRestartWin.addEventListener("click", startGame);
})();

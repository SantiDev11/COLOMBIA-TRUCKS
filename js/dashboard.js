/* ============================================================
   COLOMBIA TRUCKS — Simulador de Tablero & Clúster Heavy Duty
   - Gauges analógicos animados con física de agujas
   - Sonido real del motor vía YouTube Shorts (sHmaSbjKC0E)
   - Barrido de agujas al encender (Sweep Check)
   ============================================================ */

(function initDashboardSimulator() {
  "use strict";

  // Elementos del DOM
  const ignitionBtn = document.getElementById("dashIgnition");
  const throttleBtn = document.getElementById("dashThrottle");
  const jakeBtn = document.getElementById("dashJake");
  const hornBtn = document.getElementById("dashHorn");

  const rpmNeedle = document.getElementById("needleRpm");
  const speedNeedle = document.getElementById("needleSpeed");
  const turboNeedle = document.getElementById("needleTurbo");
  const airNeedle1 = document.getElementById("needleAir1");
  const airNeedle2 = document.getElementById("needleAir2");

  const rpmValueEl = document.getElementById("rpmDigital");
  const speedValueEl = document.getElementById("speedDigital");
  const gearValueEl = document.getElementById("gearDigital");
  const turboValueEl = document.getElementById("turboDigital");

  const ledCheckEngine = document.getElementById("ledCheckEngine");
  const ledJake = document.getElementById("ledJake");
  const ledAirLow = document.getElementById("ledAirLow");
  const ledDiffLock = document.getElementById("ledDiffLock");

  if (!ignitionBtn) return;

  // Estado del simulador
  let isRunning = false;
  let isThrottling = false;
  let isJakeActive = false;
  let isSweepChecking = false;

  let currentRpm = 0;
  let targetRpm = 0;
  let currentSpeed = 0;
  let targetSpeed = 0;
  let currentTurbo = 0;
  let targetTurbo = 0;
  let currentAir1 = 120;
  let currentAir2 = 118;
  let currentGear = "N";

  /* ============================================================
     1. YOUTUBE IFRAME PLAYER — Sonido Real (sHmaSbjKC0E)
     ============================================================ */
  let ytPlayer = null;
  let ytPlayerReady = false;
  let ytApiLoaded = false;

  function loadYtApi() {
    if (ytApiLoaded) return;
    ytApiLoaded = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function createYtPlayer() {
    if (ytPlayer) return;
    const target = document.getElementById("dashYtFrame");
    if (!target || !window.YT || !window.YT.Player) return;

    ytPlayer = new window.YT.Player("dashYtFrame", {
      height: "60",
      width: "100%",
      videoId: "sHmaSbjKC0E",
      playerVars: {
        playsinline: 1,
        controls: 1,
        rel: 0,
        loop: 1,
        playlist: "sHmaSbjKC0E",
        enablejsapi: 1
      },
      events: {
        onReady: function() {
          ytPlayerReady = true;
          ytPlayer.setVolume(100);
          ytPlayer.playVideo();
        },
        onError: function() {
          ytPlayerReady = false;
        }
      }
    });
  }

  // Callback global de la API de YouTube
  const prevYtCallback = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function() {
    if (typeof prevYtCallback === "function") prevYtCallback();
    createYtPlayer();
  };

  function playYtSound() {
    const section = document.getElementById("dashYtAudioSection");

    if (!ytApiLoaded) {
      loadYtApi();
      if (section) section.style.display = "block";
      return;
    }

    if (!ytPlayer) {
      if (window.YT && window.YT.Player) createYtPlayer();
      if (section) section.style.display = "block";
      return;
    }

    if (ytPlayerReady) {
      try {
        if (section) section.style.display = "block";
        ytPlayer.seekTo(0, true);
        ytPlayer.setVolume(100);
        ytPlayer.playVideo();
      } catch (e) {}
    }
  }

  function pauseYtSound() {
    if (ytPlayer && ytPlayerReady) {
      try { ytPlayer.pauseVideo(); } catch (e) {}
    }
  }

  /* ============================================================
     2. CICLO DE ANIMACIÓN DE GAUGES
     ============================================================ */
  function updateGauges() {
    currentRpm += (targetRpm - currentRpm) * 0.12;
    currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    currentTurbo += (targetTurbo - currentTurbo) * 0.15;

    // Vibración sutil de ralentí
    const idleShake = isRunning ? (Math.sin(Date.now() * 0.03) * 0.8) : 0;

    // Tacómetro: 0 a 2500 RPM -> -120deg a +120deg
    const rpmAngle = -120 + (currentRpm / 2500) * 240 + idleShake;
    if (rpmNeedle) rpmNeedle.style.transform = `rotate(${rpmAngle}deg)`;

    // Velocímetro: 0 a 140 km/h -> -120deg a +120deg
    const speedAngle = -120 + (currentSpeed / 140) * 240 + (idleShake * 0.4);
    if (speedNeedle) speedNeedle.style.transform = `rotate(${speedAngle}deg)`;

    // Turbo: 0 a 40 PSI -> -110deg a +110deg
    const turboAngle = -110 + (currentTurbo / 40) * 220;
    if (turboNeedle) turboNeedle.style.transform = `rotate(${turboAngle}deg)`;

    // Aire: 0 a 150 PSI -> -100deg a +100deg
    const airAngle1 = -100 + (currentAir1 / 150) * 200;
    const airAngle2 = -100 + (currentAir2 / 150) * 200;
    if (airNeedle1) airNeedle1.style.transform = `rotate(${airAngle1}deg)`;
    if (airNeedle2) airNeedle2.style.transform = `rotate(${airAngle2}deg)`;

    // Textos digitales
    if (rpmValueEl) rpmValueEl.textContent = Math.round(currentRpm);
    if (speedValueEl) speedValueEl.textContent = Math.round(currentSpeed);
    if (gearValueEl) gearValueEl.textContent = currentGear;
    if (turboValueEl) turboValueEl.textContent = Math.round(currentTurbo);

    requestAnimationFrame(updateGauges);
  }

  // Barrido de agujas inicial (Sweep Check)
  function runSweepCheck() {
    isSweepChecking = true;
    targetRpm = 2400;
    targetSpeed = 135;
    targetTurbo = 38;

    setTimeout(() => {
      if (isRunning) {
        targetRpm = 650;
        targetSpeed = 0;
        targetTurbo = 2;
        currentGear = "N";
      } else {
        targetRpm = 0;
        targetSpeed = 0;
        targetTurbo = 0;
        currentGear = "P";
      }
      isSweepChecking = false;
    }, 700);
  }

  /* ============================================================
     3. CONTROLES DEL TABLERO
     ============================================================ */
  function toggleIgnition() {
    isRunning = !isRunning;

    if (isRunning) {
      ignitionBtn.classList.add("active");
      ignitionBtn.innerHTML = "<span>🛑</span> APAGAR MOTOR";

      if (ledCheckEngine) ledCheckEngine.classList.add("active");
      if (ledAirLow) ledAirLow.classList.add("active");
      if (ledDiffLock) ledDiffLock.classList.add("active");

      // Barrido de agujas al encender
      runSweepCheck();

      // Notificar al favicon animado
      if (window.AnimatedFavicon && window.AnimatedFavicon.setEngineActive) {
        window.AnimatedFavicon.setEngineActive(true);
      }

      setTimeout(() => {
        if (ledCheckEngine) ledCheckEngine.classList.remove("active");
        if (ledAirLow) ledAirLow.classList.remove("active");
        if (ledDiffLock) ledDiffLock.classList.remove("active");
      }, 1200);
    } else {
      ignitionBtn.classList.remove("active");
      ignitionBtn.innerHTML = "<span>⚡</span> ARRANCAR MOTOR";
      targetRpm = 0;
      targetSpeed = 0;
      targetTurbo = 0;
      currentGear = "P";
      if (ledJake) ledJake.classList.remove("active");
      if (ledCheckEngine) ledCheckEngine.classList.remove("active");

      // Pausar YouTube al apagar
      pauseYtSound();

      if (window.AnimatedFavicon && window.AnimatedFavicon.setEngineActive) {
        window.AnimatedFavicon.setEngineActive(false);
      }
    }
  }

  function startThrottle() {
    if (!isRunning) {
      toggleIgnition();
    }
    isThrottling = true;
    throttleBtn.classList.add("active");
    targetRpm = 2050;
    targetSpeed = 82;
    targetTurbo = 35;
    currentGear = "7H";

    // Reproducir sonido real de YouTube (sHmaSbjKC0E)
    playYtSound();
  }

  function stopThrottle() {
    if (!isThrottling) return;
    isThrottling = false;
    throttleBtn.classList.remove("active");
    targetRpm = isRunning ? 650 : 0;
    targetSpeed = 0;
    targetTurbo = isRunning ? 2 : 0;
    currentGear = isRunning ? "N" : "P";
  }

  // Event Listeners del Tablero
  ignitionBtn.addEventListener("click", toggleIgnition);

  throttleBtn.addEventListener("mousedown", startThrottle);
  throttleBtn.addEventListener("mouseup", stopThrottle);
  throttleBtn.addEventListener("mouseleave", stopThrottle);
  throttleBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startThrottle(); }, { passive: false });
  throttleBtn.addEventListener("touchend", stopThrottle);
  /* ============================================================
     YOUTUBE HORN PLAYER — Corneta Real (NLouL3k2vUk)
     ============================================================ */
  let ytHornPlayer = null;
  let ytHornReady = false;

  function createYtHornPlayer() {
    if (ytHornPlayer) return;
    const target = document.getElementById("dashYtHornFrame");
    if (!target || !window.YT || !window.YT.Player) return;

    ytHornPlayer = new window.YT.Player("dashYtHornFrame", {
      height: "60",
      width: "200",
      videoId: "NLouL3k2vUk",
      playerVars: {
        playsinline: 1,
        controls: 0,
        rel: 0,
        enablejsapi: 1
      },
      events: {
        onReady: function() { ytHornReady = true; },
        onError: function() { ytHornReady = false; }
      }
    });
  }

  // Crear el horn player cuando la API de YouTube esté lista
  const prevHornCallback = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function() {
    if (typeof prevHornCallback === "function") prevHornCallback();
    createYtHornPlayer();
  };

  function playYtHorn() {
    const section = document.getElementById("dashYtHornSection");

    if (!ytApiLoaded) {
      loadYtApi();
      if (section) section.style.display = "block";
      return;
    }

    if (!ytHornPlayer) {
      if (window.YT && window.YT.Player) createYtHornPlayer();
      if (section) section.style.display = "block";
      return;
    }

    if (ytHornReady) {
      try {
        if (section) section.style.display = "block";
        ytHornPlayer.seekTo(0, true);
        ytHornPlayer.setVolume(100);
        ytHornPlayer.playVideo();
      } catch (e) {}
    }
  }

  if (jakeBtn) {
    jakeBtn.addEventListener("click", () => {
      if (!isRunning) return;
      isJakeActive = true;
      if (ledJake) ledJake.classList.add("active");
      jakeBtn.classList.add("active");
      targetRpm = Math.max(900, currentRpm - 500);
      setTimeout(() => {
        isJakeActive = false;
        if (ledJake) ledJake.classList.remove("active");
        jakeBtn.classList.remove("active");
      }, 1400);
    });
  }

  if (hornBtn) {
    hornBtn.addEventListener("click", () => {
      hornBtn.classList.add("active");
      // Reproducir sonido real de corneta de YouTube (NLouL3k2vUk)
      playYtHorn();
      setTimeout(() => hornBtn.classList.remove("active"), 450);
    });
  }

  // Iniciar ciclo de actualización de agujas
  updateGauges();
})();

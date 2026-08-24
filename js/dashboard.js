/* ============================================================
   COLOMBIA TRUCKS — Simulador de Tablero & Motor de Audio Real
   Tablero interactivo con gauges analógicos/digitales y síntesis
   acústica de alta fidelidad para motores diésel de 15L,
   frenos de motor Jake Brake, cajas Fuller y cornetas neumáticas.
   ============================================================ */

(function initDashboardSimulator() {
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

  let currentRpm = 0;
  let targetRpm = 0;
  let currentSpeed = 0;
  let targetSpeed = 0;
  let currentTurbo = 0;
  let targetTurbo = 0;
  let currentAir = 120;
  let currentGear = "N";

  // Web Audio API Synthesizer
  let audioCtx = null;
  let engineGain = null;
  let engineOsc1 = null;
  let engineOsc2 = null;
  let engineOscSub = null;
  let engineFilter = null;
  let turboOsc = null;
  let turboGain = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API no soportado.", e);
    }
  }

  function startEngineSound() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    // Osciladores armónicos para emular el bloque de 6 cilindros y 15L
    engineOsc1 = audioCtx.createOscillator();
    engineOsc2 = audioCtx.createOscillator();
    engineOscSub = audioCtx.createOscillator();
    engineFilter = audioCtx.createBiquadFilter();
    engineGain = audioCtx.createGain();

    engineOsc1.type = "sawtooth";
    engineOsc2.type = "triangle";
    engineOscSub.type = "sine";

    engineOsc1.frequency.setValueAtTime(32, audioCtx.currentTime); // Frecuencia fundamental a 650 RPM
    engineOsc2.frequency.setValueAtTime(64, audioCtx.currentTime);
    engineOscSub.frequency.setValueAtTime(24, audioCtx.currentTime); // Sub-bajo acústico de escape

    engineFilter.type = "lowpass";
    engineFilter.frequency.setValueAtTime(260, audioCtx.currentTime);
    engineFilter.Q.setValueAtTime(3.5, audioCtx.currentTime);

    engineGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    engineGain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.4);

    engineOsc1.connect(engineFilter);
    engineOsc2.connect(engineFilter);
    engineOscSub.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(audioCtx.destination);

    engineOsc1.start();
    engineOsc2.start();
    engineOscSub.start();

    // Silbido del Turbo
    turboOsc = audioCtx.createOscillator();
    turboGain = audioCtx.createGain();
    const turboFilter = audioCtx.createBiquadFilter();

    turboOsc.type = "sine";
    turboOsc.frequency.setValueAtTime(950, audioCtx.currentTime);

    turboFilter.type = "bandpass";
    turboFilter.frequency.setValueAtTime(1300, audioCtx.currentTime);
    turboFilter.Q.setValueAtTime(6, audioCtx.currentTime);

    turboGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

    turboOsc.connect(turboFilter);
    turboFilter.connect(turboGain);
    turboGain.connect(audioCtx.destination);
    turboOsc.start();
  }

  function stopEngineSound() {
    if (!audioCtx || !engineGain) return;
    try {
      engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
      if (turboGain) turboGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.15);
      setTimeout(() => {
        if (engineOsc1) { engineOsc1.stop(); engineOsc1.disconnect(); engineOsc1 = null; }
        if (engineOsc2) { engineOsc2.stop(); engineOsc2.disconnect(); engineOsc2 = null; }
        if (engineOscSub) { engineOscSub.stop(); engineOscSub.disconnect(); engineOscSub = null; }
        if (turboOsc) { turboOsc.stop(); turboOsc.disconnect(); turboOsc = null; }
      }, 250);
    } catch (e) {}
  }

  function updateEngineSound(rpm, turboPsi) {
    if (!audioCtx || !engineOsc1 || !isRunning) return;
    const norm = Math.max(0, Math.min(1, (rpm - 600) / 1600));
    const baseFreq = 30 + norm * 60;
    engineOsc1.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.08);
    engineOsc2.frequency.setTargetAtTime(baseFreq * 2, audioCtx.currentTime, 0.08);
    if (engineOscSub) engineOscSub.frequency.setTargetAtTime(baseFreq * 0.75, audioCtx.currentTime, 0.08);
    engineFilter.frequency.setTargetAtTime(240 + norm * 400, audioCtx.currentTime, 0.08);

    if (turboGain && turboOsc) {
      const turboFreq = 850 + (turboPsi / 35) * 1900;
      const turboVol = Math.max(0.001, (turboPsi / 35) * 0.09);
      turboOsc.frequency.setTargetAtTime(turboFreq, audioCtx.currentTime, 0.1);
      turboGain.gain.setTargetAtTime(turboVol, audioCtx.currentTime, 0.1);
    }
  }

  /* ============================================================
     SONIDOS INDEPENDIENTES PARA EL SOUNDBOARD REAL
     ============================================================ */

  // 1. Sonido de Arranque y Ralentí Diésel
  window.playIdleSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    // Sonido de arranque inicial (Motor de partida + ignición)
    const starterOsc = audioCtx.createOscillator();
    const starterGain = audioCtx.createGain();
    starterOsc.type = "sawtooth";
    starterOsc.frequency.setValueAtTime(20, audioCtx.currentTime);
    starterOsc.frequency.linearRampToValueAtTime(36, audioCtx.currentTime + 0.6);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 220;

    starterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    starterGain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.3);
    starterGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.2);

    starterOsc.connect(filter);
    filter.connect(starterGain);
    starterGain.connect(audioCtx.destination);

    starterOsc.start();
    starterOsc.stop(audioCtx.currentTime + 2.3);

    setTimeout(() => {
      if (window.playAirPurgeSound) window.playAirPurgeSound();
    }, 1200);
  };

  // 2. Sonido de Aceleración y Soplido de Turbo
  window.playRevSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const turbo = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const turboGainNode = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(35, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.8);
    osc.frequency.linearRampToValueAtTime(32, t + 2.0);

    turbo.type = "sine";
    turbo.frequency.setValueAtTime(800, t);
    turbo.frequency.linearRampToValueAtTime(2400, t + 0.8);
    turbo.frequency.linearRampToValueAtTime(700, t + 2.2);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, t);
    filter.frequency.linearRampToValueAtTime(650, t + 0.8);
    filter.frequency.linearRampToValueAtTime(220, t + 2.2);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.3);

    turboGainNode.gain.setValueAtTime(0.001, t);
    turboGainNode.gain.linearRampToValueAtTime(0.08, t + 0.8);
    turboGainNode.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    turbo.connect(turboGainNode);
    turboGainNode.connect(audioCtx.destination);

    osc.start(t);
    turbo.start(t);
    osc.stop(t + 2.4);
    turbo.stop(t + 2.4);
  };

  // 3. Sonido de Freno de Motor Jake Brake (Traqueteo de descompresión en descenso)
  window.playJakeBrakeSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;
    // Ráfaga de pulsos de compresión (12 disparos rápidos de cilindro)
    for (let i = 0; i < 16; i++) {
      const pulseTime = t + i * 0.08;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(55 - i * 1.5, pulseTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 380;
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0.22, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.01, pulseTime + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.075);
    }
  };

  // 4. Sonido de Corneta de Aire Neumática Doble Trompeta (Hadley)
  window.playAirHornSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;
    const freqs = [311.13, 369.99, 466.16, 622.25];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.value = f;

      filter.type = "lowpass";
      filter.frequency.value = 1600;

      const vol = idx === 0 || idx === 1 ? 0.11 : 0.06;
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 1.0);
    });
  };

  // 5. Sonido de Purga de Aire Neumático (Válvula secadora Bendix)
  window.playAirPurgeSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const bufferSize = audioCtx.sampleRate * 0.45;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1900;
    filter.Q.value = 2.0;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.24, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  };

  // 6. Sonido de Pase de Caja Eaton Fuller 18 Vel (Engrane + Switch de Rango)
  window.playShiftSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;
    // Golpe de engranaje mecánico (Click-clack metálico)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.16);

    // Soplido breve de aire del selector neumático
    setTimeout(() => {
      if (window.playAirPurgeSound) window.playAirPurgeSound();
    }, 140);
  };

  /* ============================================================
     CICLO DE ANIMACIÓN DE GAUGES DEL TABLERO
     ============================================================ */
  function updateGauges() {
    currentRpm += (targetRpm - currentRpm) * 0.12;
    currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    currentTurbo += (targetTurbo - currentTurbo) * 0.15;

    // Tacómetro: 0 a 2500 RPM -> -120deg a +120deg
    const rpmAngle = -120 + (currentRpm / 2500) * 240;
    if (rpmNeedle) rpmNeedle.style.transform = `rotate(${rpmAngle}deg)`;

    // Velocímetro: 0 a 140 km/h -> -120deg a +120deg
    const speedAngle = -120 + (currentSpeed / 140) * 240;
    if (speedNeedle) speedNeedle.style.transform = `rotate(${speedAngle}deg)`;

    // Turbo: 0 a 40 PSI -> -110deg a +110deg
    const turboAngle = -110 + (currentTurbo / 40) * 220;
    if (turboNeedle) turboNeedle.style.transform = `rotate(${turboAngle}deg)`;

    // Aire: 0 a 150 PSI -> -100deg a +100deg
    const airAngle = -100 + (currentAir / 150) * 200;
    if (airNeedle1) airNeedle1.style.transform = `rotate(${airAngle}deg)`;
    if (airNeedle2) airNeedle2.style.transform = `rotate(${airAngle - 2}deg)`;

    // Textos digitales
    if (rpmValueEl) rpmValueEl.textContent = Math.round(currentRpm);
    if (speedValueEl) speedValueEl.textContent = Math.round(currentSpeed);
    if (gearValueEl) gearValueEl.textContent = currentGear;
    if (turboValueEl) turboValueEl.textContent = Math.round(currentTurbo);

    if (isRunning) {
      updateEngineSound(currentRpm, currentTurbo);
    }

    requestAnimationFrame(updateGauges);
  }

  function toggleIgnition() {
    initAudio();
    isRunning = !isRunning;

    if (isRunning) {
      ignitionBtn.classList.add("active");
      ignitionBtn.innerHTML = "<span>🛑</span> APAGAR MOTOR";

      if (ledCheckEngine) ledCheckEngine.classList.add("active");
      if (ledAirLow) ledAirLow.classList.add("active");
      if (ledDiffLock) ledDiffLock.classList.add("active");

      targetRpm = 650;
      targetSpeed = 0;
      targetTurbo = 2;
      currentAir = 120;
      currentGear = "N";

      startEngineSound();

      setTimeout(() => {
        if (ledCheckEngine) ledCheckEngine.classList.remove("active");
        if (ledAirLow) ledAirLow.classList.remove("active");
        if (ledDiffLock) ledDiffLock.classList.remove("active");
        window.playAirPurgeSound();
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
      stopEngineSound();
    }
  }

  const ytAudioFrame = document.getElementById("dashThrottleAudioFrame");

  function sendYtCommand(func, args = []) {
    if (ytAudioFrame && ytAudioFrame.contentWindow) {
      try {
        ytAudioFrame.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: func, args: args }),
          "*"
        );
      } catch (e) {}
    }
  }

  function startThrottle() {
    if (!isRunning) {
      toggleIgnition();
    }
    isThrottling = true;
    throttleBtn.classList.add("active");
    targetRpm = 1950;
    targetSpeed = 75;
    targetTurbo = 35;
    currentGear = "7H";

    // Reproducir audio real de YouTube Shorts (sHmaSbjKC0E)
    sendYtCommand("playVideo");
    sendYtCommand("unMute");
    sendYtCommand("setVolume", [100]);

    if (window.playRevSound) window.playRevSound();
  }

  function stopThrottle() {
    if (!isThrottling) return;
    isThrottling = false;
    throttleBtn.classList.remove("active");
    targetRpm = isRunning ? 650 : 0;
    targetSpeed = 0;
    targetTurbo = isRunning ? 2 : 0;
    currentGear = isRunning ? "N" : "P";

    // Pausar audio de YouTube y descargar válvula de alivio
    sendYtCommand("pauseVideo");
    window.playAirPurgeSound();
  }

  // Event Listeners
  ignitionBtn.addEventListener("click", toggleIgnition);

  throttleBtn.addEventListener("mousedown", startThrottle);
  throttleBtn.addEventListener("mouseup", stopThrottle);
  throttleBtn.addEventListener("mouseleave", stopThrottle);
  throttleBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startThrottle(); }, { passive: false });
  throttleBtn.addEventListener("touchend", stopThrottle);

  if (jakeBtn) {
    jakeBtn.addEventListener("click", () => {
      if (!isRunning) return;
      isJakeActive = true;
      if (ledJake) ledJake.classList.add("active");
      jakeBtn.classList.add("active");
      targetRpm = Math.max(800, currentRpm - 500);
      window.playJakeBrakeSound();
      setTimeout(() => {
        isJakeActive = false;
        if (ledJake) ledJake.classList.remove("active");
        jakeBtn.classList.remove("active");
      }, 1300);
    });
  }

  if (hornBtn) {
    hornBtn.addEventListener("click", () => {
      hornBtn.classList.add("active");
      window.playAirHornSound();
      setTimeout(() => hornBtn.classList.remove("active"), 400);
    });
  }

  updateGauges();
})();

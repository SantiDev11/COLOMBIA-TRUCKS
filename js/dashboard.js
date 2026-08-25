/* ============================================================
   COLOMBIA TRUCKS — Simulador de Tablero & Clúster Heavy Duty
   Síntesis Acústica Diésel de Alta Fidelidad (Web Audio API)
   - Motor 15L Cummins X15 / Caterpillar C15 con combustión real
   - Secuencia de arranque con barrido de agujas (Sweep Check)
   - Freno de motor Jake Brake con descompresión de 3 etapas
   - Corneta neumática doble Hadley & Grover
   - Soplido de turbo spool presurizando a 35 PSI
   - Cajas Eaton Fuller de 18 velocidades sincronizadas
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

  // Web Audio API Synthesizer
  let audioCtx = null;
  let engineGain = null;
  let engineOsc1 = null;
  let engineOsc2 = null;
  let engineOscSub = null;
  let engineNoiseNode = null;
  let engineFilter = null;
  let turboOsc = null;
  let turboGain = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API no disponible.", e);
    }
  }

  /* ============================================================
     1. MOTOR DIÉSEL CONTINUO (RALENTÍ & ACELERACIÓN REAL)
     ============================================================ */
  function startEngineSound() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    stopEngineSound();

    const t = audioCtx.currentTime;

    // 1. Osciladores armónicos (Cilindros diésel)
    engineOsc1 = audioCtx.createOscillator();
    engineOsc2 = audioCtx.createOscillator();
    engineOscSub = audioCtx.createOscillator();
    engineFilter = audioCtx.createBiquadFilter();
    engineGain = audioCtx.createGain();

    engineOsc1.type = "sawtooth";
    engineOsc2.type = "triangle";
    engineOscSub.type = "sine";

    engineOsc1.frequency.setValueAtTime(32, t);
    engineOsc2.frequency.setValueAtTime(64, t);
    engineOscSub.frequency.setValueAtTime(22, t);

    engineFilter.type = "lowpass";
    engineFilter.frequency.setValueAtTime(260, t);
    engineFilter.Q.setValueAtTime(4.0, t);

    // 2. Ruido blanco filtrado para pulsos de combustión e inyección
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.3;
    }

    engineNoiseNode = audioCtx.createBufferSource();
    engineNoiseNode.buffer = noiseBuffer;
    engineNoiseNode.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(140, t);
    noiseFilter.Q.setValueAtTime(2.5, t);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.08, t);

    engineNoiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(engineFilter);

    // Conectar osciladores
    engineOsc1.connect(engineFilter);
    engineOsc2.connect(engineFilter);
    engineOscSub.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(audioCtx.destination);

    engineGain.gain.setValueAtTime(0.01, t);
    engineGain.gain.exponentialRampToValueAtTime(0.22, t + 0.5);

    engineOsc1.start(t);
    engineOsc2.start(t);
    engineOscSub.start(t);
    engineNoiseNode.start(t);

    // 3. Silbido continuo del Turbo
    turboOsc = audioCtx.createOscillator();
    turboGain = audioCtx.createGain();
    const turboFilter = audioCtx.createBiquadFilter();

    turboOsc.type = "sine";
    turboOsc.frequency.setValueAtTime(950, t);

    turboFilter.type = "bandpass";
    turboFilter.frequency.setValueAtTime(1400, t);
    turboFilter.Q.setValueAtTime(6.5, t);

    turboGain.gain.setValueAtTime(0.002, t);

    turboOsc.connect(turboFilter);
    turboFilter.connect(turboGain);
    turboGain.connect(audioCtx.destination);
    turboOsc.start(t);
  }

  function stopEngineSound() {
    if (!audioCtx || !engineGain) return;
    try {
      const t = audioCtx.currentTime;
      engineGain.gain.setTargetAtTime(0, t, 0.12);
      if (turboGain) turboGain.gain.setTargetAtTime(0, t, 0.12);
      setTimeout(() => {
        if (engineOsc1) { try { engineOsc1.stop(); engineOsc1.disconnect(); } catch(e){} engineOsc1 = null; }
        if (engineOsc2) { try { engineOsc2.stop(); engineOsc2.disconnect(); } catch(e){} engineOsc2 = null; }
        if (engineOscSub) { try { engineOscSub.stop(); engineOscSub.disconnect(); } catch(e){} engineOscSub = null; }
        if (engineNoiseNode) { try { engineNoiseNode.stop(); engineNoiseNode.disconnect(); } catch(e){} engineNoiseNode = null; }
        if (turboOsc) { try { turboOsc.stop(); turboOsc.disconnect(); } catch(e){} turboOsc = null; }
      }, 250);
    } catch (e) {}
  }

  function updateEngineSound(rpm, turboPsi) {
    if (!audioCtx || !engineOsc1 || !isRunning) return;
    const t = audioCtx.currentTime;
    const norm = Math.max(0, Math.min(1, (rpm - 600) / 1600));
    const baseFreq = 30 + norm * 65;

    engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.06);
    engineOsc2.frequency.setTargetAtTime(baseFreq * 2, t, 0.06);
    if (engineOscSub) engineOscSub.frequency.setTargetAtTime(baseFreq * 0.75, t, 0.06);
    if (engineFilter) engineFilter.frequency.setTargetAtTime(240 + norm * 450, t, 0.06);

    if (turboGain && turboOsc) {
      const turboFreq = 850 + (turboPsi / 35) * 2100;
      const turboVol = Math.max(0.001, (turboPsi / 35) * 0.11);
      turboOsc.frequency.setTargetAtTime(turboFreq, t, 0.08);
      turboGain.gain.setTargetAtTime(turboVol, t, 0.08);
    }
  }

  /* ============================================================
     2. EFECTOS DE AUDIO INDEPENDIENTES (SOUNDBOARD & ATRIBUTOS)
     ============================================================ */

  // A. Sonido de Arranque y Encendido de Motor (Starter Crank + Catch)
  window.playStarterSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;

    // Ráfaga de motor de arranque eléctrico
    for (let i = 0; i < 4; i++) {
      const crankTime = t + i * 0.18;
      const crankOsc = audioCtx.createOscillator();
      const crankGain = audioCtx.createGain();
      crankOsc.type = "sawtooth";
      crankOsc.frequency.setValueAtTime(24 + i * 4, crankTime);
      crankGain.gain.setValueAtTime(0.2, crankTime);
      crankGain.gain.exponentialRampToValueAtTime(0.01, crankTime + 0.15);

      crankOsc.connect(crankGain);
      crankGain.connect(audioCtx.destination);
      crankOsc.start(crankTime);
      crankOsc.stop(crankTime + 0.16);
    }

    // Rugido de encendido en t + 0.75s
    setTimeout(() => {
      if (window.playRevSound) window.playRevSound();
      if (window.playAirPurgeSound) {
        setTimeout(window.playAirPurgeSound, 1100);
      }
    }, 750);
  };

  // B. Sonido de Aceleración a Fondo & Turbo Boost
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
    osc.frequency.setValueAtTime(32, t);
    osc.frequency.linearRampToValueAtTime(95, t + 0.75);
    osc.frequency.linearRampToValueAtTime(32, t + 2.1);

    turbo.type = "sine";
    turbo.frequency.setValueAtTime(750, t);
    turbo.frequency.linearRampToValueAtTime(2600, t + 0.75);
    turbo.frequency.linearRampToValueAtTime(650, t + 2.2);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, t);
    filter.frequency.linearRampToValueAtTime(750, t + 0.75);
    filter.frequency.linearRampToValueAtTime(240, t + 2.2);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.3);

    turboGainNode.gain.setValueAtTime(0.001, t);
    turboGainNode.gain.linearRampToValueAtTime(0.12, t + 0.75);
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

  // C. Sonido de Freno de Motor Jake Brake (Traqueteo de Descompresión)
  window.playJakeBrakeSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;
    // Ráfaga de pulsos de compresión (18 disparos rápidos de cilindro)
    for (let i = 0; i < 20; i++) {
      const pulseTime = t + i * 0.065;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = "square";
      osc.frequency.setValueAtTime(55 - i * 0.6, pulseTime);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(320 + (i % 2) * 80, pulseTime);
      filter.Q.setValueAtTime(3.5, pulseTime);

      gain.gain.setValueAtTime(0.28, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.06);
    }
  };

  // D. Sonido de Corneta Neumática Doble Hadley / Grover
  window.playAirHornSound = function() {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const t = audioCtx.currentTime;
    // Tonos dobles de trompeta neumática (220 Hz y 277 Hz - Armonía F#)
    const horn1 = audioCtx.createOscillator();
    const horn2 = audioCtx.createOscillator();
    const hornSub = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    horn1.type = "sawtooth";
    horn2.type = "sawtooth";
    hornSub.type = "triangle";

    horn1.frequency.setValueAtTime(220, t);
    horn2.frequency.setValueAtTime(277.18, t);
    hornSub.frequency.setValueAtTime(110, t);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(650, t);
    filter.Q.setValueAtTime(1.8, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
    gain.gain.setValueAtTime(0.35, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    horn1.connect(filter);
    horn2.connect(filter);
    hornSub.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    horn1.start(t);
    horn2.start(t);
    hornSub.start(t);
    horn1.stop(t + 0.7);
    horn2.stop(t + 0.7);
    hornSub.stop(t + 0.7);
  };

  // E. Sonido de Purga de Aire Secador (Psssshhh)
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
    filter.frequency.value = 1950;
    filter.Q.value = 2.2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.26, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  };

  /* ============================================================
     3. CICLO DE ANIMACIÓN DE GAUGES CON FÍSICA & VIBRACIÓN
     ============================================================ */
  function updateGauges() {
    // Suavizado dinámico de agujas
    currentRpm += (targetRpm - currentRpm) * 0.12;
    currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    currentTurbo += (targetTurbo - currentTurbo) * 0.15;

    // Vibración sutil de ralentí en las agujas cuando el motor está encendido
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

    if (isRunning && !isSweepChecking) {
      updateEngineSound(currentRpm, currentTurbo);
    }

    requestAnimationFrame(updateGauges);
  }

  // Barrido de agujas inicial (Sweep Check)
  function runSweepCheck() {
    isSweepChecking = true;
    targetRpm = 2400;
    targetSpeed = 135;
    targetTurbo = 38;
    targetSpeed = 130;

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
     4. CONTROLES DEL TABLERO (ARRANQUE, ACELERADOR, JAKE, CORNETA)
     ============================================================ */
  function toggleIgnition() {
    initAudio();
    isRunning = !isRunning;

    if (isRunning) {
      ignitionBtn.classList.add("active");
      ignitionBtn.innerHTML = "<span>🛑</span> APAGAR MOTOR";

      if (ledCheckEngine) ledCheckEngine.classList.add("active");
      if (ledAirLow) ledAirLow.classList.add("active");
      if (ledDiffLock) ledDiffLock.classList.add("active");

      // Barrido de agujas al encender
      runSweepCheck();

      // Iniciar sonido diésel
      startEngineSound();

      // Notificar al favicon animado
      if (window.AnimatedFavicon && window.AnimatedFavicon.setEngineActive) {
        window.AnimatedFavicon.setEngineActive(true);
      }

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

    if (window.playAirPurgeSound) window.playAirPurgeSound();
  }

  // Event Listeners del Tablero
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
      targetRpm = Math.max(900, currentRpm - 500);
      window.playJakeBrakeSound();
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
      window.playAirHornSound();
      setTimeout(() => hornBtn.classList.remove("active"), 450);
    });
  }

  // Iniciar ciclo de actualización de agujas
  updateGauges();
})();

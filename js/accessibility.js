/* ============================================================
   COLOMBIA TRUCKS — Módulo de Accesibilidad Avanzada (A11y Engine)
   Arquitectura moderna, modular y compatible con WCAG 2.1/2.2
   - Control de escala tipográfica fluida
   - Modos visuales: Alto contraste, Escala de grises, Dislexia, Espaciado
   - Asistente de Voz (TTS - SpeechSynthesis) en Español
   - Regla de lectura visual interactiva para TDAH
   - Gestión accesible de foco (Focus Trap) y atajos de teclado
   - Persistencia completa en localStorage
   ============================================================ */

(function initAccessibilityModule() {
  "use strict";

  const STORAGE_KEY = "colombia_trucks_a11y_prefs";

  // Estado por defecto
  const defaultState = {
    fontScale: 1.0,
    highContrast: false,
    grayscale: false,
    invertColors: false,
    dyslexiaFont: false,
    spacedText: false,
    highlightInteractive: false,
    bigCursor: false,
    stopAnimations: false,
    readingGuide: false,
    ttsActive: false,
    ttsRate: 1.0
  };

  let state = { ...defaultState };

  // Cargar estado persistido
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("A11y: No se pudo cargar preferencias desde localStorage", e);
  }

  // Elementos DOM
  const a11yFab = document.getElementById("a11yFab");
  const a11yBackdrop = document.getElementById("a11yBackdrop");
  const a11yCloseBtn = document.getElementById("a11yCloseBtn");
  const a11yActiveBadge = document.getElementById("a11yActiveBadge");
  const a11yLiveAnnouncer = document.getElementById("a11yLiveAnnouncer");
  const a11yToast = document.getElementById("a11yToast");
  const a11yReadingGuide = document.getElementById("a11yReadingGuide");
  const a11yTtsFloatingBar = document.getElementById("a11yTtsFloatingBar");
  const a11yTtsFloatingText = document.getElementById("a11yTtsFloatingText");
  const a11yTtsStopBtn = document.getElementById("a11yTtsStopBtn");

  // Botones y controles dentro del Hub
  const tabButtons = document.querySelectorAll(".a11y-tab-btn");
  const tabPanes = document.querySelectorAll(".a11y-tab-pane");

  const fontDisplay = document.getElementById("a11yFontDisplay");
  const btnFontDec = document.getElementById("a11yFontDec");
  const btnFontInc = document.getElementById("a11yFontInc");
  const btnFontReset = document.getElementById("a11yFontReset");
  const fontPillBtns = document.querySelectorAll(".a11y-pill-btn");

  const chkHighContrast = document.getElementById("chkHighContrast");
  const chkGrayscale = document.getElementById("chkGrayscale");
  const chkInvertColors = document.getElementById("chkInvertColors");
  const chkDyslexia = document.getElementById("chkDyslexia");
  const chkSpacedText = document.getElementById("chkSpacedText");
  const chkHighlight = document.getElementById("chkHighlight");
  const chkBigCursor = document.getElementById("chkBigCursor");
  const chkStopAnim = document.getElementById("chkStopAnim");
  const chkReadingGuide = document.getElementById("chkReadingGuide");
  const chkTts = document.getElementById("chkTts");

  const btnReadSummary = document.getElementById("a11yBtnReadSummary");
  const btnTtsStop = document.getElementById("a11yBtnTtsStop");
  const ttsRateBtns = document.querySelectorAll(".a11y-rate-btn");
  const soundwaveIndicator = document.getElementById("a11ySoundwave");
  const btnResetAll = document.getElementById("a11yResetAll");

  // Motor de Síntesis de Voz (Web Speech API)
  const synth = window.speechSynthesis;
  let spanishVoice = null;
  let currentUtterance = null;
  let activeHighlightedElement = null;

  function loadVoices() {
    if (!synth) return;
    const voices = synth.getVoices();
    // Priorizar voces en español (Latinoamérica, Colombia o España)
    spanishVoice = voices.find(v => v.lang === "es-CO") ||
                   voices.find(v => v.lang === "es-419") ||
                   voices.find(v => v.lang.startsWith("es")) ||
                   voices[0] || null;
  }

  if (synth) {
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }

  // Guardar estado en localStorage
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignorar errores de cuota
    }
    updateBadgeCount();
  }

  // Anunciador ARIA en vivo
  function announce(text) {
    if (!a11yLiveAnnouncer) return;
    a11yLiveAnnouncer.textContent = "";
    setTimeout(() => {
      a11yLiveAnnouncer.textContent = text;
    }, 50);
  }

  // Notificación Toast accesible
  let toastTimer = null;
  function showToast(message, icon = "♿") {
    if (!a11yToast) return;
    a11yToast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    a11yToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      a11yToast.classList.remove("show");
    }, 3200);
  }

  // Conteo de ajustes activos para el badge
  function updateBadgeCount() {
    if (!a11yActiveBadge) return;
    let count = 0;
    if (state.fontScale !== 1.0) count++;
    if (state.highContrast) count++;
    if (state.grayscale) count++;
    if (state.invertColors) count++;
    if (state.dyslexiaFont) count++;
    if (state.spacedText) count++;
    if (state.highlightInteractive) count++;
    if (state.bigCursor) count++;
    if (state.stopAnimations) count++;
    if (state.readingGuide) count++;
    if (state.ttsActive) count++;

    if (count > 0) {
      a11yActiveBadge.textContent = count;
      a11yActiveBadge.classList.add("visible");
    } else {
      a11yActiveBadge.classList.remove("visible");
    }
  }

  // ============================================================
  // APLICACIÓN DE ESTILOS Y CLASES SEGÚN EL ESTADO
  // ============================================================
  function applyState() {
    const root = document.documentElement;
    const body = document.body;

    // 1. Escala tipográfica
    root.style.setProperty("--a11y-font-scale", state.fontScale);
    if (fontDisplay) {
      fontDisplay.textContent = `${Math.round(state.fontScale * 100)}%`;
    }
    fontPillBtns.forEach(btn => {
      const scaleVal = parseFloat(btn.getAttribute("data-scale"));
      btn.classList.toggle("active", Math.abs(scaleVal - state.fontScale) < 0.02);
    });

    // 2. Modos visuales en <body>
    body.classList.toggle("a11y-high-contrast", state.highContrast);
    body.classList.toggle("a11y-grayscale", state.grayscale);
    body.classList.toggle("a11y-invert-colors", state.invertColors);
    body.classList.toggle("a11y-dyslexia-font", state.dyslexiaFont);
    body.classList.toggle("a11y-spaced-text", state.spacedText);
    body.classList.toggle("a11y-highlight-interactive", state.highlightInteractive);
    body.classList.toggle("a11y-big-cursor", state.bigCursor);
    body.classList.toggle("a11y-stop-animations", state.stopAnimations);

    // 3. Sincronizar checkboxes del DOM
    if (chkHighContrast) chkHighContrast.checked = state.highContrast;
    if (chkGrayscale) chkGrayscale.checked = state.grayscale;
    if (chkInvertColors) chkInvertColors.checked = state.invertColors;
    if (chkDyslexia) chkDyslexia.checked = state.dyslexiaFont;
    if (chkSpacedText) chkSpacedText.checked = state.spacedText;
    if (chkHighlight) chkHighlight.checked = state.highlightInteractive;
    if (chkBigCursor) chkBigCursor.checked = state.bigCursor;
    if (chkStopAnim) chkStopAnim.checked = state.stopAnimations;
    if (chkReadingGuide) chkReadingGuide.checked = state.readingGuide;
    if (chkTts) chkTts.checked = state.ttsActive;

    // 4. Regla de lectura
    if (a11yReadingGuide) {
      if (state.readingGuide) {
        a11yReadingGuide.removeAttribute("hidden");
      } else {
        a11yReadingGuide.setAttribute("hidden", "true");
      }
    }

    // 5. Botones de velocidad TTS
    ttsRateBtns.forEach(btn => {
      const rateVal = parseFloat(btn.getAttribute("data-rate"));
      btn.classList.toggle("active", Math.abs(rateVal - state.ttsRate) < 0.05);
    });

    // 6. Tarjetas de control activas (feedback visual)
    document.querySelectorAll(".a11y-control-card").forEach(card => {
      const input = card.querySelector("input[type='checkbox']");
      if (input) {
        card.classList.toggle("active", input.checked);
      }
    });

    updateBadgeCount();
  }

  // ============================================================
  // GESTIÓN DEL MODAL / HUB (APERTURA, CIERRE, FOCUS TRAP)
  // ============================================================
  let previousActiveElement = null;

  function openHub() {
    if (!a11yBackdrop) return;
    previousActiveElement = document.activeElement;
    a11yBackdrop.removeAttribute("hidden");
    // Forzar reflow para animación fluida
    void a11yBackdrop.offsetWidth;
    a11yBackdrop.classList.add("open");
    if (a11yFab) a11yFab.setAttribute("aria-expanded", "true");
    announce("Panel de accesibilidad abierto");

    // Foco en el botón de cerrar o primer control
    if (a11yCloseBtn) {
      setTimeout(() => a11yCloseBtn.focus(), 150);
    }
  }

  function closeHub() {
    if (!a11yBackdrop) return;
    a11yBackdrop.classList.remove("open");
    if (a11yFab) a11yFab.setAttribute("aria-expanded", "false");
    announce("Panel de accesibilidad cerrado");

    setTimeout(() => {
      a11yBackdrop.setAttribute("hidden", "true");
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    }, 350);
  }

  if (a11yFab) {
    a11yFab.addEventListener("click", () => {
      const isOpen = a11yBackdrop && a11yBackdrop.classList.contains("open");
      if (isOpen) closeHub();
      else openHub();
    });
  }

  if (a11yCloseBtn) {
    a11yCloseBtn.addEventListener("click", closeHub);
  }

  if (a11yBackdrop) {
    a11yBackdrop.addEventListener("click", (e) => {
      if (e.target === a11yBackdrop) closeHub();
    });
  }

  // Focus Trap dentro del Modal
  window.addEventListener("keydown", (e) => {
    // Abrir/Cerrar con Alt + A
    if (e.altKey && (e.key.toLowerCase() === "a" || e.code === "KeyA")) {
      e.preventDefault();
      const isOpen = a11yBackdrop && a11yBackdrop.classList.contains("open");
      if (isOpen) closeHub();
      else openHub();
      return;
    }

    // Atajo Alt + L: Conmutar Lector de Voz
    if (e.altKey && (e.key.toLowerCase() === "l" || e.code === "KeyL")) {
      e.preventDefault();
      state.ttsActive = !state.ttsActive;
      saveState();
      applyState();
      showToast(state.ttsActive ? "Lector de voz activado" : "Lector de voz desactivado", "🎙️");
      announce(state.ttsActive ? "Lector de voz activado" : "Lector de voz desactivado");
      return;
    }

    // Atajo Alt + R: Conmutar Regla de Lectura
    if (e.altKey && (e.key.toLowerCase() === "r" || e.code === "KeyR")) {
      // Solo si el panel no está en foco para no colisionar con rutas
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (activeTag !== "input" && activeTag !== "textarea") {
        e.preventDefault();
        state.readingGuide = !state.readingGuide;
        saveState();
        applyState();
        showToast(state.readingGuide ? "Guía de lectura activada" : "Guía de lectura desactivada", "📏");
        return;
      }
    }

    // Cerrar con Escape
    if (e.key === "Escape") {
      if (synth && synth.speaking) {
        stopSpeech();
      }
      if (a11yBackdrop && a11yBackdrop.classList.contains("open")) {
        closeHub();
      }
      return;
    }

    // Trampa de foco (Tab loop)
    if (a11yBackdrop && a11yBackdrop.classList.contains("open") && e.key === "Tab") {
      const focusable = a11yBackdrop.querySelectorAll(
        "button:not([disabled]), input:not([disabled]), [tabindex='0']"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  // Pestañas del Hub
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const activePane = document.getElementById(`tabPane-${targetTab}`);
      if (activePane) activePane.classList.add("active");
    });
  });

  // ============================================================
  // CONTROLES DE TIPOGRAFÍA & ZOOM
  // ============================================================
  function setFontScale(newScale) {
    state.fontScale = Math.min(1.6, Math.max(0.8, Math.round(newScale * 100) / 100));
    saveState();
    applyState();
    announce(`Tamaño de texto ajustado al ${Math.round(state.fontScale * 100)} por ciento`);
  }

  if (btnFontInc) {
    btnFontInc.addEventListener("click", () => setFontScale(state.fontScale + 0.1));
  }
  if (btnFontDec) {
    btnFontDec.addEventListener("click", () => setFontScale(state.fontScale - 0.1));
  }
  if (btnFontReset) {
    btnFontReset.addEventListener("click", () => setFontScale(1.0));
  }

  fontPillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const scale = parseFloat(btn.getAttribute("data-scale"));
      if (!isNaN(scale)) setFontScale(scale);
    });
  });

  // ============================================================
  // INTERRUPTORES Y MODOS VISUALES
  // ============================================================
  function bindToggle(inputEl, stateKey, labelName, icon) {
    if (!inputEl) return;
    inputEl.addEventListener("change", () => {
      state[stateKey] = inputEl.checked;
      saveState();
      applyState();
      const statusText = state[stateKey] ? "activado" : "desactivado";
      showToast(`${labelName} ${statusText}`, icon);
      announce(`${labelName} ${statusText}`);
    });
  }

  bindToggle(chkHighContrast, "highContrast", "Modo Alto Contraste", "👁️");
  bindToggle(chkGrayscale, "grayscale", "Modo Monocromático", "⚪");
  bindToggle(chkInvertColors, "invertColors", "Inversión de Colores", "🎨");
  bindToggle(chkDyslexia, "dyslexiaFont", "Tipografía para Dislexia", "📖");
  bindToggle(chkSpacedText, "spacedText", "Espaciado de Texto", "📏");
  bindToggle(chkHighlight, "highlightInteractive", "Resaltar Enlaces", "🔗");
  bindToggle(chkBigCursor, "bigCursor", "Cursor Gigante", "🖱️");
  bindToggle(chkStopAnim, "stopAnimations", "Detener Animaciones", "⏸️");
  bindToggle(chkReadingGuide, "readingGuide", "Guía de Lectura", "📏");
  bindToggle(chkTts, "ttsActive", "Lector de Voz", "🎙️");

  // ============================================================
  // REGLA DE LECTURA VISUAL (READING RULER)
  // ============================================================
  window.addEventListener("mousemove", (e) => {
    if (!state.readingGuide || !a11yReadingGuide) return;
    a11yReadingGuide.style.top = `${e.clientY}px`;
  }, { passive: true });

  // ============================================================
  // MOTOR DE VOZ SINTETIZADA (TEXT TO SPEECH)
  // ============================================================
  function stopSpeech() {
    if (!synth) return;
    synth.cancel();
    if (activeHighlightedElement) {
      activeHighlightedElement.classList.remove("a11y-tts-active-element");
      activeHighlightedElement = null;
    }
    if (soundwaveIndicator) soundwaveIndicator.classList.remove("speaking");
    if (a11yTtsFloatingBar) a11yTtsFloatingBar.setAttribute("hidden", "true");
  }

  function speakText(text, targetElement = null) {
    if (!synth) {
      showToast("Tu navegador no soporta síntesis de voz", "⚠️");
      return;
    }

    stopSpeech();

    if (!text || text.trim() === "") return;

    const cleanText = text.replace(/[\n\r\t]+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.lang = "es-CO";
    utterance.rate = state.ttsRate || 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (targetElement) {
        activeHighlightedElement = targetElement;
        targetElement.classList.add("a11y-tts-active-element");
      }
      if (soundwaveIndicator) soundwaveIndicator.classList.add("speaking");
      if (a11yTtsFloatingBar) {
        a11yTtsFloatingBar.removeAttribute("hidden");
        if (a11yTtsFloatingText) {
          a11yTtsFloatingText.textContent = cleanText.length > 35 ? cleanText.substring(0, 35) + "..." : cleanText;
        }
      }
    };

    utterance.onend = () => {
      if (activeHighlightedElement) {
        activeHighlightedElement.classList.remove("a11y-tts-active-element");
        activeHighlightedElement = null;
      }
      if (soundwaveIndicator) soundwaveIndicator.classList.remove("speaking");
      if (a11yTtsFloatingBar) a11yTtsFloatingBar.setAttribute("hidden", "true");
    };

    utterance.onerror = () => {
      stopSpeech();
    };

    currentUtterance = utterance;
    synth.speak(utterance);
  }

  // Lectura interactiva al hacer clic sobre elementos con TTS activo
  document.addEventListener("click", (e) => {
    if (!state.ttsActive) return;

    // Si se hizo clic dentro del hub de accesibilidad o en botones de control, no leer
    if (e.target.closest("#a11yBackdrop") || e.target.closest("#a11yFab") || e.target.closest(".a11y-tts-floating-bar")) {
      return;
    }

    const readable = e.target.closest("h1, h2, h3, h4, p, .btn, .stat-card, .route-item-btn, .truck-card, .footer-desc");
    if (readable) {
      const textToRead = readable.innerText || readable.textContent;
      speakText(textToRead, readable);
    }
  });

  if (btnTtsStop) btnTtsStop.addEventListener("click", stopSpeech);
  if (a11yTtsStopBtn) a11yTtsStopBtn.addEventListener("click", stopSpeech);

  if (btnReadSummary) {
    btnReadSummary.addEventListener("click", () => {
      const summaryText = "Bienvenido a Colombia Trucks. Plataforma interactiva dedicada a los grandes tractocamiones de Colombia: Kenworth T800, International Eagle 9400i, Kenworth W900 y Kenworth T680. Puedes explorar el catálogo de camiones, el simulador interactivo de tablero con tacómetro y velocímetro, el mapa topográfico de rutas de montaña como el Alto de la Línea y el juego de destreza en carretera. Usa la tecla Tab para navegar o Alt más A para abrir este menú de accesibilidad en cualquier momento.";
      speakText(summaryText);
    });
  }

  ttsRateBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const rate = parseFloat(btn.getAttribute("data-rate"));
      if (!isNaN(rate)) {
        state.ttsRate = rate;
        saveState();
        applyState();
        showToast(`Velocidad de voz: ${rate}x`, "🎙️");
      }
    });
  });

  // ============================================================
  // RESTABLECER TODOS LOS AJUSTES (RESET GENERAL)
  // ============================================================
  if (btnResetAll) {
    btnResetAll.addEventListener("click", () => {
      stopSpeech();
      state = { ...defaultState };
      saveState();
      applyState();
      showToast("Todos los ajustes de accesibilidad han sido restablecidos", "🔄");
      announce("Ajustes de accesibilidad restablecidos a valores por defecto");
    });
  }

  // Aplicar estado inicial al cargar la página
  applyState();

  // Exportar API global en window para interoperabilidad
  window.A11yManager = {
    open: openHub,
    close: closeHub,
    speak: speakText,
    stopSpeech: stopSpeech,
    getState: () => ({ ...state }),
    setState: (newState) => {
      state = { ...state, ...newState };
      saveState();
      applyState();
    }
  };
})();

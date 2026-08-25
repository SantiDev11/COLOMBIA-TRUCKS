/* ============================================================
   COLOMBIA TRUCKS — Módulo de Introducción y Diagnóstico Inicial
   - Pantalla de carga y chequeo de sistemas ECM antes de entrar
   - Diagnósticos animados con progreso digital
   - Transición fluida y sonido de encendido con Web Audio API
   - Atajos de teclado: Enter / Espacio para entrar, Esc para saltar
   ============================================================ */

(function initIntroSplash() {
  "use strict";

  const splashEl = document.getElementById("introSplash");
  const btnEnter = document.getElementById("btnIntroEnter");
  const btnSkip = document.getElementById("btnIntroSkip");
  const progressBar = document.getElementById("introProgressBar");
  const progressPercent = document.getElementById("introProgressPercent");
  const progressLabel = document.getElementById("introProgressLabel");
  const diagStatus = document.getElementById("introDiagStatus");

  if (!splashEl) return;

  let isDismissed = false;
  let progress = 0;
  let animTimer = null;

  // Secuencia de inicialización ECM
  const diagSteps = [
    { el: document.getElementById("diagItem1"), percent: 25, label: "Verificando ECM Cummins X15..." },
    { el: document.getElementById("diagItem2"), percent: 55, label: "Presurizando tanques de aire 120 PSI..." },
    { el: document.getElementById("diagItem3"), percent: 80, label: "Sincronizando caja Fuller 18V..." },
    { el: document.getElementById("diagItem4"), percent: 100, label: "Rutas de montaña y telemetría activas..." }
  ];

  function runDiagnostics() {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (isDismissed) {
        clearInterval(interval);
        return;
      }

      if (currentStep < diagSteps.length) {
        const step = diagSteps[currentStep];
        if (step.el) step.el.classList.add("active");
        progress = step.percent;

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${progress}%`;
        if (progressLabel) progressLabel.textContent = step.label;

        currentStep++;
      } else {
        clearInterval(interval);
        if (diagStatus) {
          diagStatus.textContent = "LISTO PARA RUTA";
          diagStatus.style.color = "var(--verde-torque)";
        }
        if (progressLabel) progressLabel.textContent = "¡Todos los sistemas en verde! Presiona Entrar.";
        if (btnEnter) {
          btnEnter.style.animation = "a11yPulse 2s infinite";
        }
      }
    }, 400);
  }

  function dismissIntro(playSound = true) {
    if (isDismissed) return;
    isDismissed = true;

    if (playSound && window.playStarterSound) {
      try {
        window.playStarterSound();
      } catch (e) {}
    }

    splashEl.classList.add("dismissed");

    setTimeout(() => {
      splashEl.setAttribute("hidden", "true");
      splashEl.style.display = "none";
      // Desplazar al inicio suavemente y enfocar la navegación
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  }

  if (btnEnter) {
    btnEnter.addEventListener("click", () => dismissIntro(true));
  }

  if (btnSkip) {
    btnSkip.addEventListener("click", () => dismissIntro(false));
  }

  // Atajos de teclado para entrar rápidamente
  window.addEventListener("keydown", (e) => {
    if (isDismissed) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dismissIntro(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      dismissIntro(false);
    }
  });

  // Iniciar diagnósticos al cargar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runDiagnostics);
  } else {
    runDiagnostics();
  }

  // Exportar función global para reiniciar la intro si el usuario lo desea
  window.showIntroSplash = function() {
    isDismissed = false;
    splashEl.removeAttribute("hidden");
    splashEl.style.display = "flex";
    splashEl.classList.remove("dismissed");
    progress = 0;
    if (progressBar) progressBar.style.width = "0%";
    diagSteps.forEach(s => s.el && s.el.classList.remove("active"));
    runDiagnostics();
  };
})();

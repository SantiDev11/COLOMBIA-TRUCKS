/* ============================================================
   COLOMBIA TRUCKS — Controlador de Favicon Dinámico & Animado
   - Renderiza un favicon animado en tiempo real con Canvas 2D
   - Luces LED de gálibo parpadeantes y faros de alta potencia
   - Reacciona al encendido del motor y simulador de tablero
   - Alerta visual y cambio de título dinámico al cambiar de pestaña
   - Soporta accesibilidad (prefers-reduced-motion y modo estático)
   ============================================================ */

(function initAnimatedFavicon() {
  "use strict";

  // Crear o localizar los elementos de favicon en <head>
  let faviconLink = document.querySelector("link[rel~='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    document.head.appendChild(faviconLink);
  }

  // Favicon vectorial SVG por defecto
  const SVG_FAVICON_URL = "assets/images/favicon.svg";
  faviconLink.type = "image/svg+xml";
  faviconLink.href = SVG_FAVICON_URL;

  // Añadir Apple Touch Icon
  let appleTouchLink = document.querySelector("link[rel='apple-touch-icon']");
  if (!appleTouchLink) {
    appleTouchLink = document.createElement("link");
    appleTouchLink.rel = "apple-touch-icon";
    appleTouchLink.href = SVG_FAVICON_URL;
    document.head.appendChild(appleTouchLink);
  }

  // Canvas off-screen para renderizado dinámico
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");

  let animationId = null;
  let frame = 0;
  let isTabHidden = false;
  let engineActive = false;
  let originalTitle = document.title;
  let titleInterval = null;

  function shouldAnimate() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stopAnimSetting = document.body.classList.contains("a11y-stop-animations");
    return !reducedMotion && !stopAnimSetting;
  }

  // Dibuja el tractocamión en el canvas 32x32 con efectos de luces dinámicas
  function drawFaviconFrame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, 32, 32);

    const t = frame * 0.05;

    // 1. Fondo circular oscuro con borde dorado
    ctx.fillStyle = "#090d14";
    ctx.beginPath();
    ctx.roundRect(0, 0, 32, 32, 7);
    ctx.fill();

    ctx.strokeStyle = "#ffb703";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2. Chimeneas de escape laterales
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(4, 3, 2, 12);
    ctx.fillRect(26, 3, 2, 12);

    // 3. Techo y Cabina
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(10, 5);
    ctx.lineTo(22, 5);
    ctx.lineTo(24, 12);
    ctx.closePath();
    ctx.fill();

    // 4. Luces de gálibo en el techo (Parpadeo ámbar)
    const cabGlow = (Math.sin(t * 2) + 1) / 2;
    ctx.fillStyle = cabGlow > 0.4 ? "#ffd54f" : "#ff9800";
    ctx.fillRect(12, 4, 2, 1.5);
    ctx.fillRect(15, 3.5, 2, 1.5);
    ctx.fillRect(18, 4, 2, 1.5);

    // 5. Parabrisas
    ctx.fillStyle = "#38bdf8";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(10, 6.5, 5.5, 4.5);
    ctx.fillRect(16.5, 6.5, 5.5, 4.5);
    ctx.globalAlpha = 1.0;

    // 6. Carrocería frontal / Capó
    ctx.fillStyle = "#111827";
    ctx.fillRect(7, 12, 18, 12);

    // 7. Parrilla Vertical Cromada
    ctx.fillStyle = "#030712";
    ctx.fillRect(11, 13, 10, 10);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(11, 13, 10, 10);

    // Barras de la parrilla
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(13.5, 14); ctx.lineTo(13.5, 22);
    ctx.moveTo(16, 14); ctx.lineTo(16, 22);
    ctx.moveTo(18.5, 14); ctx.lineTo(18.5, 22);
    ctx.stroke();

    // 8. Faros LED Delanteros con Pulsación / Destello
    const headlightIntensity = engineActive ? 1.0 : (Math.sin(t * 1.5) * 0.3 + 0.7);
    
    // Faro Izquierdo
    ctx.fillStyle = `rgba(255, 234, 0, ${headlightIntensity})`;
    ctx.beginPath();
    ctx.arc(8.5, 16.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Faro Derecho
    ctx.fillStyle = `rgba(255, 234, 0, ${headlightIntensity})`;
    ctx.beginPath();
    ctx.arc(23.5, 16.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 9. Parachoques Inferior con Bandera de Colombia
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(5, 24, 22, 5);

    // Bandera de Colombia en el centro del parachoques
    ctx.fillStyle = "#ffcd00";
    ctx.fillRect(13, 25.5, 6, 1);
    ctx.fillStyle = "#003087";
    ctx.fillRect(13, 26.5, 6, 0.8);
    ctx.fillStyle = "#c8102e";
    ctx.fillRect(13, 27.3, 6, 0.8);

    // Indicador de Pestaña en Segundo Plano (Notificación LED roja parpadeante)
    if (isTabHidden && Math.floor(frame / 12) % 2 === 0) {
      ctx.fillStyle = "#ef233c";
      ctx.beginPath();
      ctx.arc(27, 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Actualizar href del favicon con el dataURL del canvas
    try {
      faviconLink.type = "image/png";
      faviconLink.href = canvas.toDataURL("image/png");
    } catch (e) {}

    frame++;
  }

  // Bucle de animación optimizado a ~15-20 FPS para no sobrecargar el navegador
  let lastTime = 0;
  const fpsInterval = 1000 / 18;

  function animateFavicon(currentTime) {
    if (!shouldAnimate()) {
      faviconLink.type = "image/svg+xml";
      faviconLink.href = SVG_FAVICON_URL;
      return;
    }

    animationId = requestAnimationFrame(animateFavicon);

    const elapsed = currentTime - lastTime;
    if (elapsed > fpsInterval) {
      lastTime = currentTime - (elapsed % fpsInterval);
      drawFaviconFrame();
    }
  }

  // Iniciar animación
  if (shouldAnimate()) {
    animationId = requestAnimationFrame(animateFavicon);
  }

  // Escuchar cambios de visibilidad de pestaña (Tab Switch Alert)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isTabHidden = true;
      let toggle = false;
      titleInterval = setInterval(() => {
        document.title = toggle
          ? "🚛 ¡Vuelve a la Ruta! · Colombia Trucks"
          : "🇨🇴 Colombia Trucks · Potencia Pesada";
        toggle = !toggle;
      }, 1400);
    } else {
      isTabHidden = false;
      clearInterval(titleInterval);
      document.title = originalTitle;
    }
  });

  // Reaccionar a eventos del simulador de cabina
  const ignitionBtn = document.getElementById("dashIgnition");
  if (ignitionBtn) {
    ignitionBtn.addEventListener("click", () => {
      engineActive = !engineActive;
    });
  }

  // API global para controlar el favicon externamente
  window.AnimatedFavicon = {
    setEngineActive: (val) => { engineActive = !!val; },
    flash: () => {
      frame += 10;
      drawFaviconFrame();
    },
    reset: () => {
      faviconLink.type = "image/svg+xml";
      faviconLink.href = SVG_FAVICON_URL;
    }
  };
})();

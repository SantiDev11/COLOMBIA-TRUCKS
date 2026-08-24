/* ============================================================
   COLOMBIA TRUCKS — Canvas Highway Simulation (Hero)
   Simulación dinámica de carretera nocturna en los Andes colombianos:
   - Capas de montañas en perspectiva
   - Líneas de asfalto y perspectiva en movimiento
   - Luces de tractocamiones (faros frontales LED y estelas de stops traseros)
   - Partículas de asfalto y neblina nocturna
   - Soporte para prefers-reduced-motion
   ============================================================ */

(function initHeroHighway() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let animationId = null;
  let mouseX = 0, targetMouseX = 0;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth || window.innerWidth;
    height = canvas.height = parent.clientHeight || 650;
  }

  // Partículas de asfalto / neblina
  const particles = [];
  const PARTICLE_COUNT = 45;

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * (height * 0.6),
        size: 1 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -0.2 - Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.4,
        hue: Math.random() > 0.8 ? "#ffb703" : "#8a99ad"
      });
    }
  }

  // Luces de camiones en carretera
  // oncoming: camiones que vienen (faros blancos/amarillos + luces de galibo ámbar en el techo)
  // outbound: camiones que van (luces rojas stop + estelas de luz)
  const truckLights = [
    { type: "oncoming", z: 0.1, speed: 0.006, lane: -0.32, color: "#fff4cc", glow: "#ffb703" },
    { type: "outbound", z: 0.4, speed: 0.008, lane: 0.28, color: "#ff2a2a", glow: "#d90429" },
    { type: "oncoming", z: 0.7, speed: 0.005, lane: -0.42, color: "#e0f2fe", glow: "#38bdf8" },
    { type: "outbound", z: 0.85, speed: 0.009, lane: 0.35, color: "#ff3333", glow: "#ef233c" }
  ];

  let roadOffset = 0;

  function drawMountains() {
    const horizonY = height * 0.48;

    // Capa de montaña lejana
    ctx.save();
    ctx.fillStyle = "#0c1520";
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    
    const mountainPointsFar = [
      [0, horizonY - 40],
      [width * 0.15, horizonY - 95],
      [width * 0.32, horizonY - 60],
      [width * 0.50, horizonY - 120],
      [width * 0.68, horizonY - 70],
      [width * 0.85, horizonY - 110],
      [width, horizonY - 45],
      [width, horizonY],
      [0, horizonY]
    ];

    mountainPointsFar.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    });
    ctx.closePath();
    ctx.fill();

    // Capa de montaña media (Cordillera cercana)
    ctx.fillStyle = "#111c29";
    ctx.beginPath();
    const mountainPointsNear = [
      [0, horizonY - 15],
      [width * 0.12, horizonY - 55],
      [width * 0.28, horizonY - 30],
      [width * 0.45, horizonY - 75],
      [width * 0.62, horizonY - 35],
      [width * 0.78, horizonY - 80],
      [width * 0.92, horizonY - 40],
      [width, horizonY - 20],
      [width, horizonY],
      [0, horizonY]
    ];
    mountainPointsNear.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawRoad() {
    const horizonY = height * 0.48;
    const vanishX = width * 0.5 + (mouseX * 30);
    const roadTopWidth = 24;
    const roadBottomWidth = width * 0.85;

    // Gradiente del asfalto
    const asphaltGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    asphaltGrad.addColorStop(0, "#121720");
    asphaltGrad.addColorStop(0.4, "#0e131a");
    asphaltGrad.addColorStop(1, "#070a0e");

    ctx.save();
    ctx.fillStyle = asphaltGrad;
    ctx.beginPath();
    ctx.moveTo(vanishX - roadTopWidth / 2, horizonY);
    ctx.lineTo(vanishX + roadTopWidth / 2, horizonY);
    ctx.lineTo(width * 0.5 + roadBottomWidth / 2, height);
    ctx.lineTo(width * 0.5 - roadBottomWidth / 2, height);
    ctx.closePath();
    ctx.fill();

    // Bordes reflectivos de carretera (Bermas)
    ctx.strokeStyle = "rgba(255, 183, 3, 0.45)";
    ctx.lineWidth = 2.5;

    // Línea de berma izquierda
    ctx.beginPath();
    ctx.moveTo(vanishX - roadTopWidth / 2, horizonY);
    ctx.lineTo(width * 0.5 - roadBottomWidth / 2 + 10, height);
    ctx.stroke();

    // Línea de berma derecha (blanca reflectiva)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.moveTo(vanishX + roadTopWidth / 2, horizonY);
    ctx.lineTo(width * 0.5 + roadBottomWidth / 2 - 10, height);
    ctx.stroke();

    // Línea central punteada reflectiva (Doble línea continua / discontinua colombiana)
    const numDashes = 14;
    roadOffset = (roadOffset + 0.015) % 1;

    for (let i = 0; i < numDashes; i++) {
      const z = (i + roadOffset) / numDashes;
      if (z <= 0.05) continue;
      
      const pz = Math.pow(z, 2.4); // proyección de perspectiva no lineal
      const y = horizonY + (height - horizonY) * pz;
      const nextPz = Math.pow(Math.min(z + 0.035, 1), 2.4);
      const nextY = horizonY + (height - horizonY) * nextPz;

      const currentX = vanishX + (width * 0.5 - vanishX) * pz;
      const lineWidth = Math.max(1.5, pz * 7);

      // Doble línea amarilla de montaña
      ctx.fillStyle = `rgba(255, 183, 3, ${0.2 + pz * 0.75})`;
      ctx.fillRect(currentX - lineWidth - 2, y, lineWidth, Math.max(2, nextY - y));
      ctx.fillRect(currentX + 2, y, lineWidth, Math.max(2, nextY - y));
    }
    ctx.restore();
  }

  function drawTruckLights() {
    const horizonY = height * 0.48;
    const vanishX = width * 0.5 + (mouseX * 30);
    const roadBottomWidth = width * 0.85;

    truckLights.forEach((t) => {
      // Avanzar en la carretera
      t.z += t.speed;
      if (t.z > 1) {
        t.z = 0.05;
        t.lane = t.type === "oncoming" ? -0.25 - Math.random() * 0.2 : 0.25 + Math.random() * 0.2;
      }

      const pz = Math.pow(t.z, 2.2);
      const y = horizonY + (height - horizonY) * pz;
      const roadWidthAtZ = 24 + (roadBottomWidth - 24) * pz;
      const x = vanishX + (t.lane * roadWidthAtZ);

      const size = Math.max(1.5, pz * 18);
      const lightDistance = size * 1.8;

      ctx.save();
      if (t.type === "oncoming") {
        // Faros frontales de tractocamión que se acerca
        // Halo de luz en el asfalto (Haz de luz proyectado)
        const beamGrad = ctx.createRadialGradient(x, y + size * 1.2, 2, x, y + size * 2.5, size * 5);
        beamGrad.addColorStop(0, "rgba(255, 244, 200, 0.45)");
        beamGrad.addColorStop(0.5, "rgba(255, 183, 3, 0.15)");
        beamGrad.addColorStop(1, "rgba(255, 183, 3, 0)");
        
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.ellipse(x, y + size * 1.5, size * 3.5, size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Faro izquierdo y derecho
        for (const dx of [-lightDistance, lightDistance]) {
          const glow = ctx.createRadialGradient(x + dx, y, 1, x + dx, y, size * 2.2);
          glow.addColorStop(0, "#ffffff");
          glow.addColorStop(0.3, t.color);
          glow.addColorStop(0.8, t.glow);
          glow.addColorStop(1, "transparent");

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x + dx, y, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Luces de galibo ámbar superiores del techo (5 LEDs clásicos de tractomula)
        if (pz > 0.15) {
          const cabTopY = y - size * 1.6;
          for (let k = -2; k <= 2; k++) {
            ctx.fillStyle = "rgba(255, 183, 3, 0.9)";
            ctx.beginPath();
            ctx.arc(x + k * (size * 0.7), cabTopY, Math.max(1, size * 0.18), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Luces traseras rojas de tractocamión que se aleja (con estela)
        for (const dx of [-lightDistance, lightDistance]) {
          const redGlow = ctx.createRadialGradient(x + dx, y, 1, x + dx, y, size * 1.8);
          redGlow.addColorStop(0, "#ffffff");
          redGlow.addColorStop(0.4, "#ff2222");
          redGlow.addColorStop(0.9, "rgba(217, 4, 41, 0.35)");
          redGlow.addColorStop(1, "transparent");

          ctx.fillStyle = redGlow;
          ctx.beginPath();
          ctx.arc(x + dx, y, size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Barra de luces traseras LED inferior
        ctx.strokeStyle = "rgba(239, 35, 60, 0.6)";
        ctx.lineWidth = Math.max(1.5, size * 0.25);
        ctx.beginPath();
        ctx.moveTo(x - lightDistance, y);
        ctx.lineTo(x + lightDistance, y);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawParticles() {
    ctx.save();
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < height * 0.4) {
        p.y = height * 0.95;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.fillStyle = p.hue;
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function render() {
    // Suavizado del mouse
    mouseX += (targetMouseX - mouseX) * 0.05;

    ctx.clearRect(0, 0, width, height);

    drawMountains();
    drawRoad();
    drawTruckLights();
    drawParticles();

    if (!reducedMotion) {
      animationId = requestAnimationFrame(render);
    }
  }

  // Interacción suave con mouse
  window.addEventListener("mousemove", (e) => {
    targetMouseX = (e.clientX / window.innerWidth) - 0.5;
  }, { passive: true });

  window.addEventListener("resize", () => {
    resize();
    initParticles();
    if (reducedMotion) render();
  });

  resize();
  initParticles();
  render();
})();

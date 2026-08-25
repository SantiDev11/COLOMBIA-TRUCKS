/* ============================================================
   COLOMBIA TRUCKS — Controlador Principal (Main.js)
   - Catálogo interactivo con fotos reales de tractocamiones
   - Sistema de favoritos persistidos en localStorage
   - Modal de ficha técnica completa con foto del modelo
   - Explorador de Rutas de Montaña de Colombia
   - Soundboard de Sonidos Reales de Tractomula
   - Easter eggs de teclado ('T', 'H', 'R')
   - Animaciones de Scroll Reveal y Contadores
   - Menú móvil accesible y botón volver arriba
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   1. CATÁLOGO INTERACTIVO & FILTROS DE CAMIONES
   ============================================================ */
(function initTruckCatalog() {
  const catalogGrid = document.getElementById("trucksGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("truckSearchInput");
  const filterCountEl = document.getElementById("filterCount");

  if (!catalogGrid) return;

  const FAVORITES_KEY = "colombia_trucks_favorites";

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function toggleFavorite(truckId, btnEl) {
    let favs = getFavorites();
    const isFav = favs.includes(truckId);
    if (isFav) {
      favs = favs.filter(id => id !== truckId);
      btnEl.classList.remove("is-fav");
      btnEl.setAttribute("aria-label", "Agregar a favoritos");
      btnEl.innerHTML = "🤍";
    } else {
      favs.push(truckId);
      btnEl.classList.add("is-fav");
      btnEl.setAttribute("aria-label", "Quitar de favoritos");
      btnEl.innerHTML = "❤️";
      if (window.playAirPurgeSound) window.playAirPurgeSound();
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }

  // Generador de tarjeta con foto real del tractocamión
  function getTruckVisual(truck) {
    return `
      <div class="truck-card-media">
        <img src="${truck.image}" alt="${truck.name} - ${truck.colorTheme}" class="truck-card-real-img" loading="lazy">
        <div class="truck-card-img-overlay"></div>
        <div class="truck-card-badge-top">${truck.badge}</div>
        <div class="truck-color-tag">${truck.colorTheme}</div>
        <div class="truck-tech-tag">${truck.style}</div>
      </div>
    `;
  }

  function renderCatalog(filter = "all", query = "") {
    const favs = getFavorites();
    const q = query.toLowerCase().trim();

    let filtered = TRUCKS_DATA.filter((truck) => {
      // Filtro de categoría / marca
      let matchFilter = true;
      if (filter === "kenworth") matchFilter = truck.brand === "Kenworth";
      else if (filter === "international") matchFilter = truck.brand === "International";
      else if (filter === "clasico") matchFilter = truck.id === "w900" || truck.id === "international-9400i";
      else if (filter === "moderno") matchFilter = truck.id === "t680" || truck.id === "t800";
      else if (filter === "favoritos") matchFilter = favs.includes(truck.id);

      // Búsqueda por texto
      let matchQuery = true;
      if (q) {
        matchQuery = truck.name.toLowerCase().includes(q) ||
                     truck.brand.toLowerCase().includes(q) ||
                     truck.colorTheme.toLowerCase().includes(q) ||
                     truck.engine.model.toLowerCase().includes(q) ||
                     truck.description.toLowerCase().includes(q);
      }

      return matchFilter && matchQuery;
    });

    if (filterCountEl) filterCountEl.textContent = `${filtered.length} modelos encontrados`;

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div class="no-results-box">
          <p class="no-results-icon">🚛💨</p>
          <h3>No se encontraron camiones con ese criterio</h3>
          <p>Prueba buscando por <em>Kenworth</em>, <em>International</em>, <em>Amarilla</em>, <em>Roja</em>, <em>Blanca</em>, <em>Marrón</em> o selecciona "Todos los Modelos".</p>
        </div>
      `;
      return;
    }

    catalogGrid.innerHTML = filtered.map((truck) => {
      const isFav = favs.includes(truck.id);
      return `
        <article class="truck-card reveal in-view" data-truck-id="${truck.id}">
          ${getTruckVisual(truck)}
          <div class="truck-card-body">
            <div class="truck-card-header">
              <div>
                <span class="truck-brand-tag">${truck.brand} · ${truck.yearRange}</span>
                <h3 class="truck-title">${truck.name}</h3>
              </div>
              <button class="fav-btn ${isFav ? 'is-fav' : ''}" data-id="${truck.id}" aria-label="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                ${isFav ? '❤️' : '🤍'}
              </button>
            </div>
            
            <p class="truck-desc">${truck.description}</p>
            
            <div class="truck-specs-pills">
              <div class="spec-pill">
                <span class="spec-pill-label">Motor</span>
                <span class="spec-pill-val">${truck.engine.model.split('/')[0]}</span>
              </div>
              <div class="spec-pill">
                <span class="spec-pill-label">Potencia</span>
                <span class="spec-pill-val">${truck.engine.horsepower.split('@')[0]}</span>
              </div>
              <div class="spec-pill">
                <span class="spec-pill-label">Torque</span>
                <span class="spec-pill-val">${truck.engine.torque.split('@')[0]}</span>
              </div>
              <div class="spec-pill">
                <span class="spec-pill-label">Caja</span>
                <span class="spec-pill-val">${truck.drivetrain.transmission.split('(')[0]}</span>
              </div>
            </div>

            <div class="truck-card-actions">
              <button class="btn btn-primary btn-sm btn-open-modal" data-id="${truck.id}">
                🔩 Ver especificaciones
              </button>
              <button class="btn btn-ghost btn-sm btn-compare-truck" data-id="${truck.id}">
                ⚔️ Comparar modelo
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Event listeners
    catalogGrid.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.id, btn);
      });
    });

    catalogGrid.querySelectorAll(".btn-open-modal").forEach((btn) => {
      btn.addEventListener("click", () => openTruckModal(btn.dataset.id));
    });

    catalogGrid.querySelectorAll(".btn-compare-truck").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.setComparisonTruck) window.setComparisonTruck(btn.dataset.id, "A");
      });
    });
  }

  // Event Listeners de Filtros
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCatalog(btn.dataset.filter, searchInput ? searchInput.value : "");
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
      renderCatalog(activeFilter, searchInput.value);
    });
  }

  renderCatalog();
})();

/* ============================================================
   2. MODAL DE FICHA TÉCNICA
   ============================================================ */
const truckModal = document.getElementById("truckModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalBody = document.getElementById("modalContentBody");

function openTruckModal(truckId) {
  const truck = getTruckById(truckId);
  if (!truck || !truckModal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-truck-hero-img">
      <img src="${truck.image}" alt="${truck.name}" class="modal-img-banner">
      <div class="modal-img-gradient"></div>
      <div class="modal-img-badge">${truck.brand} · ${truck.badge}</div>
    </div>

    <div class="modal-truck-header">
      <div>
        <h2>${truck.name}</h2>
        <p class="modal-tagline">${truck.tagline}</p>
      </div>
      <div class="modal-year-pill">${truck.yearRange}</div>
    </div>

    <div class="modal-grid-sections">
      <!-- 1. Tren Motriz -->
      <div class="modal-card-spec">
        <div class="modal-card-title">
          <span class="icon">🔧</span> Tren Motriz & Motor
        </div>
        <ul class="spec-list">
          <li><strong>Modelo de Motor:</strong> <span>${truck.engine.model}</span></li>
          <li><strong>Cilindrada & Configuración:</strong> <span>${truck.engine.displacement}</span></li>
          <li><strong>Potencia Máxima:</strong> <span>${truck.engine.horsepower}</span></li>
          <li><strong>Torque Máximo:</strong> <span>${truck.engine.torque}</span></li>
          <li><strong>Freno de Compresión:</strong> <span>${truck.engine.compressionBrake}</span></li>
          <li><strong>Sistema de Inyección:</strong> <span>${truck.engine.fuelSystem}</span></li>
          <li><strong>Normativa de Emisiones:</strong> <span>${truck.engine.emissions}</span></li>
        </ul>
      </div>

      <!-- 2. Transmisión & Ejes -->
      <div class="modal-card-spec">
        <div class="modal-card-title">
          <span class="icon">⚙️</span> Transmisión, Ejes & Frenos
        </div>
        <ul class="spec-list">
          <li><strong>Transmisión:</strong> <span>${truck.drivetrain.transmission}</span></li>
          <li><strong>Eje Delantero:</strong> <span>${truck.drivetrain.frontAxle}</span></li>
          <li><strong>Eje Trasero (Tándem 6x4):</strong> <span>${truck.drivetrain.rearAxle}</span></li>
          <li><strong>Suspensión Neumática:</strong> <span>${truck.drivetrain.suspension}</span></li>
          <li><strong>Relación de Corona (Ratio):</strong> <span>${truck.drivetrain.ratio}</span></li>
          <li><strong>Frenos de Servicio:</strong> <span>${truck.drivetrain.brakes}</span></li>
          <li><strong>Llantas / Rines:</strong> <span>${truck.drivetrain.tires}</span></li>
        </ul>
      </div>

      <!-- 3. Chasis & Dimensiones -->
      <div class="modal-card-spec">
        <div class="modal-card-title">
          <span class="icon">📐</span> Chasis, Dimensiones & Capacidades
        </div>
        <ul class="spec-list">
          <li><strong>Distancia entre Ejes (Wheelbase):</strong> <span>${truck.dimensions.wheelbase}</span></li>
          <li><strong>Estructura del Bastidor:</strong> <span>${truck.dimensions.chassis}</span></li>
          <li><strong>Tanques de Combustible (ACPM):</strong> <span>${truck.dimensions.fuelTanks}</span></li>
          <li><strong>Tanque de Urea / DEF:</strong> <span>${truck.dimensions.defTank}</span></li>
          <li><strong>Plato de Quinta Rueda:</strong> <span>${truck.dimensions.fifthWheel}</span></li>
          <li><strong>Peso Bruto Vehicular Combinado:</strong> <span>${truck.dimensions.grossVehicleWeight}</span></li>
        </ul>
      </div>

      <!-- 4. Cabina & Ergonomía -->
      <div class="modal-card-spec">
        <div class="modal-card-title">
          <span class="icon">🛋️</span> Cabina, Confort & Interior
        </div>
        <ul class="spec-list">
          <li><strong>Estructura de Cabina:</strong> <span>${truck.cabin.structure}</span></li>
          <li><strong>Dormitorio / Litera (Sleeper):</strong> <span>${truck.cabin.sleeperSize}</span></li>
          <li><strong>Asiento del Conductor:</strong> <span>${truck.cabin.seats}</span></li>
          <li><strong>Tablero de Instrumentos:</strong> <span>${truck.cabin.dashboard}</span></li>
          <li><strong>Sistema de Clima:</strong> <span>${truck.cabin.hvac}</span></li>
          <li><strong>Aislamiento Acústico:</strong> <span>${truck.cabin.soundLevel}</span></li>
    <div class="modal-note-box">
      <p>💡 <em>Nota técnica:</em> Las especificaciones anteriores representan configuraciones comerciales estándar para servicio pesado en Colombia. Algunas cifras como ratio, capacidad de tanques o litera pueden variar según el año y orden de ensamble del fabricante.</p>
    </div>

    <div class="modal-actions-footer" style="margin-top: 1.2rem; text-align: center;">
      <button class="btn btn-primary btn-modal-video" data-videoid="${truck.videoId}" style="width: 100%;">
        🎬 Ver video de ${truck.name} en carretera
      </button>
    </div>
  `;

  const modalVideoBtn = modalBody.querySelector(".btn-modal-video");
  if (modalVideoBtn) {
    modalVideoBtn.addEventListener("click", () => {
      closeTruckModal();
      if (window.playTruckVideo) window.playTruckVideo(truck.videoId);
    });
  }

  truckModal.hidden = false;
  truckModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeTruckModal() {
  if (!truckModal) return;
  truckModal.classList.remove("open");
  setTimeout(() => {
    truckModal.hidden = true;
    document.body.style.overflow = "";
  }, 250);
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeTruckModal);
if (truckModal) {
  truckModal.addEventListener("click", (e) => {
    if (e.target === truckModal) closeTruckModal();
  });
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && truckModal && !truckModal.hidden) {
    closeTruckModal();
  }
});

/* ============================================================
   3. SECCIÓN RUTAS DE COLOMBIA (EXPLORADOR TOPOGRÁFICO)
   ============================================================ */
(function initRoutesExplorer() {
  const routesList = document.getElementById("routesNavList");
  const routeCard = document.getElementById("routeActiveDetails");

  if (!routesList || !routeCard) return;

  let activeRouteId = "la-linea";

  function renderRouteDetails(routeId) {
    const route = COLOMBIAN_ROUTES.find(r => r.id === routeId) || COLOMBIAN_ROUTES[0];
    activeRouteId = route.id;

    routesList.querySelectorAll(".route-item-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === route.id);
    });

    routeCard.innerHTML = `
      <div class="route-header-box">
        <div>
          <span class="route-corridor-tag">${route.corridor}</span>
          <h3 class="route-title">${route.name}</h3>
        </div>
        <span class="route-diff-badge">${route.difficulty}</span>
      </div>

      <div class="route-metrics-grid">
        <div class="route-metric-card">
          <span class="metric-icon">🛣️</span>
          <span class="metric-label">Distancia</span>
          <span class="metric-val">${route.distance}</span>
          ${route.distanceDetail ? `<small class="metric-sub">${route.distanceDetail}</small>` : ''}
        </div>
        <div class="route-metric-card">
          <span class="metric-icon">⏱️</span>
          <span class="metric-label">Tiempo Estimado</span>
          <span class="metric-val">${route.duration}</span>
          ${route.durationDetail ? `<small class="metric-sub">${route.durationDetail}</small>` : ''}
        </div>
        <div class="route-metric-card">
          <span class="metric-icon">⛰️</span>
          <span class="metric-label">Punto Más Alto</span>
          <span class="metric-val">${route.maxAltitude}</span>
          ${route.altitudeDetail ? `<small class="metric-sub">${route.altitudeDetail}</small>` : ''}
        </div>
      </div>

      <div class="route-section-block">
        <h4>🗺️ Puntos Clave del Recorrido:</h4>
        <ul class="route-waypoints">
          ${route.keyPoints.map((pt, i) => `<li><span class="wp-num">${i + 1}</span> ${pt}</li>`).join("")}
        </ul>
      </div>

      <div class="route-advice-box">
        <h4>🛑 Recomendación Técnica de Manejo:</h4>
        <p>${route.truckAdvice}</p>
      </div>
    `;
  }

  routesList.innerHTML = COLOMBIAN_ROUTES.map(r => `
    <button class="route-item-btn ${r.id === activeRouteId ? 'active' : ''}" data-id="${r.id}">
      <span class="route-btn-icon">🏔️</span>
      <div class="route-btn-info">
        <strong>${r.name}</strong>
        <small>${r.corridor}</small>
      </div>
    </button>
  `).join("");

  routesList.querySelectorAll(".route-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderRouteDetails(btn.dataset.id);
    });
  });

  renderRouteDetails(activeRouteId);

  window.selectRandomRoute = function() {
    const randomIndex = Math.floor(Math.random() * COLOMBIAN_ROUTES.length);
    const chosen = COLOMBIAN_ROUTES[randomIndex];
    renderRouteDetails(chosen.id);
    const routesSection = document.getElementById("rutas");
    if (routesSection) routesSection.scrollIntoView({ behavior: "smooth" });
  };
})();

/* ============================================================
   4. REPRODUCTOR DE VIDEOS REALES DE TRACTOCAMIONES (SMART FACADE)
   ============================================================ */
(function initVideoPlayer() {
  const tabBtns = document.querySelectorAll(".video-tab-btn");
  const iframe = document.getElementById("truckVideoPlayer");
  const iframeWrapper = document.getElementById("videoIframeWrapper");
  const posterBox = document.getElementById("videoPosterBox");
  const posterImg = document.getElementById("videoPosterImg");
  const playBtn = document.getElementById("btnPlayTruckVideo");
  const titleEl = document.getElementById("videoCaptionTitle");
  const descEl = document.getElementById("videoCaptionDesc");
  const extLink = document.getElementById("videoExternalLink");

  if (!tabBtns.length) return;

  let currentVideoId = "LRoLOA4wJtA";
  let isPlaying = false;

  function loadActiveVideo() {
    if (!iframe) return;
    isPlaying = true;
    if (posterBox) posterBox.style.display = "none";
    if (iframeWrapper) iframeWrapper.style.display = "block";
    
    // Parámetros estándar de YouTube para evitar errores de cookies de terceros
    const originParam = window.location.origin && window.location.origin !== "null" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
    iframe.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&enablejsapi=1${originParam}`;
  }

  function selectTruckVideo(btn, autoPlay = false) {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const title = btn.dataset.title;
    const desc = btn.dataset.desc;
    const ytUrl = btn.dataset.yturl;
    const videoId = btn.dataset.videoid;
    const imgSrc = btn.dataset.img;

    currentVideoId = videoId;

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (extLink) extLink.href = ytUrl;
    if (posterImg && imgSrc) posterImg.src = imgSrc;

    if (autoPlay || isPlaying) {
      loadActiveVideo();
    } else {
      if (posterBox) posterBox.style.display = "flex";
      if (iframeWrapper) iframeWrapper.style.display = "none";
      if (iframe) iframe.src = "";
    }
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      loadActiveVideo();
    });
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectTruckVideo(btn, false));
  });

  window.playTruckVideo = function(videoId) {
    const matchingBtn = Array.from(tabBtns).find(b => b.dataset.videoid === videoId || b.dataset.truckid === videoId);
    if (matchingBtn) {
      selectTruckVideo(matchingBtn, true);
    }
    const sec = document.getElementById("multimedia");
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
  };
})();

/* ============================================================
   5. CONTADORES ANIMADOS EN EL HERO
   ============================================================ */
(function initCounters() {
  const nums = document.querySelectorAll(".stat-num[data-count]");
  if (!nums.length) return;

  function animate(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (reducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach((el) => observer.observe(el));
})();

/* ============================================================
   6. SCROLL REVEAL
   ============================================================ */
(function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
  );

  items.forEach((el) => observer.observe(el));
})();

/* ============================================================
   7. MENÚ MÓVIL & BOTÓN VOLVER ARRIBA
   ============================================================ */
(function initNavigation() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const toTop = document.getElementById("toTop");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });
  }
})();

/* ============================================================
   8. EASTER EGGS DE TECLADO
   - Tecla 'T': Desplazar al tablero
   - Tecla 'H': Corneta de aire (Air Horn)
   - Tecla 'R': Seleccionar ruta de montaña al azar
   ============================================================ */
window.addEventListener("keydown", (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
  if (activeTag === "input" || activeTag === "textarea") return;

  const key = e.key.toUpperCase();
  if (key === "H") {
    if (window.playAirHornSound) window.playAirHornSound();
  } else if (key === "T") {
    const dashSec = document.getElementById("tablero");
    if (dashSec) dashSec.scrollIntoView({ behavior: "smooth" });
  } else if (key === "R") {
    if (window.selectRandomRoute) window.selectRandomRoute();
  }
});

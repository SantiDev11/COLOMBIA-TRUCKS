/* ============================================================
   COLOMBIA TRUCKS — Comparador Interactivo de Modelos
   Compara dos tractocamiones cara a cara con fotos reales,
   matriz técnica, barras visuales de rendimiento y análisis.
   ============================================================ */

(function initTruckComparator() {
  const selectA = document.getElementById("compSelectA");
  const selectB = document.getElementById("compSelectB");
  const compCardA = document.getElementById("compCardA");
  const compCardB = document.getElementById("compCardB");
  const compTable = document.getElementById("compTableBody");
  const compBars = document.getElementById("compBarsContainer");
  const compVerdict = document.getElementById("compVerdictText");

  if (!selectA || !selectB) return;

  function populateSelects() {
    selectA.innerHTML = "";
    selectB.innerHTML = "";

    TRUCKS_DATA.forEach((truck, index) => {
      const optA = document.createElement("option");
      optA.value = truck.id;
      optA.textContent = `${truck.name} (${truck.colorTheme})`;
      if (index === 0) optA.selected = true; // Kenworth T800 (Mula Amarilla)
      selectA.appendChild(optA);

      const optB = document.createElement("option");
      optB.value = truck.id;
      optB.textContent = `${truck.name} (${truck.colorTheme})`;
      if (index === 3) optB.selected = true; // Kenworth T680 (Mula Roja)
      selectB.appendChild(optB);
    });
  }

  function renderComparison() {
    const truckA = getTruckById(selectA.value);
    const truckB = getTruckById(selectB.value);

    // Cabecera A con foto real
    if (compCardA) {
      compCardA.innerHTML = `
        <div class="comp-card-top-flex">
          <div class="comp-img-thumb-box">
            <img src="${truckA.image}" alt="${truckA.name}" class="comp-truck-thumb" loading="lazy">
          </div>
          <div class="comp-card-texts">
            <div class="comp-badge">${truckA.brand} · ${truckA.colorTheme}</div>
            <h3>${truckA.name}</h3>
            <p class="comp-tagline">${truckA.tagline}</p>
            <span class="comp-style-pill">${truckA.style}</span>
          </div>
        </div>
      `;
    }

    // Cabecera B con foto real
    if (compCardB) {
      compCardB.innerHTML = `
        <div class="comp-card-top-flex">
          <div class="comp-img-thumb-box">
            <img src="${truckB.image}" alt="${truckB.name}" class="comp-truck-thumb" loading="lazy">
          </div>
          <div class="comp-card-texts">
            <div class="comp-badge">${truckB.brand} · ${truckB.colorTheme}</div>
            <h3>${truckB.name}</h3>
            <p class="comp-tagline">${truckB.tagline}</p>
            <span class="comp-style-pill">${truckB.style}</span>
          </div>
        </div>
      `;
    }

    // Matriz de especificaciones técnicas
    if (compTable) {
      const rows = [
        { label: "Motor", valA: truckA.engine.model, valB: truckB.engine.model },
        { label: "Potencia (HP)", valA: truckA.engine.horsepower, valB: truckB.engine.horsepower },
        { label: "Torque Máximo", valA: truckA.engine.torque, valB: truckB.engine.torque },
        { label: "Transmisión", valA: truckA.drivetrain.transmission, valB: truckB.drivetrain.transmission },
        { label: "Eje Delantero", valA: truckA.drivetrain.frontAxle, valB: truckB.drivetrain.frontAxle },
        { label: "Eje Trasero (Tándem)", valA: truckA.drivetrain.rearAxle, valB: truckB.drivetrain.rearAxle },
        { label: "Suspensión", valA: truckA.drivetrain.suspension, valB: truckB.drivetrain.suspension },
        { label: "Freno de Compresión", valA: truckA.engine.compressionBrake, valB: truckB.engine.compressionBrake },
        { label: "Litera / Sleeper", valA: truckA.cabin.sleeperSize, valB: truckB.cabin.sleeperSize },
        { label: "Tanques de Combustible", valA: truckA.dimensions.fuelTanks, valB: truckB.dimensions.fuelTanks },
        { label: "Aplicación en Colombia", valA: truckA.category, valB: truckB.category }
      ];

      compTable.innerHTML = rows.map(r => `
        <tr>
          <td class="comp-label"><strong>${r.label}</strong></td>
          <td class="comp-val-a">${r.valA}</td>
          <td class="comp-val-b">${r.valB}</td>
        </tr>
      `).join("");
    }

    // Barras comparativas de métricas
    if (compBars) {
      const metrics = [
        { name: "Potencia & Aceleración", key: "power" },
        { name: "Torque en Montaña", key: "torque" },
        { name: "Capacidad de Ascenso (Pendiente)", key: "mountainClimb" },
        { name: "Maniobrabilidad en Curvas", key: "maneuverability" },
        { name: "Eficiencia & Aerodinámica", key: "aerodynamics" },
        { name: "Espacio en Cabina / Litera", key: "cabinSpace" },
        { name: "Durabilidad de Chasís", key: "durability" }
      ];

      compBars.innerHTML = metrics.map(m => {
        const valA = truckA.stats[m.key] || 80;
        const valB = truckB.stats[m.key] || 80;
        return `
          <div class="comp-metric-row">
            <div class="comp-metric-header">
              <span class="comp-metric-name">${m.name}</span>
              <div class="comp-metric-scores">
                <span class="score-a">${valA}/100</span>
                <span class="score-vs">vs</span>
                <span class="score-b">${valB}/100</span>
              </div>
            </div>
            <div class="comp-dual-bar">
              <div class="comp-bar-side comp-bar-a">
                <div class="comp-bar-fill fill-a" style="width: ${valA}%"></div>
              </div>
              <div class="comp-bar-side comp-bar-b">
                <div class="comp-bar-fill fill-b" style="width: ${valB}%"></div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Veredicto técnico
    if (compVerdict) {
      let verdict = "";
      if (truckA.id === truckB.id) {
        verdict = `Has seleccionado el mismo modelo (${truckA.name}). Prueba comparando un modelo clásico como el <strong>W900 (Mula Blanca)</strong> frente a uno aerodinámico como el <strong>T680 (Mula Roja)</strong> para notar las diferencias.`;
      } else if (truckA.id === "t800" && truckB.id === "t680") {
        verdict = `<strong>Kenworth T800 (Mula Amarilla)</strong> sobresale en rutas de montaña extrema y curvas en horquilla gracias a su capó inclinado a 45°. El <strong>Kenworth T680 (Mula Roja)</strong> es líder en eficiencia en autopistas y trayectos llanos con su cabina digital y aerodinámica avanzada.`;
      } else if (truckA.id === "w900" || truckB.id === "w900") {
        verdict = `El <strong>Kenworth W900 (Mula Blanca/Beige)</strong> es insuperable en presencia, chimeneas dobles y espacio de litera tradicional (Studio Sleeper). Los otros modelos ofrecen mayor visibilidad de trompa para maniobras cerradas en Colombia.`;
      } else {
        verdict = `Ambos tractocamiones cuentan con configuraciones de tren motriz aptas para el límite legal colombiano de <strong>52 toneladas (C3-S3)</strong>. La elección óptima depende de si la ruta prioriza subidas de cordillera constante o tramos rectos de alta velocidad de crucero.`;
      }
      compVerdict.innerHTML = verdict;
    }
  }

  selectA.addEventListener("change", renderComparison);
  selectB.addEventListener("change", renderComparison);

  populateSelects();
  renderComparison();

  window.setComparisonTruck = function(truckId, slot = "A") {
    if (slot === "A" && selectA) selectA.value = truckId;
    if (slot === "B" && selectB) selectB.value = truckId;
    renderComparison();
    const section = document.getElementById("comparador");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };
})();

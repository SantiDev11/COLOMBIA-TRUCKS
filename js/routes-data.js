/* ============================================================
   COLOMBIA TRUCKS — Base de Datos de Rutas de Carga en Colombia
   Información topográfica y desafíos viales para tractocamiones:
   - Bogotá → Buenaventura (Paso de La Línea)
   - Bogotá → Medellín (Alto de Minas / Alto del Vino)
   - Medellín → Cartagena (Descenso Ventanas y Bajo Cauca)
   - Bogotá → Bucaramanga (Cañón del Chicamocha y Pescadero)
   - Cali → Bogotá (Cruza Cordillera Central)
   ============================================================ */

const COLOMBIAN_ROUTES = [
  {
    id: "la-linea",
    name: "Bogotá → Buenaventura",
    corridor: "Corredor de Comercio Exterior (Pacífico)",
    distance: "510 km",
    distanceDetail: "Sabana a Costa Pacífica",
    duration: "14 - 18 horas",
    durationDetail: "Tractomula cargada (C3-S3)",
    maxAltitude: "3,250 msnm",
    altitudeDetail: "Alto de La Línea (Cordillera)",
    difficulty: "Extrema (Montaña, Descenso Prolongado y Túneles)",
    terrain: "Cordillera Central, curvas cerradas, neblina densa y pendientes de hasta 12%",
    keyPoints: [
      "Salida de Bogotá (Sabana)",
      "Descenso por Silvania / Fusagasugá",
      "Ibagué (Entrada a la cordillera)",
      "Cajamarca (Inicio del ascenso fuerte)",
      "Alto de La Línea y Túnel de La Línea (8.65 km)",
      "Descenso hacia Calarcá / Armenia",
      "Valle del Cauca hasta el Puerto de Buenaventura"
    ],
    truckAdvice: "Uso obligatorio de freno de motor Jake Brake en 2da o 3ra etapa. En el descenso hacia Calarcá, enganchar caja Fuller en 4ta o 5ta marcha baja; jamás descender en neutro ni depender exclusivamente del freno de servicio neumático para evitar sobrecalentamiento de zapatas (balatas)."
  },
  {
    id: "alto-minas",
    name: "Bogotá → Medellín",
    corridor: "Troncal Occidental de Conexión Industrial",
    distance: "420 km",
    distanceDetail: "Cruce Río Magdalena",
    duration: "11 - 14 horas",
    durationDetail: "Tráfico pesado de carga",
    maxAltitude: "2,850 msnm",
    altitudeDetail: "Alto del Vino & Minas",
    difficulty: "Alta (Dos cruces de montaña y curvas en horquilla)",
    terrain: "Ascenso del Vino, descenso pronunciado a Guaduas, cruce del Río Magdalena en Puerto Salgar y ascenso exigente al Alto de Minas",
    keyPoints: [
      "Bogotá → Alto del Vino",
      "Descenso a Villeta y Guaduas",
      "Puerto Salgar / La Dorada (Paso sobre el Río Magdalena)",
      "Doradal y Puerto Triunfo",
      "Santuario / Marinilla (Ascenso a Antioquia)",
      "Alto de Minas o Túnel de Oriente hacia el Valle de Aburrá"
    ],
    truckAdvice: "Excelente prueba de torque para motores Cummins X15 o CAT C15. Mantener la aguja de RPM entre 1,200 y 1,500 en subida para aprovechar el rango de torque óptimo sin sobrecalentar el intercooler."
  },
  {
    id: "caribe-medellin",
    name: "Medellín → Cartagena",
    corridor: "Troncal del Norte hacia Puertos del Caribe",
    distance: "640 km",
    distanceDetail: "Antioquia a Costa Caribe",
    duration: "13 - 16 horas",
    durationDetail: "Transición montaña a llanura",
    maxAltitude: "2,600 msnm",
    altitudeDetail: "Alto de Ventanas (Páramo)",
    difficulty: "Media-Alta (Transición de páramo frío a llanura caribeña)",
    terrain: "Páramo de Santa Rosa, descenso vertiginoso por Ventanas y Valdivia, paso por Caucasia y planicies de Córdoba y Sucre",
    keyPoints: [
      "Medellín → Bello → Donmatías",
      "Santa Rosa de Osos y Alto de Ventanas (Neblina permanente)",
      "Descenso técnico por Valdivia y Puerto Valdivia",
      "Caucasia y Planeta Rica",
      "Sincelejo y Chinú",
      "Llegada a Turbaco y Puerto de Cartagena"
    ],
    truckAdvice: "El tramo de Ventanas a Valdivia es uno de los descensos con mayor índice de curvas cerradas y lluvia continua. Revisar presión de aire de tanques (>100 PSI) y el estado de llantas direccionales antes de coronar el páramo."
  },
  {
    id: "chicamocha",
    name: "Bogotá → Bucaramanga",
    corridor: "Troncal Oriental / Santanderes",
    distance: "400 km",
    distanceDetail: "Altiplano a Santander",
    duration: "10 - 13 horas",
    durationDetail: "Paso de montaña y cañón",
    maxAltitude: "2,800 msnm",
    altitudeDetail: "Páramo y Descenso Cañón",
    difficulty: "Extrema (Cañón geológico profundo y altas temperaturas)",
    terrain: "Altiplano cundiboyacense (Tunja, Duitama), entrada a Santander por San Gil y el majestuoso paso por el Cañón del Chicamocha",
    keyPoints: [
      "Salida por Tunja y Paipa",
      "Barbosa y Oiba",
      "San Gil y Curití",
      "Cañón del Chicamocha (Pescadero - Río Chicamocha)",
      "Piedecuesta y Floridablanca",
      "Bucaramanga (Ciudad Bonita)"
    ],
    truckAdvice: "El cruce del Cañón del Chicamocha somete a la tractomula a cambios drásticos de temperatura (de 10°C a más de 35°C en el fondo del cañón). Monitorear manómetro de temperatura de aceite y líquido refrigerante durante el ascenso a Los Curos."
  },
  {
    id: "valle-bogota",
    name: "Cali → Bogotá",
    corridor: "Eje Cafetero y Conexión Suroccidente",
    distance: "460 km",
    distanceDetail: "Valle del Cauca a Sabana",
    duration: "12 - 15 horas",
    durationDetail: "Carga agroindustrial y puerto",
    maxAltitude: "3,250 msnm",
    altitudeDetail: "Cordillera Central / La Línea",
    difficulty: "Alta (Carga pesada de azúcar, papel y manufacturas)",
    terrain: "Planicie del Valle del Cauca, subida por Calarcá hacia La Línea, descenso a Ibagué y llanura del Tolima antes de subir a Bogotá",
    keyPoints: [
      "Cali → Palmira → Buga",
      "Tuluá y Sevilla",
      "Armenia / Calarcá",
      "Túnel de La Línea (Sentido Occidente - Oriente)",
      "Cajamarca → Ibagué",
      "Espinal / Girardot → Subida por La Mesa o Silvania a Bogotá"
    ],
    truckAdvice: "Ruta de alto flujo logístico. Asegurar la tensión de las cadenas de carga en el semirremolque antes del ascenso a Calarcá y mantener distancia de seguridad de mínimo 50 metros en curvas con otros tractocamiones."
  }
];

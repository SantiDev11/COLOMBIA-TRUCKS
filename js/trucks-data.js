/* ============================================================
   COLOMBIA TRUCKS — Base de Datos Centralizada de Tractocamiones
   Información técnica verificada de los 4 modelos emblemáticos:
   1. Kenworth T800 (La mula amarilla / El rey de la montaña)
   2. International Eagle 9400i (La mula marrón / El águila)
   3. Kenworth W900 (La mula blanca-beige / El ícono clásico)
   4. Kenworth T680 (La mula roja / Vanguardia aerodinámica)
   ============================================================ */

const TRUCKS_DATA = [
  {
    id: "t800",
    name: "Kenworth T800",
    brand: "Kenworth",
    badge: "El Rey de la Montaña",
    category: "Carga Pesada / Montaña",
    style: "Convencional con trompa inclinada",
    colorTheme: "Amarillo & Morado",
    image: "assets/images/kenworth-t800.jpg",
    videoId: "LRoLOA4wJtA",
    videoUrl: "https://www.youtube.com/watch?v=LRoLOA4wJtA",
    videoTitle: "🟡 Kenworth T800 — El Rey de la Montaña",
    videoDesc: "El tractocamión más querido y probado en las cordilleras colombianas con capó inclinado a 45° y motor Cummins de alto torque.",
    yearRange: "1986 — 2020+",
    tagline: "El caballo de batalla indiscutible en las cordilleras de Colombia.",
    description: "El Kenworth T800 es legendario en Colombia por su durabilidad extrema, chasís reforzado y su capó inclinado a 45 grados que otorga visibilidad insuperable en curvas cerradas de montaña como La Línea o el Alto de Minas. Es la máquina predilecta para configuraciones C3-S3 de 52 toneladas.",
    
    // Especificaciones de Tren Motriz
    engine: {
      model: "Cummins X15 / ISX15 (o CAT C15 / C13 según versión)",
      displacement: "14.9 Litros (6 cilindros en línea)",
      horsepower: "450 - 600 HP @ 1,800 RPM",
      torque: "1,650 - 2,050 lb-pie @ 1,150 RPM",
      compressionBrake: "Freno de motor Jake Brake (hasta 600 HP de potencia de frenado)",
      fuelSystem: "Inyección electrónica XPI de ultra alta presión",
      emissions: "EPA 98 / EPA 04 / Euro V / Euro VI (según año de importación)"
    },

    // Transmisión y Ejes
    drivetrain: {
      transmission: "Eaton Fuller Manual de 18 velocidades (o 13 vel. / Automatizada UltraShift Plus)",
      frontAxle: "Dana Spicer / Meritor de 13,200 a 14,600 lbs",
      rearAxle: "Tándem Meritor RT-46-160 de 46,000 lbs con bloqueo diferencial entre ejes",
      suspension: "Kenworth AG400L de 8 bolsas de aire (o muelles Hendrickson)",
      ratio: "3.91 : 1 / 4.10 : 1 (configuración típica de montaña)",
      brakes: "Frenos de aire S-Cam de 16.5\" x 7\" con ABS Bendix de 4 canales",
      tires: "295/80 R22.5 o 11R22.5 radiales de tracción"
    },

    // Chasis y Capacidades
    dimensions: {
      wheelbase: "220 - 244 pulgadas (según configuración)",
      chassis: "Acero termotratado 120,000 PSI con refuerzo interior (Double Frame)",
      fuelTanks: "Duales de aluminio pulido (100 a 150 galones cada uno - 200/300 gal total)",
      defTank: "15 - 21 galones (en versiones con postratamiento SCR)",
      fifthWheel: "Holland FW35 o Jost JSK37 fija o deslizable neumática",
      grossVehicleWeight: "52,000 lbs (tractocamión) / 52 Toneladas PBV combinado (C3-S3 en Colombia)"
    },

    // Cabina y Confort
    cabin: {
      structure: "Aluminio remachado con fibra de vidrio y aislamiento térmico/acústico",
      sleeperSize: "Modular Sleeper de 60\" / 72\" AeroCab FlatTop o Aerodyne",
      seats: "Asiento de conductor neumático de alto respaldo con ajuste lumbar dual",
      dashboard: "Tablero envolvente ergonómico con instrumentación analógica cromada",
      hvac: "Aire acondicionado de alta capacidad y calefactor auxiliar de litera",
      soundLevel: "Sistema QuietCab con aislamiento acústico multicapa"
    },

    // Radar de Rendimiento (1 a 100)
    stats: {
      power: 96,
      torque: 98,
      mountainClimb: 99,
      maneuverability: 92,
      aerodynamics: 68,
      cabinSpace: 85,
      durability: 100
    }
  },

  {
    id: "international-9400i",
    name: "International Eagle 9400i",
    brand: "International",
    badge: "El Águila de la Carretera",
    category: "Larga Distancia / Carga Pesada",
    style: "Convencional semi-aerodinámico",
    colorTheme: "Marrón Metalizado",
    image: "assets/images/international-9400i.jpg",
    videoId: "NEMLdPHc1Uw",
    videoUrl: "https://www.youtube.com/watch?v=NEMLdPHc1Uw",
    videoTitle: "🟤 International Eagle 9400i — El Águila",
    videoDesc: "Confort superior, cabina espaciosa Pro-Sleeper y tradición de transporte pesado en Colombia.",
    yearRange: "1997 — 2012",
    tagline: "Elegancia clásica, cabina espaciosa y tradición en el transporte pesado.",
    description: "El International Eagle 9400i es uno de los tractocamiones más queridos por los transportadores colombianos. Reconocido por su cabina Pro-Sleeper espaciosa, su lujoso tablero con acabados tipo madera de nogal y biseles cromados, y su capacidad de arrastre respaldada por legendarios motores Cummins o Caterpillar.",
    
    // Especificaciones de Tren Motriz
    engine: {
      model: "Cummins ISM / ISX450 (o Caterpillar C12 / 3406E según configuración)",
      displacement: "10.8 a 14.9 Litros (6 cilindros en línea)",
      horsepower: "435 - 500 HP @ 1,800 RPM",
      torque: "1,550 - 1,850 lb-pie @ 1,200 RPM",
      compressionBrake: "Freno de motor Jacobs / Cummins Interbrake",
      fuelSystem: "Inyección electrónica multipunto de alta presión",
      emissions: "EPA 98 / EPA 04 / Euro IV (según año)"
    },

    // Transmisión y Ejes
    drivetrain: {
      transmission: "Eaton Fuller Manual de 13 o 18 velocidades con overdrive",
      frontAxle: "Navistar / Meritor de 12,000 a 13,200 lbs",
      rearAxle: "Tándem Meritor RT-46-160P de 46,000 lbs con inter-axle lock",
      suspension: "International IROS / Air Management System de 4 bolsas por eje",
      ratio: "3.73 : 1 / 3.90 : 1",
      brakes: "Frenos de aire tambor con ABS Bendix anti-bloqueo",
      tires: "295/80 R22.5 o 12R22.5"
    },

    // Chasis y Capacidades
    dimensions: {
      wheelbase: "228 - 240 pulgadas",
      chassis: "Viga en 'I' de acero de alta resistencia 110,000 PSI",
      fuelTanks: "Duales cilíndricos de aluminio (100 a 140 galones cada uno - 240 gal total)",
      defTank: "No aplica en generaciones previas a SCR / Depende del año",
      fifthWheel: "Fontaine / Holland fija o neumática deslizable",
      grossVehicleWeight: "52,000 lbs (tracto) / 52 Toneladas PBV combinado (C3-S3 en Colombia)"
    },

    // Cabina y Confort
    cabin: {
      structure: "Acero galvanizado de doble cara con paneles de material compuesto liviano",
      sleeperSize: "Pro-Sleeper integrado de 51\" o 72\" Hi-Rise",
      seats: "Asientos National Cushion Ride con suspensión de aire y apoyabrazos",
      dashboard: "Diseño clásico 'Eagle' con molduras de imitación nogal y relojes con aro cromado",
      hvac: "Sistema de climatización dual cabina/dormitorio",
      soundLevel: "Paquete de aislamiento acústico 'Eagle Diamond' de máxima absorción"
    },

    // Radar de Rendimiento (1 a 100)
    stats: {
      power: 88,
      torque: 90,
      mountainClimb: 91,
      maneuverability: 84,
      aerodynamics: 76,
      cabinSpace: 94,
      durability: 95
    }
  },

  {
    id: "w900",
    name: "Kenworth W900",
    brand: "Kenworth",
    badge: "El Ícono Clásico Americano",
    category: "Clásico / Estilo Tradicional",
    style: "Convencional de trompa larga (Long Hood)",
    colorTheme: "Blanco / Beige Clásico",
    image: "assets/images/kenworth-w900.jpg",
    videoId: "zYr7IGq_57g",
    videoUrl: "https://www.youtube.com/watch?v=zYr7IGq_57g",
    videoTitle: "⚪ Kenworth W900 — El Ícono Clásico y Trompa Larga",
    videoDesc: "Trompa cuadrada extendida de 130 pulgadas BBC, chimeneas gigantes de escape vertical y rugido de cromo.",
    yearRange: "1961 — Presente (W900L / W990)",
    tagline: "Presencia imponente, trompa cuadrada extendida y el rugido del cromo puro.",
    description: "El Kenworth W900 representa la cumbre del diseño clásico de tractocamiones. Con su enorme capó extendido de 130 pulgadas BBC, filtros de aire externos 'donas' cromadas y chimeneas gigantes de escape vertical, es la máquina más admirada en desfiles y carreteras por su estilo inconfundible y potencia sin concesiones.",
    
    // Especificaciones de Tren Motriz
    engine: {
      model: "Cummins X15 Performance / Caterpillar C15 ACERT / Twin Turbo",
      displacement: "14.9 a 15.2 Litros (6 cilindros en línea)",
      horsepower: "500 - 625 HP @ 1,800 RPM",
      torque: "1,850 - 2,050 lb-pie @ 1,150 RPM",
      compressionBrake: "Freno de motor Jake Brake Heavy Duty de descompresión",
      fuelSystem: "Inyección electrónica Common Rail / MEUI",
      emissions: "Configuraciones EPA / Euro según generación y mercado"
    },

    // Transmisión y Ejes
    drivetrain: {
      transmission: "Eaton Fuller Manual de 18 velocidades cromada con pomo personalizado",
      frontAxle: "Dana Spicer de 13,200 a 14,600 lbs con frenos de disco o tambor",
      rearAxle: "Tándem Meritor / Dana Spicer 46,000 lbs con bloqueo diferencial",
      suspension: "Kenworth AG400L / 8-Bag Air Suspension",
      ratio: "3.70 : 1 / 3.91 : 1",
      brakes: "Sistema de aire Bendix con zapatas de frenado reforzadas",
      tires: "295/80 R22.5 o 11R24.5 en rines de aluminio Alcoa pulidos"
    },

    // Chasis y Capacidades
    dimensions: {
      wheelbase: "260 - 285 pulgadas (Chasís largo extendido)",
      chassis: "Acero de aleación termotratada 120,000 PSI de alta rigidez torsional",
      fuelTanks: "Duales de aluminio pulido ultra brillo (120 a 150 gal c/u - hasta 300 gal)",
      defTank: "Depende de la configuración/año (21 galones en EPA10+)",
      fifthWheel: "Holland FW35 con montaje de ángulo ajustable",
      grossVehicleWeight: "52,000 lbs (tracto) / 52 Toneladas PBV combinado (C3-S3 en Colombia)"
    },

    // Cabina y Confort
    cabin: {
      structure: "Aluminio remachado a mano tradicional Kenworth con máxima longevidad",
      sleeperSize: "Studio Sleeper de 72\" o 86\" AeroCab con litera superior abatible",
      seats: "Asientos Kenworth GT703 de cuero premium con masaje neumático y calefacción",
      dashboard: "Tablero clásico plano con más de 20 diales analógicos y palancas de aviación",
      hvac: "Climatizador automático Kenworth con unidad auxiliar de energía APU",
      soundLevel: "Paquete de insonorización Diamond Interior"
    },

    // Radar de Rendimiento (1 a 100)
    stats: {
      power: 99,
      torque: 100,
      mountainClimb: 95,
      maneuverability: 74,
      aerodynamics: 60,
      cabinSpace: 98,
      durability: 99
    }
  },

  {
    id: "t680",
    name: "Kenworth T680",
    brand: "Kenworth",
    badge: "Vanguardia Aerodinámica",
    category: "Moderno / Máxima Eficiencia",
    style: "Aerodinámico de última generación",
    colorTheme: "Rojo Bermellón",
    image: "assets/images/kenworth-t680.jpg",
    videoId: "x70mVvo12VU",
    videoUrl: "https://www.youtube.com/watch?v=x70mVvo12VU",
    videoTitle: "🔴 Kenworth T680 — Vanguardia Aerodinámica",
    videoDesc: "Tecnología de última generación, cabina digital de 15 pulgadas, radar de seguridad y máxima eficiencia de diésel.",
    yearRange: "2013 — Presente (Next Gen)",
    tagline: "Ingeniería de vanguardia, hasta un 10% de ahorro de combustible y cabina digital.",
    description: "El Kenworth T680 representa el futuro del transporte pesado en carretera. Diseñado en túnel de viento para cortar el aire con mínima resistencia, incorpora cabina digital con pantalla personalizable de 15 pulgadas, radar anticolisión Bendix Wingman Fusion y motores PACCAR MX-13 / Cummins X15 altamente eficientes.",
    
    // Especificaciones de Tren Motriz
    engine: {
      model: "PACCAR MX-13 (o Cummins X15 Efficiency Series)",
      displacement: "12.9 Litros (PACCAR) / 14.9 Litros (Cummins)",
      horsepower: "405 - 510 HP @ 1,600 RPM",
      torque: "1,450 - 1,850 lb-pie @ 900 - 1,100 RPM",
      compressionBrake: "Freno de motor PACCAR Engine Brake integrado (hasta 460 HP)",
      fuelSystem: "Inyección electrónica inteligente Common Rail de 2,500 bar",
      emissions: "Euro VI / EPA 2024 / Emisiones Ultra Bajas con sistema DPF + SCR"
    },

    // Transmisión y Ejes
    drivetrain: {
      transmission: "PACCAR TX-12 Automatizada de 12 vel. (o Eaton Fuller Manual de 18 vel. / Endurant)",
      frontAxle: "PACCAR / Meritor de 12,500 a 13,200 lbs con frenos de disco de aire",
      rearAxle: "Tándem PACCAR 40k / Meritor MT-40-14X de 40,000 a 46,000 lbs",
      suspension: "Kenworth AG400L de 8 bolsas de aire controlada electrónicamente",
      ratio: "2.64 : 1 / 3.08 : 1 / 3.70 : 1 (optimizado para crucero económico)",
      brakes: "Frenos de disco en todas las ruedas Bendix ADB22X con ESP y ABS",
      tires: "295/75 R22.5 de baja resistencia a la rodadura (SmartWay Verified)"
    },

    // Chasis y Capacidades
    dimensions: {
      wheelbase: "215 - 235 pulgadas",
      chassis: "Acero termotratado de alta resistencia con travesaños optimizados por computadora",
      fuelTanks: "Duales aerodinámicos con faldones integrados (100 a 135 galones c/u)",
      defTank: "21 galones con indicador digital en clúster",
      fifthWheel: "Jost JSK37 / Holland FW17 ligera con sensor de enganche seguro",
      grossVehicleWeight: "50,000 - 52,000 lbs (tracto) / 52 Toneladas PBV combinado (C3-S3 en Colombia)"
    },

    // Cabina y Confort
    cabin: {
      structure: "Aluminio estampado y materiales compuestos con sellado hermético aerodinámico",
      sleeperSize: "Mid-Roof o High-Roof Sleeper de 76\" con 2.1 metros de ancho",
      seats: "Asientos neumáticos Kenworth SmartAir con ajuste computarizado y ventilación",
      dashboard: "Clúster Digital Digital Display de 15\" de alta definición personalizable",
      hvac: "Sistema de control de temperatura automático dual con gestión de energía PACCAR",
      soundLevel: "Cabina ultra silenciosa con tecnología de reducción de ruido aero-acústico"
    },

    // Radar de Rendimiento (1 a 100)
    stats: {
      power: 90,
      torque: 92,
      mountainClimb: 90,
      maneuverability: 96,
      aerodynamics: 99,
      cabinSpace: 96,
      durability: 94
    }
  }
];

function getTruckById(id) {
  return TRUCKS_DATA.find(t => t.id === id) || TRUCKS_DATA[0];
}

function getAllTrucks() {
  return TRUCKS_DATA;
}

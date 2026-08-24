/* ============================================================
   COLOMBIA TRUCKS — Chatbot: PREGÚNTALE AL CAMIONERO
   Asistente experto en tractocamiones, rutas de Colombia,
   especificaciones mecánicas, cajas Fuller y técnicas de conducción.
   100% en el cliente (JavaScript ES6+, sin backend).
   ============================================================ */

(function initTruckChatbot() {
  const fab = document.getElementById("chatFab");
  const win = document.getElementById("chatWindow");
  const closeBtn = document.getElementById("chatClose");
  const messages = document.getElementById("chatMessages");
  const chipsBox = document.getElementById("chatChips");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  if (!fab || !win) return;

  // Base de Conocimiento Especializada en Transporte de Carga en Colombia
  const KB = [
    {
      keys: ["t800", "kenworth t800", "el rey", "mula", "la mula"],
      reply: `🚛 <strong>Kenworth T800 ("El Rey de la Montaña")</strong>:<br>
      Es el tractocamión más popular y respetado en Colombia. Su secreto radica en su <strong>capó inclinado a 45 grados</strong> (que da excelente visibilidad en curvas de montaña como La Línea), su chasís reforzado y su configuración con motor <strong>Cummins X15 / ISX15</strong> (hasta 600 HP) y caja <strong>Eaton Fuller de 18 velocidades</strong>. Es el caballo de batalla predilecto para jalar 52 toneladas de PBV.`
    },
    {
      keys: ["w900", "kenworth w900", "clasico", "trompudo", "trompa larga", "long hood"],
      reply: `🔥 <strong>Kenworth W900 ("El Ícono Clásico")</strong>:<br>
      Con su imponente capó extendido de 130 pulgadas BBC, filtros de aire externos dobles 'donas' cromadas y chimeneas gigantes de escape vertical, es la máquina más admirada en carretera. Cuenta con cabinas <strong>Studio Sleeper de hasta 86 pulgadas</strong> y motores <strong>CAT C15 / Cummins X15</strong> capaces de superar los 600 HP.`
    },
    {
      keys: ["9400", "9400i", "international", "eagle", "aguila", "navistar"],
      reply: `🦅 <strong>International Eagle 9400i ("El Águila")</strong>:<br>
      Famoso por su confort inigualable y su cabina <strong>Pro-Sleeper</strong> con techo alto donde puedes estar totalmente de pie. Su tablero con molduras de nogal y biseles cromados es legendario. Suele estar equipado con motores <strong>Cummins ISM/ISX</strong> o <strong>Caterpillar C12</strong>, siendo un camión muy rendidor y con repuestos sumamente asequibles en toda Colombia.`
    },
    {
      keys: ["t680", "kenworth t680", "moderno", "aerodinamico", "tecnologia", "digital", "nuevo"],
      reply: `⚡ <strong>Kenworth T680 ("Vanguardia Aerodinámica")</strong>:<br>
      Es el estándar moderno de eficiencia. Diseñado en túnel de viento, reduce el consumo de combustible hasta en un <strong>10%</strong>. Incorpora un clúster de instrumentos con <strong>pantalla digital de 15 pulgadas</strong>, radar anticolisión <strong>Bendix Wingman</strong> y motores <strong>PACCAR MX-13 / Cummins X15 Euro VI</strong>.`
    },
    {
      keys: ["mas potente", "potencia", "mas fuerte", "mas caballo", "hp", "fuerza"],
      reply: `💪 <strong>¿Cuál es el camión más potente?</strong><br>
      En configuración de alto rendimiento, tanto el <strong>Kenworth W900</strong> como el <strong>Kenworth T800</strong> pueden equipar el <strong>Cummins X15 Performance</strong> o el <strong>Caterpillar C15 Twin Turbo</strong> entregando entre <strong>565 y 625 HP</strong> con más de <strong>2,050 lb-pie de torque</strong> a 1,150 RPM.`
    },
    {
      keys: ["motor", "motores", "cummins", "caterpillar", "paccar", "cat"],
      reply: `🔧 <strong>Motores más utilizados en tractomulas colombianas:</strong><br>
      • <strong>Cummins X15 / ISX15 (14.9L)</strong>: El rey del mercado colombiano, confiable, con excelente freno de motor y repuestos en cualquier rincón del país.<br>
      • <strong>Caterpillar C15 / 3406E (14.6 - 15.2L)</strong>: Famoso por su sonido inconfundible y su torque descomunal en baja revolución.<br>
      • <strong>PACCAR MX-13 (12.9L)</strong>: Bloque compacto de hierro grafitado (CGI), silencioso y líder en economía de diésel.`
    },
    {
      keys: ["caja", "transmision", "fuller", "cambios", "18 velocidades", "13 velocidades", "splitter"],
      reply: `⚙️ <strong>Transmisiones Eaton Fuller:</strong><br>
      En Colombia, la caja <strong>Fuller Manual de 18 velocidades</strong> es el estándar de oro. Cuenta con:<br>
      1. <strong>Uña o Switch de Rango (Delantero)</strong>: Cambia entre marchas Bajas (1 a 4) y Altas (5 a 8).<br>
      2. <strong>Selector Splitter (Lateral)</strong>: Permite partir cada marcha en 'Directa' (Low) y 'Sobremarcha' (High), brindando 18 relaciones para no perder torque en ascensos pronunciados.`
    },
    {
      keys: ["jake", "freno de motor", "jake brake", "ahogo", "frenado", "bajar"],
      reply: `🛑 <strong>Freno de Motor (Jake Brake):</strong><br>
      Funciona abriendo las válvulas de escape cerca del final de la carrera de compresión del pistón, liberando el aire comprimido a la atmósfera. Esto transforma el motor diésel en un <strong>compresor de aire absorbedor de energía</strong>, entregando hasta 600 HP de poder de frenado. Es vital para descender con seguridad pasos como <em>La Línea</em> o <em>Ventanas</em> sin sobrecalentar las balatas de los frenos de aire.`
    },
    {
      keys: ["la linea", "linea", "alto de minas", "montana", "cordillera", "subir", "curvas", "ruta"],
      reply: `🏔️ <strong>Para rutas de montaña en Colombia (La Línea, Minas, Chicamocha):</strong><br>
      El modelo predilecto por los conductores es el <strong>Kenworth T800</strong>. Su ángulo de trompa inclinada permite ver el vértice de las curvas ciegas a la derecha, mientras que su radio de giro estrecho facilita maniobrar en horquillas cerradas sin invadir el carril contrario.`
    },
    {
      keys: ["cabina", "interior", "litera", "sleeper", "dormitorio", "comodidad", "descanso"],
      reply: `🛋️ <strong>¿Cuál tiene la cabina más amplia y cómoda?</strong><br>
      • <strong>Kenworth W900 Studio Sleeper 86\"</strong>: La más lujosa, con sofá convertible en cama, refrigerador, microondas y clóset completo.<br>
      • <strong>International 9400i Pro-Sleeper</strong>: Destaca por su generosa altura interior que permite caminar erguido sin agacharse.<br>
      • <strong>Kenworth T680</strong>: La más ergonómica y silenciosa con insonorización aerodinámica y asientos con soporte inteligente.`
    },
    {
      keys: ["consumo", "diesel", "acpm", "ahorro", "combustible", "rendimiento", "eficiencia"],
      reply: `⛽ <strong>Consumo y Eficiencia:</strong><br>
      Una tractomula cargada con 52 toneladas en topografía colombiana suele rendir entre <strong>5.5 y 7.5 km por galón de ACPM</strong> dependiendo de la pendiente. El modelo más eficiente es el <strong>Kenworth T680</strong> gracias a sus carenados de chasis y motor <strong>PACCAR MX-13</strong> con inyección inteligente a 2,500 bar.`
    },
    {
      keys: ["colombia", "mas vendido", "mas comun", "popular", "preferido"],
      reply: `🇨🇴 <strong>¿Cuál es el más común en Colombia?</strong><br>
      El <strong>Kenworth T800</strong> es el tractocamión con mayor presencia en el parque automotor de carga pesada de Colombia, seguido de cerca por el <strong>International 9400i</strong> y la nueva flota de <strong>Kenworth T680</strong>.`
    },
    {
      keys: ["aire", "presion de aire", "psi", "tanques de aire", "purga"],
      reply: `💨 <strong>Sistema Neumático & Presión de Aire:</strong><br>
      Los tractocamiones operan con <strong>100 a 125 PSI</strong> de presión en sus tanques primario y secundario. Si la presión cae por debajo de <strong>60 PSI</strong>, suena la chicharra de advertencia y se activa el freno de emergencia (Spring Brakes/Maxi-Brake) bloqueando las ruedas para evitar accidentes.`
    },
    {
      keys: ["hola", "buenas", "que tal", "saludos", "camionero", "buenas tardes", "buenos dias", "hey"],
      reply: `¡Q'hubo, colega! 🚛 Bienvenido a <strong>Colombia Trucks</strong>. Aquí tienes la bitácora completa de los gigantes de la carretera. Puedes preguntarme por especificaciones del <strong>T800, W900, 9400i, T680</strong>, motores <strong>Cummins o CAT</strong>, cajas <strong>Fuller</strong> o secretos para coronar <strong>La Línea</strong>. ¿Qué máquina quieres consultar?`
    },
    {
      keys: ["gracias", "muchas gracias", "excelente", "buena info", "bacano", "listo", "de una"],
      reply: `¡Con gusto, compañero de ruta! 🛣️ Cuide los frenos en la bajada, mantenga la distancia y buen viaje por las carreteras de Colombia. ¡Nos vemos en el próximo paradero!`
    }
  ];

  const FALLBACK = `Mmm, no tengo ese dato exacto en la bitácora de carretera 🤔. Prueba preguntarme por: <br>
  • <em>¿Cuál es el motor del Kenworth T800?</em><br>
  • <em>¿Cómo funciona el freno Jake Brake?</em><br>
  • <em>¿Cuál es la diferencia entre el W900 y el T680?</em><br>
  • <em>¿Cómo manejar la caja Fuller de 18 velocidades?</em><br>
  • <em>¿Cuál es el camión más eficiente para carretera nacional?</em>`;

  const CHIPS = [
    "🚛 ¿Cuál es el camión más potente?",
    "🔧 ¿Qué motor tiene el T800?",
    "🛋️ ¿Cuál tiene mejor cabina?",
    "🏁 ¿Cuál es más clásico?",
    "⚙️ ¿Cuál elegir para La Línea?",
    "🇨🇴 ¿Cuál se ve más en Colombia?",
    "🛑 ¿Cómo funciona el Jake Brake?"
  ];

  const normalize = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function answerFor(text) {
    const q = normalize(text);
    for (const rule of KB) {
      if (rule.keys.some((k) => q.includes(normalize(k)))) return rule.reply;
    }
    return FALLBACK;
  }

  function addMessage(html, who) {
    const div = document.createElement("div");
    div.className = "chat-msg " + who;
    div.innerHTML = html;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function botReply(text) {
    const typing = addMessage('<span class="typing"><i></i><i></i><i></i></span> <span class="typing-label">El Camionero está consultando la bitácora...</span>', "bot");
    setTimeout(() => {
      typing.innerHTML = answerFor(text);
      messages.scrollTop = messages.scrollHeight;
    }, 450 + Math.random() * 400);
  }

  function send(text) {
    if (!text.trim()) return;
    addMessage(text.replace(/</g, "&lt;"), "user");
    botReply(text);
  }

  // Renderizar chips de preguntas rápidas
  CHIPS.forEach((label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", () => send(label));
    chipsBox.appendChild(b);
  });

  let greeted = false;
  function openChat() {
    win.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => win.classList.add("open"));
    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        addMessage(
          `¡Q'hubo, colega! 🚛 Soy el <strong>Asistente Camionero</strong> de Colombia Trucks.<br>
          Pregúntame sobre especificaciones técnicas del <strong>T800, W900, 9400i o T680</strong>, motores <strong>Cummins / CAT / PACCAR</strong>, cajas Fuller o tips de montaña. O toca una de las sugerencias rápidas abajo.`,
          "bot"
        );
      }, 250);
    }
    input.focus();
  }

  function closeChat() {
    win.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
    setTimeout(() => { win.hidden = true; }, 300);
  }

  fab.addEventListener("click", () => (win.hidden ? openChat() : closeChat()));
  closeBtn.addEventListener("click", closeChat);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
    input.value = "";
  });
})();

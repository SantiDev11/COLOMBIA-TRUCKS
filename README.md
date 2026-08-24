# 🇨🇴 COLOMBIA TRUCKS
### *Potencia, carretera y leyenda sobre ruedas*

Plataforma web interactiva, inmersiva y 100% responsiva dedicada a la cultura camionera y a los grandes tractocamiones que conquistan las cordilleras de Colombia.

---

## 🚛 Modelos de Tractomulas Incluidos

| Modelo | Distintivo / Color | Motorización | Aplicación Principal |
| :--- | :--- | :--- | :--- |
| **🟡 Kenworth T800** | *El Rey de la Montaña* (Amarilla) | Cummins X15 (600 HP) | Alta montaña, trocha pesada y minería |
| **🟤 International Eagle 9400i** | *El Águila de Acero* (Marrón) | Cummins ISX / Cat C15 (500 HP) | Carga seca, fletes nacionales y confort |
| **⚪ Kenworth W900** | *El Ícono Clásico* (Blanca / Beige) | CAT C15 Twin Turbo (625 HP) | Transporte pesado tradicional y exhibición |
| **🔴 Kenworth T680** | *Vanguardia Aerodinámica* (Roja) | PACCAR MX-13 / Cummins X15 (510 HP) | Rutas de crucero y máxima eficiencia |

---

## ✨ Características Principales

1. **🚛 Catálogo Interactivo & Fichas Técnicas**:
   - Galería de tarjetas con especificaciones mecánicas detalladas.
   - Modales de ingeniería técnica: torque, relación de diferencial, capacidad de arrastre C3-S3 y cabinas.
2. **🎛️ Simulador de Clúster de Instrumentos**:
   - Tacómetro, velocímetro, manómetro de turbo y presión de aire primario/secundario en tiempo real.
   - **Sonido Real de Acelerador sincronizado con YouTube Shorts**: reproduce el silbido del turbo y rugido de escape.
   - Activación de Freno Jake Brake, arranque y cornetas neumáticas.
3. **🎬 Centro de Video de Tractocamiones Reales**:
   - Reproductor con los 4 videos de YouTube de tractomulas en carretera colombiana.
   - Pestañas directas y botones de apertura oficial.
4. **⚔️ Comparador Técnico Cara a Cara**:
   - Análisis simultáneo de dos tractomulas con veredicto técnico imparcial y gráficos de radar.
5. **🗺️ Rutas Legendarias de Colombia**:
   - Mapa y perfiles altimétricos de *La Línea*, *El Alto de Letras*, *La Nariz del Diablo* y el *Cañón del Chicamocha*.
6. **🎮 Mini-Juego 2D: "Desafío de la Línea"**:
   - Simulador de descenso de cordillera en Canvas a 60 FPS.
   - Gestión de temperatura de frenos con Jake Brake, esquive de tráfico, recolección de ACPM y bonificaciones de flete.
   - Compatible con teclado (PC) y controles táctiles en pantalla (Móviles/Tablets).
7. **💬 Chatbot Asistente: "Pregúntale al Camionero"**:
   - Respuestas inteligentes sobre cajas Fuller de 18 velocidades, motores Cummins/Cat, códigos de tránsito y técnicas de montaña.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5 Semántico, Vanilla CSS3 (Custom Properties, Grid & Flexbox) y JavaScript Moderno (ES6+).
- **Audio & Gráficos**: Web Audio API (síntesis de frecuencias diésel), HTML5 Canvas 2D.
- **Multimedia**: Integración de la API de YouTube / YouTube IFrame Player.
- **Diseño**: 100% Responsivo (Mobile-First, Tablets, Desktops y Pantallas Ultra-Wide).

---

## 🚀 Instalación y Ejecución Local

1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/colombia-trucks.git
   ```
2. Entra en el directorio del proyecto:
   ```bash
   cd colombia-trucks
   ```
3. Inicia un servidor web local:
   - Con **Python**:
     ```bash
     python -m http.server 8080
     ```
   - Con **Node.js / npx**:
     ```bash
     npx serve
     ```
4. Abre tu navegador en:
   ```
   http://localhost:8080
   ```

---

## 📁 Estructura del Proyecto

```
la-vida-de-gabo/
├── assets/
│   └── images/
│       ├── kenworth-t800.jpg
│       ├── international-9400i.jpg
│       ├── kenworth-w900.jpg
│       └── kenworth-t680.jpg
├── css/
│   └── responsive.css
├── js/
│   ├── trucks-data.js
│   ├── routes-data.js
│   ├── canvas-hero.js
│   ├── dashboard.js
│   ├── comparator.js
│   ├── truck-runner.js
│   ├── chatbot.js
│   └── main.js
├── index.html
└── README.md
```

---

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos y de homenaje a la cultura transportadora de Colombia.

# 📻 Radio Puerto Quidico 105.1 FM / 91.3 FM - Sitio Web Oficial

> **"Tu Radio de Siempre • La Costa de Arauco al Mundo"**  
> Caleta Quidico & Borde Costero de Tirúa, Región del Biobío, Chile.

Plataforma web progresiva (PWA), moderna y de alta resiliencia diseñada para la difusión de la señal en vivo de **Radio Puerto Quidico**, integrando transmisión de audio ininterrumpida, Quidico TV, programación comunal, satélite de mareas en tiempo real y panel de administración para cabina.

---

## 🌊 Características Principales

1. **Streaming en Vivo de Alta Resiliencia (Zero-Drop Audio):**
   - Transmisión continua bajo HTTPS (Zeno FM / SonicPanel Icecast).
   - Reconexión inteligente ante zonas sin cobertura en la Ruta P-72S (eventos `online`/`offline`).
   - Selector de calidad dual: **HD (128 kbps)** y modo ahorro de datos rural **ECO (64 kbps)**.
   - Perro guardián (*watchdog*) que detecta automáticamente flujos congelados y reinicia el búfer sin intervención del oyente.

2. **Seguridad y Panel de Administración de Cabina:**
   - Panel de control de transmisión accesible mediante atajo (`Ctrl + Shift + A` / `Alt + A`).
   - Autenticación blindada mediante **resumen criptográfico SHA-256** con salt aleatorio.
   - Protección contra ataques de fuerza bruta persistente e inmune a recargas del navegador (`F5`).
   - Control de fuentes de audio, pautas de auspiciadores y programación al aire.

3. **Sistema de Cadena Radial de Emergencia en Tiempo Real:**
   - Emisión instantánea de avisos comunales prioritarios (marejadas, cortes de camino, emergencias marítimas).
   - Barra de alerta visual de alto impacto con sincronización distribuida en segundo plano para oyentes móviles.

4. **Telemetría Oceanográfica y Satelital de Caleta Quidico:**
   - Conexión con satélites y boyas de *Open-Meteo Marine* para las coordenadas exactas de Caleta Quidico (`-38.243, -73.492`).
   - Monitoreo en vivo de altura y período de olas, viento en nudos, temperatura del agua Humboldt, fase lunar y estimación de pleamar/bajamar.

5. **Parrilla de Programación Oficial y Auspiciadores:**
   - Programas oficiales al aire (*Noticias Matinal*, *Noticias Mediodía*, *Surcando el Lafken*, *DJ Dino en Vivo*).
   - Alianza comercial con *Comercializadora Don Nica*.
   - Lightbox en alta definición con afiches oficiales y soporte de respaldo ante conexiones inestables.

6. **Aplicación Web Progresiva (PWA):**
   - Instalable directamente en teléfonos Android, iPhone y computadores.
   - Service Worker v2 con estrategia de exclusión total para streams en vivo (`network-only`).

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19, Tailwind CSS v4, Vite 8.
* **Componentes UI:** Lucide Icons, FontAwesome 6, Google Fonts (Montserrat, Inter, Anton, Oswald).
* **Fondo:** WebGL Fluid Field interactivo.
* **Seguridad:** Web Crypto API (`crypto.subtle`), cabeceras HTTP nosniff, strict-origin y Permissions-Policy.

---

## 🚀 Despliegue en Producción (Vercel)

El proyecto incluye la configuración [`vercel.json`](./vercel.json) lista para producción.

1. **Subir cambios a GitHub:**
   ```bash
   git add .
   git commit -m "feat: Radio Puerto Quidico official production release"
   git push origin main
   ```
2. **Conectar en Vercel:**
   - Inicia sesión en [Vercel](https://vercel.com).
   - Selecciona **"Add New Project"** e importa el repositorio de GitHub.
   - Vercel detectará automáticamente Vite y desplegará la web en segundos con certificado SSL gratis.
   - Asocia tu dominio oficial (ej: `radiopuertoquidico.cl`) en la pestaña **Settings > Domains**.

---

## ⚖️ Marco Regulatorio

Emisora de radiodifusión sonora regulada por **SUBTEL Chile**.  
Contenidos y fonogramas protegidos por la Ley N° 17.336 de Propiedad Intelectual (**SCD / Profovi / ChileActores**).

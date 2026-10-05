# 📻 MANUAL DE ENTREGA Y ADMINISTRACIÓN
## Radio Puerto Quidico 105.1 FM / 91.3 FM Tirúa Costa
**"Tu Radio de Siempre • La Costa de Arauco al Mundo"**

---

## 🔑 1. Credenciales y Acceso al Panel de Administración

El sitio web cuenta con un **Panel de Control Integrado** protegido por código PIN, diseñado especialmente para que el dueño de la radio y los locutores puedan actualizar la información del sitio web en tiempo real **sin necesidad de saber programar ni contratar mantenciones costosas**.

* **PIN de Fábrica:** `1051`
* **Formas de Acceder:**
  1. **Desde cualquier teclado:** Presionar la combinación de teclas **`Ctrl + Shift + A`** (o `Alt + A`).
  2. **Desde el pie de página (Footer):** En la parte inferior del sitio web, hacer clic en el botón con ícono de candado **`[ 🔒 Panel Emisora ]`**.

---

## 🛠️ 2. ¿Qué puede configurar el dueño de la radio?

El panel cuenta con **6 pestañas interactivas**:

### 📡 Pestaña 1: Emisora & Streaming
* **Nombre de la Estación y Frecuencias:** Modificar "Radio Puerto Quidico", "105.1 FM" y "91.3 FM".
* **Slogan y Lema:** Personalizar las frases que identifican a la emisora.
* **Horarios de Transmisión:** Indicar los horarios oficiales al aire.
* **Servidor de Streaming (Audio en Vivo):**
  * URL configurada actual: `https://sonic.portalfoxmix.club/8320/;`
  * *Nota para servidores Shoutcast / SonicPanel:* Siempre asegúrese de que el enlace termine en `;` (punto y coma) para forzar la reproducción directa del flujo de audio en todos los navegadores móviles y de escritorio.
* **Streaming de Respaldo (Fallback):** Enlace secundario automático por si el servidor principal sufre una caída.
* **Teléfonos y WhatsApp de Cabina:** Cambiar el número telefónico para pedidos musicales y llamadas de emergencia al aire.
* **Dirección física y Correo Electrónico.**

### 📅 Pestaña 2: Parrilla de Programación
* **Agregar Nuevos Programas:** Botón **`+ Agregar Programa`**.
* **Campos editables por programa:**
  * Título del programa (ej: *Conexión Costera*, *Amanecer en la Caleta*, *Faro Informativo*).
  * Conductor / Locutor al aire.
  * Horario visible (ej: `09:00 - 13:00`).
  * Horas de inicio y fin (números de 0 a 23) para que la tarjeta **"Al Aire Ahora"** detecte automáticamente qué programa está en vivo según la hora del reloj.
  * Categoría (Madrugadores, Magazine Líder, Prensa, Folclore, etc.).
  * Resumen o descripción del contenido.
* **Eliminar Programas:** Botón con ícono de basurero rojo en cada tarjeta.

### 📰 Pestaña 3: Noticias de la Costa
* **Publicar Noticias Locales:** Botón **`+ Agregar Noticia`**.
* **Campos por noticia:**
  * Título impactante.
  * Categoría (Comunidad, Marítimo, Obras, Deportes, Cultura).
  * Fecha de publicación.
  * Resumen de la noticia.
  * URL de Fotografía: Puedes pegar enlaces directos de imágenes de Facebook, Google Drive público, Imgur, o del hosting.

### 📢 Pestaña 4: Avisos a la Comunidad
* **Publicar Avisos de Utilidad Pública:**
  * Reuniones de juntas de vecinos, cortes de agua/luz programados, búsqueda de documentos extraviados, beneficios y bingos solidarios.
  * Opción de marcar como **"Urgente"** (se destacará en rojo con insignia pulsante) o aviso normal (azul costero).
  * Teléfono o contacto responsable del aviso.

### 🤝 Pestaña 5: Auspiciador Oficial
* Destacar a los negocios y empresas locales que apoyan a la radio (actualmente: *Comercializadora Don Nica*).
* Modificar el nombre del auspiciador, descripción de sus productos/servicios y el enlace directo a su WhatsApp comercial.

### 💾 Pestaña 6: Respaldos, Exportación y Cambio de PIN
* **Descargar Respaldo JSON:** Descarga un archivo con toda la configuración actual de la radio en 1 clic (`radio-quidico-config-YYYY-MM-DD.json`).
* **Importar Respaldo:** Si cambias de computador o formateas el equipo, puedes pegar el archivo JSON para restaurar toda la radio en un instante.
* **Cambiar PIN:** Puedes reemplazar el PIN `1051` por un código numérico privado de tu preferencia.
* **Restaurar Fábrica:** Botón de emergencia que vuelve a dejar el sitio web con la configuración original en caso de cualquier equivocación.

---

## 📱 3. Interacción con Auditores (WhatsApp y Cabina)

1. **Botón Flotante "Escribir a Cabina":** Siempre disponible en la esquina inferior derecha con la foto y estado en línea de los animadores.
2. **Modal "Pedir Tema / Mandar Saludo / Aviso Social":**
   * El auditor ingresa su nombre, su localidad (Quidico, Tirúa, Ponotro, Isla Mocha, etc.) y su mensaje.
   * Al presionar enviar, se abre automáticamente WhatsApp con un mensaje estructurado y listo para enviar al número oficial **`+569 6267 9087`**.

---

## 🚀 4. Guía para el Desarrollador (Puesta en Producción)

### A. Estructura del Proyecto
* **Vite + React 18 + Tailwind CSS**
* **Fuentes Oficiales:** Anton (títulos de impacto y dial), Inter (lectura, noticias y UI) y Oswald (etiquetas de audio).
* **Fondo Dinámico:** Shaders WebGL en Canvas (`FluidFieldBackground`) optimizado a 60 FPS con bajo consumo de memoria.

### B. Comando de Compilación
```bash
# Compilar para producción (carpeta /dist)
npm run build

# Previsualizar la versión compilada
npm run preview
```

### C. Despliegue Gratuito Recomendado (Vercel o Netlify)
1. Subir este repositorio a GitHub.
2. Iniciar sesión en [Vercel](https://vercel.com) o [Netlify](https://netlify.com).
3. Seleccionar **"Import Git Repository"**.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Hacer clic en **Deploy**.

### D. Conexión del Dominio Propio `www.radiopuertoquidico.cl`
1. En el panel de Vercel/Netlify, ir a **Settings > Domains**.
2. Agregar `radiopuertoquidico.cl` y `www.radiopuertoquidico.cl`.
3. En el panel de NIC Chile (nic.cl), configurar los DNS (Nameservers) o registros CNAME/A según las instrucciones de Vercel.

---

## 🔒 5. Resumen de Seguridad y Resiliencia
* **Cero Base de Datos Requerida:** La configuración se almacena de forma persistente y ultrarrápida en el almacenamiento del navegador (`localStorage`), permitiendo alojamiento 100% gratuito sin costos recurrentes de servidores o bases de datos.
* **Descarga de Copias de Seguridad:** Con el botón de exportación JSON, el dueño puede guardar copias de seguridad de sus noticias y programas cada vez que lo desee.
* **Audio Resiliente:** Si el reproductor detecta una interrupción en la señal principal, cambia automáticamente a la señal de respaldo o permite al usuario reconectar con un clic.

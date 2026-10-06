/**
 * CONFIGURACIÓN GENERAL - RADIO PUERTO QUIDICO 105.1 FM
 * Basado en la especificación del diseño Stitch Costera Azul
 */

export const RADIO_CONFIG = {
  // Datos Principales de la Emisora
  stationName: "Radio Puerto Quidico",
  stationShortName: "Radio Quidico",
  frequencyPrimary: "105.1 FM",
  frequencySecondary: "91.3 FM",
  dial: "105.1 FM Quidico • 91.3 FM Tirúa Costa",
  slogan: "Tu Radio de Siempre • La Costa de Arauco al Mundo",
  motto: "Somos el puerto de la entretención",
  location: "Caleta Quidico, Comuna de Tirúa, Región del Biobío, Chile",
  broadcastHours: "06:00 a 24:00 HRS",
  productionTeam: "Puerto Quidico Producción",

  // IMÁGENES Y ASSETS DEL SITIO OFICIAL
  branding: {
    // Logo oficial circular con faro y oleaje de Radio Puerto Quidico
    logo: "/images/logo-radio-puerto-quidico.jpg",
    // Banner oficial de cabecera de Radio Puerto Quidico
    logoBanner: "/images/logo-radio-puerto-quidico.jpg",
    // Banner panorámico web oficial con Caleta Quidico y el muelle
    webBanner: "/images/originales_blog/header-banner.jpg",
    // Quidico TV Live Mock & Flyer Oficial de YouTube
    tvMockImage: "/images/originales_blog/youtube-puerto-quidico-tv.jpg",
    youtubeBanner: "/images/originales_blog/youtube-puerto-quidico-tv.jpg",
    // Comercializadora Don Nica (Afiche oficial del blog)
    sponsorImage: "/images/originales_blog/auspiciador-don-nica.jpg",
    // Afiche oficial DJ Dino en vivo 91.3 FM Domingo
    djDinoBanner: "/images/originales_blog/en-vivo-banner.jpg",
    // Hero Card oficial de Radio Puerto Quidico
    heroCardImage: "/images/originales_blog/en-vivo-banner.jpg",
  },

  // ENLACES DE STREAMING DE AUDIO EN VIVO REAL
  // Señal conectada: Radio La Sureña Ranchera de Chile (Zeno.FM)
  streamUrl: "https://stream.zeno.fm/tf9zwn5vmd0uv",
  streamUrlHd: "https://stream.zeno.fm/tf9zwn5vmd0uv",
  streamUrlEco: "https://stream.zeno.fm/tf9zwn5vmd0uv",
  fallbackStreamUrl: "https://sonic.portalfoxmix.club/8320/;",

  // CONMUTADOR DE FUENTES DE AUDIO & CADENAS
  audioSources: {
    activeSource: 'cabina', // 'cabina' | 'autodj' | 'cadena'
    cabinaUrl: "https://stream.zeno.fm/tf9zwn5vmd0uv",
    autodjUrl: "https://sonic.portalfoxmix.club/8320/;",
    cadenaUrl: "https://icecast.walmradio.com:8443/jazz",
    cadenaName: "Cadena Radial de Emergencia / ARCHI",
  },

  // PARÁMETROS DE ENLACE MÓVIL Y DESPACHOS EN TERRENO
  remoteBroadcast: {
    serverHost: "sonic.portalfoxmix.club",
    port: "8320",
    mountPoint: "/live",
    djUsername: "quidico_movil",
    recommendedCodec: "AAC+ (HE-AAC v2)",
    recommendedBitrate: "64 kbps (Óptimo para 3G/4G Costero)",
    adminPanelUrl: "https://sonic.portalfoxmix.club:2083/",
  },

  // METADATOS Y CANCIÓN / TEMA EN TRANSMISIÓN AL AIRE
  onAir: {
    currentSong: "La Coronela",
    currentArtist: "Los Cumbiancheros del Sur",
    currentShow: "Radio La Sureña Ranchera de Chile",
    currentHost: "Transmisión en Vivo",
    isLive: true,
    broadcastMode: "EN VIVO", // 'EN VIVO' | 'AUTOMATIZADO' | 'CADENA COMUNAL'
    genre: "Cumbia Ranchera de Chile",
    lastUpdated: "Transmitiendo al aire",
    // Historial de canciones emitidas recientemente ("¿Qué sonó recién?")
    songHistory: [
      { id: "sh-1", song: "Cómo Dejar de Amarte", artist: "Los Charros de Lumaco", time: "Ahora al aire", genre: "Cumbia Ranchera" },
      { id: "sh-2", song: "Un Amor Violento", artist: "Los Tres", time: "Hace 6 min", genre: "Rock Chileno" },
      { id: "sh-3", song: "El Embrujo", artist: "Américo", time: "Hace 11 min", genre: "Cumbia Tropical" },
      { id: "sh-4", song: "Juana María", artist: "Los Vásquez", time: "Hace 16 min", genre: "Pop Cebolla" },
      { id: "sh-5", song: "Vuelve Vuelve", artist: "Zalo Reyes", time: "Hace 21 min", genre: "Recuerdo y Balada" },
      { id: "sh-6", song: "Loco (Tu Forma de Ser)", artist: "Los Auténticos Decadentes", time: "Hace 26 min", genre: "Fiesta y Clásicos" },
      { id: "sh-7", song: "Vuela Una Lágrima", artist: "Los Nocheros", time: "Hace 31 min", genre: "Folklore Romántico" },
      { id: "sh-8", song: "Lejos del Amor", artist: "Illapu", time: "Hace 36 min", genre: "Raíz Latinoamericana" }
    ]
  },

  // SISTEMA DE ALERTA DE EMERGENCIA & CADENA RADIAL COMUNAL
  emergencyAlert: {
    active: false,
    level: "urgente", // 'urgente' (rojo) | 'precaucion' (ámbar) | 'informativo' (azul)
    title: "CADENA RADIAL DE EMERGENCIA - ALERTA COSTERA",
    message: "Aviso de la Autoridad Marítima: Fuertes marejadas anormales en Caleta Quidico y litoral de Tirúa. Se solicita precaución extrema y alejarse de roqueríos.",
    source: "SENAPRED / Capitanía de Puerto Lebu",
    updatedAt: "Hace instantes",
    actionLabel: "Escuchar Transmisión Oficial",
  },

  // PRESETS DE EMERGENCIA RÁPIDOS PARA LA EMISORA
  emergencyPresets: [
    {
      id: 'marejadas',
      level: 'urgente',
      title: '🌊 ALERTA DE MAREJADAS ANORMALES',
      message: 'Aviso de la Autoridad Marítima: Fuertes rompientes y oleaje en Caleta Quidico y Borde Costero Tirúa. Prohibido el ingreso al mar y faenas náuticas.',
      source: 'Capitanía de Puerto / Armada de Chile'
    },
    {
      id: 'corte-ruta',
      level: 'precaucion',
      title: '🚨 PRECAUCIÓN: TRÁNSITO INTERRUMPIDO EN RUTA P-72S',
      message: 'Carabineros de Tirúa informa interrupción en ruta costera hacia Cañete. Se recomienda máxima precaución a conductores y respetar desvíos señalizados.',
      source: 'Carabineros de Chile / Radio Quidico'
    },
    {
      id: 'corte-luz',
      level: 'informativo',
      title: '⚡ CORTE GENERAL DE SUMINISTRO ELÉCTRICO',
      message: 'Brigadas de FRONTEL trabajan en la reposición del servicio en Quidico, Tirúa e Isla Mocha. Radio Puerto Quidico continúa al aire mediante generador de respaldo.',
      source: 'Comité de Emergencia Comunal Tirúa'
    },
    {
      id: 'temporal',
      level: 'precaucion',
      title: '🌧️ ALERTA METEOROLÓGICA: SISTEMA FRONTAL',
      message: 'Rachas de viento de hasta 75 km/h y precipitaciones intensas en la Costa de Arauco. Líneas de emergencia comunal en alerta preventiva.',
      source: 'SENAPRED Región del Biobío'
    }
  ],

  // Contacto Oficial Stitch
  contact: {
    whatsapp: "+56962679087", // Número de cabina Stitch
    whatsappDisplay: "+569 6267 9087",
    phoneCabina: "+56 9 6267 9087",
    email: "puertoquidico@gmail.com",
    address: "Caleta Quidico S/N, Comuna de Tirúa, Región del Biobío, Chile",
    website: "www.radiopuertoquidico.cl",
    socialLinks: {
      youtube: "https://www.youtube.com/@PuertoQuidicoTV",
      youtubeHandle: "@PuertoQuidicoTV",
      facebook: "https://www.facebook.com/radiopuertoquidico",
      instagram: "https://www.instagram.com/donnicamar_cl/"
    }
  },

  // Auspiciador Oficial de la Costa
  sponsors: [
    {
      id: "sponsor-don-nica",
      name: "Comercializadora Don Nica",
      tagline: "Productos del Mar Congelados de la Mejor Calidad para tu Mesa y tu Negocio",
      description: "Productos del Mar Frescos y Congelados directamente extraídos de las costas de Quidico y Tirúa. Sierra, corvina, róbalo, reineta y mariscos seleccionados con cadena de frío garantizada.",
      phone: "+569 6267 9087",
      whatsappUrl: "https://wa.me/56962679087?text=Hola%20Don%20Nica,%20quiero%20hacer%20un%20pedido%20de%20mariscos%20desde%20Radio%20Quidico",
      instagramUrl: "https://www.instagram.com/donnicamar_cl/",
      image: "/images/originales_blog/auspiciador-don-nica.jpg",
      category: "Productos del Mar",
      tags: ["Mariscos Seleccionados", "Pescados del Día", "Envíos a la Región"],
      clicks: 42
    }
  ],

  // PLANES Y TARIFARIO PUBLICITARIO DE LA RADIO
  advertisingPlans: [
    {
      id: "plan-bronce",
      tier: "Plan Bronce",
      name: "Pyme & Comercio Local",
      price: "$35.000 / mes",
      badge: "Ideal Emprendedores",
      features: [
        "4 Menciones al aire diarias en programas en vivo",
        "Publicación de logo y enlace en la web oficial",
        "Difusión en historias de redes sociales oficiales",
        "Enlace directo de WhatsApp en la sección de auspiciadores"
      ]
    },
    {
      id: "plan-plata",
      tier: "Plan Plata",
      name: "Auspicio de Bloque Estelar",
      price: "$75.000 / mes",
      badge: "Más Solicitado",
      recommended: true,
      features: [
        "8 Menciones al aire en horarios de alta sintonía",
        "Auspicio exclusivo de bloque (ej: Boletín Marítimo o Noticias)",
        "Banner publicitario destacado en la página de inicio",
        "Mención especial los fines de semana con DJ Dino",
        "Reporte mensual de clics e interacciones de auditores"
      ]
    },
    {
      id: "plan-oro",
      tier: "Plan Oro",
      name: "Empresa Total & Quidico TV",
      price: "$130.000 / mes",
      badge: "Máxima Cobertura",
      features: [
        "Spot publicitario rotativo de 30 seg cada cambio de hora (24/7)",
        "Auspicio central en Quidico TV HD (canal de video)",
        "Presencia destacada en el reproductor web persistente",
        "Cobertura y despacho en vivo de inauguraciones o eventos",
        "Prioridad en campañas de temporada estival y fiestas patrias"
      ]
    }
  ],

  // Parrilla de Programación Oficial de Radio Puerto Quidico (91.3 FM)
  schedule: [
    {
      id: "prog-noticias-matinal",
      title: "Las Noticias en Puerto Quidico (Edición Matinal)",
      shortTitle: "Las Noticias (Edición Matinal)",
      host: "Departamento de Prensa",
      time: "06:00 - 09:00",
      startHour: 6,
      endHour: 9,
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      category: "Informativo Matinal",
      description: "De 6 a 9 de la mañana. Información que te conecta con lo que importa: información veraz, hechos locales, nacional e internacional y compromiso con nuestra gente en el nuevo dial 91.3 FM.",
      tag: "En Vivo Matinal",
      image: "/images/noticias-puerto-quidico.png",
      dial: "91.3 FM",
      featured: true
    },
    {
      id: "prog-noticias-mediodia",
      title: "Las Noticias en Puerto Quidico (Edición Mediodía)",
      shortTitle: "Las Noticias (Edición Mediodía)",
      host: "Departamento de Prensa",
      time: "12:00 - 13:00",
      startHour: 12,
      endHour: 13,
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      category: "Informativo Mediodía",
      description: "De 12 a 13:00 horas. Todo el pulso informativo de la jornada y el acontecer comunal de Quidico y Tirúa con nuestro equipo periodístico en el nuevo dial 91.3 FM.",
      tag: "Noticias Centrales",
      image: "/images/noticias-puerto-quidico.png",
      dial: "91.3 FM",
      featured: true
    },
    {
      id: "prog-surcando-el-lafken",
      title: "Surcando el Lafken",
      shortTitle: "Surcando el Lafken",
      host: "Luis Sandoval Antilao (Concejal de Tirúa)",
      time: "19:00 - 21:00",
      startHour: 19,
      endHour: 21,
      days: ["Martes"],
      category: "Política e Información",
      description: "Todos los martes desde las 19:00 hrs. Política, territorio e información desde nuestra costa: análisis y opinión, debate, participación y las voces de nuestro territorio con Luis Sandoval Antilao por Radio Puerto Quidico 91.3 FM.",
      tag: "Política & Territorio",
      image: "/images/surcando-el-lafken.png",
      dial: "91.3 FM",
      featured: true
    },
    {
      id: "prog-dj-dino",
      title: "DJ Dino se toma el dial en Quidico",
      shortTitle: "DJ Dino en Vivo",
      host: "DJ Dino",
      time: "10:00 - 14:00",
      startHour: 10,
      endHour: 14,
      days: ["Domingo"],
      category: "En Vivo Domingos",
      description: "Desde las 10 de la mañana hasta las 14:00 hrs, DJ Dino se toma el dial en Quidico acompañando tu domingo con la mejor música y dedicatorias al WhatsApp +569 6267 9087 en el dial 91.3 FM.",
      tag: "Especial Domingos",
      image: "/images/dj-dino-domingo.png",
      dial: "91.3 FM",
      phone: "+56962679087",
      featured: true
    }
  ],

  // Noticias Locales de la Costa Stitch
  news: [
    {
      id: "noticia-1",
      title: "Mejoras en la Caleta y actividades turísticas de temporada",
      date: "Hoy • Caleta Quidico",
      category: "Comunidad",
      summary: "Pescadores artesanales y vecinos impulsan jornadas gastronómicas y habilitación de paseos náuticos familiares en la ribera costera y desembocadura del río Quidico.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsAfhK9rrE2Qz6sCX_HI_hUeoFt8k3-GdAD6wD1_-o3oN0I4CmKrt1Lgzcyx5-oB-T7sx0wP2YXUqUC7ZsZjok692Z31RiKnycCSmu3GeAD8WGN_6T6prOxdwdSMO8VvJPtn6b8rKqkhFL5D7l-2Vhz3pv_zUgspWt6FOHpfnOk7Yhak9JgQJqXQ-t50x9pha_ouXTUAZbuVBysVN-Zdfa1eCjEm5ZZzunIWrDDIakHpUY8l4jIEQaOg",
      readTime: "Hace 2 horas",
      author: "Prensa Puerto Quidico"
    },
    {
      id: "noticia-2",
      title: "Aviso de marejadas y condiciones de navegación para el litoral",
      date: "Ayer • Tirúa Costa",
      category: "Alerta Marítima",
      summary: "Capitanía de Puerto reitera llamado a la precaución a patrones de embarcaciones menores en la bahía de Quidico y sectores aledaños.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD33Q0TqYCY30LUvZbC2tzGI-tO8DK0312zShu_07Tze6f1Rj0NEiooEfPOQsIcNbx5vcQHO1BdKhbwKkKKUDvXJSkdEdYsWPo7OdtNo0XpeC0DuYjqVXwJxnfKq3nPgVLrmJMVRag3HndUDr2r-B5cs1LthmUv3pwtiJLMLXgRcUQBWqkahVefBPU1-OK_W8Xi6SpqVTQ55DAnQvHP1WdGyBRZuQRAPebs2qe92sY1GuJQXAV7UvsxWw",
      readTime: "Hace 1 día",
      author: "Capitanía de Puerto"
    },
    {
      id: "noticia-3",
      title: "Encuentro de cantores populares en la costa de Arauco",
      date: "Hace 2 días • Región",
      category: "Cultura Costera",
      summary: "Radio Puerto Quidico transmitirá en vivo las presentaciones musicales en el marco del rescate patrimonial y memoria campesina y lafkenche.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBW6TGPcQaYPS2jsjkunSaluRByzZfp7UHvgPz1SsPW3U_wqMBpLlf2WZ4U72Wf-Arzen5nffCN-fDY_aKRmnv3neIIRKbuPLikViC4EL6l_SnqsGh9v1FdsszSh8y-knpoWi1FwaPCiq9rINwkC7OraOb444toJaL6DtKTnoOvkgQZAOI6-LJpL18QiOobJZpVXEk8vTaMUNYYxXjN2qjWqG8THjtQ7zaYy9A_VJOTkpSad7scZonw3Q",
      readTime: "Sábado 16:00 hrs",
      author: "Cultura & Patrimonio"
    }
  ],

  // Avisos de Utilidad Pública a la Comunidad
  communityNotices: [
    {
      id: "aviso-1",
      urgent: true,
      title: "Ronda Médica Posta Rural Quidico",
      date: "Viernes 09:00 hrs",
      content: "Atención de médico general, matrona y entrega de medicamentos en la posta rural. Recuerde llevar su carnet de control."
    },
    {
      id: "aviso-2",
      urgent: false,
      title: "Reunión Junta de Vecinos N°4 Quidico Centro",
      date: "Sábado 17:30 hrs",
      content: "Convocatoria extraordinaria en la sede comunitaria para evaluar proyectos de mejoramiento costero."
    },
    {
      id: "aviso-3",
      urgent: true,
      title: "Aviso de Mar: Oleaje Moderado en el Litoral",
      date: "Capitanía de Puerto",
      content: "Se recomienda precaución en la navegación y faenas extractivas para embarcaciones menores en la bahía."
    }
  ],

  // Podcasts y Programas Grabados (Gestionables dinámicamente desde el Panel de Emisora)
  podcasts: [],

  // Reporte Náutico y Mareas de Caleta Quidico & Tirúa
  maritimeWeather: {
    portStatus: "ABIERTO", // "ABIERTO" | "CERRADO" | "PRECAUCIÓN"
    portStatusDetail: "Abierto para embarcaciones menores dentro y fuera de la bahía",
    airTemp: "17°C",
    waterTemp: "13°C",
    condition: "Parcialmente Despejado",
    windSpeed: "12 Nudos",
    windDirection: "Sur-Suroeste (SSO)",
    waveHeight: "1.8 m",
    highTide: "14:20 hrs (1.6m)",
    lowTide: "20:45 hrs (0.4m)",
    lunarPhase: "Cuarto Creciente",
    advisory: "Condiciones favorables para faenas de pesca artesanal y recolección de orilla en Quidico y Tirúa.",
    updatedAt: "Hoy 08:30 hrs • Capitanía de Puerto"
  }
};

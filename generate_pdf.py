import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header top border
        self.setStrokeColor(colors.HexColor("#00a0c8"))
        self.setLineWidth(1.5)
        self.line(40, letter[1] - 35, letter[0] - 40, letter[1] - 35)
        
        # Header text
        self.drawString(40, letter[1] - 30, "RADIO PUERTO QUIDICO 105.1 FM / 91.3 FM • RESUMEN EJECUTIVO")
        self.drawRightString(letter[0] - 40, letter[1] - 30, "ESTUDIOS CALETA QUIDICO & TIRÚA COSTA")

        # Footer bottom border
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.8)
        self.line(40, 40, letter[0] - 40, 40)

        # Footer text
        self.drawString(40, 28, "Confidencial • Presentación a Dirección de Emisora")
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(letter[0] - 40, 28, page_str)
        self.restoreState()

def build_pdf_summary(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    NAVY = colors.HexColor("#01244e")
    BLUE = colors.HexColor("#006494")
    CYAN = colors.HexColor("#00a0c8")
    DARK = colors.HexColor("#1e293b")
    MUTED = colors.HexColor("#64748b")
    LIGHT_BG = colors.HexColor("#f8fafc")
    BOX_BG = colors.HexColor("#edf8fd")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=NAVY,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=CYAN,
        spaceAfter=4
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=MUTED,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=NAVY,
        spaceBefore=8,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=DARK,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=DARK,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1 # Center
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10,
        textColor=DARK
    )

    table_cell_center = ParagraphStyle(
        'TableCellCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10,
        textColor=DARK,
        alignment=1
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10,
        textColor=NAVY,
        alignment=1
    )

    story = []

    # Title Block
    story.append(Paragraph("RADIO PUERTO QUIDICO 105.1 FM / 91.3 FM", title_style))
    story.append(Paragraph("RESUMEN EJECUTIVO: ECOSISTEMA MULTIMEDIA & MODELO COMERCIAL", subtitle_style))
    story.append(Paragraph("Caleta Quidico • Borde Costero Tirúa • Isla Mocha • Documento de Presentación a Dirección", meta_style))
    story.append(HRFlowable(width="100%", thickness=1, color=CYAN, spaceBefore=0, spaceAfter=8))

    # 1. Visión y Propósito
    story.append(Paragraph("1. ¿Qué representa esta plataforma para la radio?", h1_style))
    story.append(Paragraph(
        "Este desarrollo transforma a Radio Puerto Quidico de una emisora analógica de alcance territorial limitado "
        "en una <b>estación multimedia comunitaria disponible 24/7 en cualquier celular, computador y smart TV del mundo</b>, "
        "sin perder jamás la identidad lafkenche, costera y ranchera de nuestra tierra.",
        body_style
    ))

    # Box: 3 Ejes Centrales
    ejes_data = [
        [
            Paragraph("<b>📡 Cobertura Universal:</b> Fin de las zonas de sombra. Llega a botes pescadores en altamar y a familias en Cañete, Concepción o el extranjero.", table_cell_style),
            Paragraph("<b>💰 Centro de Ingresos:</b> Auspiciadores medibles con clics transparentes y reportes formales de WhatsApp para cobrar con respaldo.", table_cell_style)
        ],
        [
            Paragraph("<b>🚨 Rol Comunal Clave:</b> Boletín marítimo satelital de mareas en tiempo real y cadena de emergencia con sirena en 1 clic.", table_cell_style),
            Paragraph("<b>📱 App Móvil sin Costo:</b> Instalación como aplicación en Android e iPhone (PWA) sin pagos a Google ni Apple.", table_cell_style)
        ]
    ]
    t_ejes = Table(ejes_data, colWidths=[265, 265])
    t_ejes.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BOX_BG),
        ('BOX', (0,0), (-1,-1), 1, CYAN),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbeaf7")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_ejes)
    story.append(Spacer(1, 8))

    # 2. Resumen de los 8 Pilares
    story.append(Paragraph("2. Los 8 Pilares Tecnológicos Implementados", h1_style))
    pilares_p = [
        "<b>1. Audio Dual Inteligente:</b> Modo HD (128 kbps) para Wi-Fi y Modo ECO (64 kbps) que no gasta datos y funciona con señal 3G/4G débil en caminos rurales o botes.",
        "<b>2. Cadena de Emergencia en 1 Clic:</b> Barra roja fija en toda la web con sirena. Plantillas precargadas: Marejadas, Cortes en Ruta P-72S y Cortes Eléctricos.",
        "<b>3. Boletín Marítimo Satelital:</b> Georreferenciado en Caleta Quidico (-38.243°, -73.492°). Oleaje, viento en nudos, temperatura y semáforo de puerto de Capitanía.",
        "<b>4. Quidico TV (1080p):</b> Módulo para transmisión de video en vivo (festivales, concejos, cabina) con chat interactivo para los oyentes.",
        "<b>5. Programación Oficial & Afiches:</b> 'Las Noticias en Puerto Quidico' (Matinal y Mediodía), 'Surcando el Lafken' (Luis Sandoval Antilao) y 'DJ Dino' (Domingos 91.3 FM).",
        "<b>6. Monetización con Don Nica:</b> Caso de éxito real activo. Contador de clics e impactos, con botón para emitir balance en WhatsApp o texto.",
        "<b>7. App PWA Autónoma:</b> El auditor instala la app de la radio en su teléfono desde el navegador en un clic, sin depender de descargas en tiendas.",
        "<b>8. Panel de Control del Dueño:</b> Protegido con PIN (1051), atajo 'Alt + A', enlace para despachos en terreno desde celulares (Larix) y probador de micrófono."
    ]
    for pil in pilares_p:
        story.append(Paragraph(f"• {pil}", bullet_style))

    story.append(Spacer(1, 8))

    # 3. Modelo Comercial y Tarifario
    story.append(Paragraph("3. Modelo Comercial: Proyección de Ingresos Mensuales", h1_style))
    story.append(Paragraph(
        "A diferencia de la radio analógica donde es difícil demostrar sintonía, la web genera <b>comprobantes auditables</b> "
        "con los clics reales recibidos. Esto permite comercializar la pauta radial combinada con presencia web:",
        body_style
    ))

    tarifas_data = [
        [
            Paragraph("Plan Comercial", table_header_style),
            Paragraph("Valor / Mes", table_header_style),
            Paragraph("Detalle de Beneficios Incluidos", table_header_style),
            Paragraph("Cupo", table_header_style),
            Paragraph("Ingreso Est.", table_header_style)
        ],
        [
            Paragraph("<b>Plan Bronce</b><br/>(Pyme Local)", table_cell_center),
            Paragraph("<b>$35.000</b>", table_cell_center),
            Paragraph("4 menciones radiales diarias + logo y WhatsApp oficial en la web + difusión en redes sociales.", table_cell_style),
            Paragraph("4 cupos", table_cell_center),
            Paragraph("$140.000", table_cell_center)
        ],
        [
            Paragraph("<b>Plan Plata</b><br/>(Auspicio Bloque)", table_cell_center),
            Paragraph("<b>$75.000</b>", table_cell_center),
            Paragraph("8 menciones en alta sintonía + auspicio de Noticias o Boletín Marítimo + banner web + reporte mensual de clics.", table_cell_style),
            Paragraph("3 cupos", table_cell_center),
            Paragraph("$225.000", table_cell_center)
        ],
        [
            Paragraph("<b>Plan Oro</b><br/>(Cobertura Total)", table_cell_center),
            Paragraph("<b>$130.000</b>", table_cell_center),
            Paragraph("Auspicio estelar rotativo + banner portada + mención especial domingo DJ Dino + presencia en Quidico TV.", table_cell_style),
            Paragraph("2 cupos", table_cell_center),
            Paragraph("$260.000", table_cell_center)
        ],
        [
            Paragraph("<b>TOTAL MENSUAL ESTIMADO</b>", table_cell_bold),
            Paragraph("<b>—</b>", table_cell_bold),
            Paragraph("<b>Meta sugerida: 9 clientes locales en Quidico, Tirúa, Cañete y alrededores.</b>", table_cell_style),
            Paragraph("<b>9 cupos</b>", table_cell_bold),
            Paragraph("<b>$625.000 / mes</b>", table_cell_bold)
        ]
    ]

    t_tarifas = Table(tarifas_data, colWidths=[90, 65, 230, 65, 80])
    t_tarifas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, LIGHT_BG]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_tarifas)

    story.append(Spacer(1, 8))

    # 4. Protocolo de Presentación en 5 Minutos
    story.append(Paragraph("4. Cómo Demostrar la Plataforma al Dueño en 5 Minutos", h1_style))
    demo_steps = [
        "<b>1. Audio Continuo:</b> Entrar a <i>http://localhost:5173/</i>, dar Play y navegar hacia abajo demostrando que la señal no se corta.",
        "<b>2. Mareas de Quidico:</b> Pulsar la píldora superior 'Puerto Abierto' y mostrar los datos satelitales en vivo de oleaje y viento.",
        "<b>3. Acceso Secreto:</b> Presionar 'Alt + A' o el candado 'Panel Emisora' en el encabezado e ingresar el PIN <b>1051</b>.",
        "<b>4. Efecto Alerta de Emergencia:</b> En la pestaña 'Cadena de Emergencia', activar la plantilla 'Marejadas Anormales' y cerrar el panel. Toda la web se teñirá de rojo con la baliza de emergencia. Desactivarla con 1 clic.",
        "<b>5. Reporte de Don Nica:</b> Ir a Auspiciadores y pulsar 'Descargar Balance TXT' para enseñarle el informe contable listo para entregar."
    ]
    for step in demo_steps:
        story.append(Paragraph(f"• {step}", bullet_style))

    story.append(Spacer(1, 8))

    # Cierre y Firma
    callout_final = [
        [
            Paragraph(
                "<b>CONCLUSIÓN:</b> La plataforma está 100% terminada, probada y operativa en el servidor local. "
                "Representa un salto de 10 años en tecnología para Radio Puerto Quidico, dándole una imagen profesional, "
                "capacidad de servicio a la comunidad de pescadores y una nueva línea de ingresos mensuales sustentable.",
                table_cell_style
            )
        ]
    ]
    t_fin = Table(callout_final, colWidths=[530])
    t_fin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BOX_BG),
        ('BOX', (0,0), (-1,-1), 1, NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_fin)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Resumen Ejecutivo en PDF guardado exitosamente en: {output_filename}")

if __name__ == '__main__':
    target_pdf = os.path.abspath('Resumen_Ejecutivo_Radio_Puerto_Quidico.pdf')
    build_pdf_summary(target_pdf)

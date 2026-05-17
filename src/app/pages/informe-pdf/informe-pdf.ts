import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-informe-pdf',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './informe-pdf.html',
  styleUrl: './informe-pdf.css'
})
export class InformePdfComponent implements OnInit {

  // Array donde guardamos todos los impactos cargados
  impactos: any[] = [];

  // Si no hay datos se activa este boolean
  sinDatos: boolean = false;

  // Datos de empresa para mostrar en el informe
  nombreEmpresa: string = 'Empresa';
  sectorEmpresa: string = '';
  fechaHoy: string = '';

  // Totales acumulados
  totalEnergia:  number = 0;
  totalAgua:     number = 0;
  totalCo2:      number = 0;
  totalResiduos: number = 0;

  // Badge CSS + texto visual
  badgeEnergia = '';  textoEnergia = '';
  badgeAgua    = '';  textoAgua    = '';
  badgeCo2     = '';  textoCo2     = '';
  badgeResiduos= '';  textoResiduos= '';

  // Resultado global del informe
  indicePorcentaje: number = 0;
  nivelGeneral:       string = '';
  mensajeGeneral:     string = '';
  descripcionGeneral: string = '';

  // Instancia del gráfico
  grafico: any;

  // Inyectamos AuthService para sacar usuario y storageKey
  constructor(private auth: AuthService) {}

  ngOnInit() {

    // Sacamos fecha actual formateada
    const hoy = new Date();

    this.fechaHoy = hoy.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Obtenemos usuario logeado
    const u = this.auth.getUser();

    // Si existe usuario cargamos datos empresa
    if (u) {
      this.nombreEmpresa = u.nombre || 'Empresa';
      this.sectorEmpresa = u.sector || '';
    }

    // Clave específica del sessionStorage
    const storageKey = this.auth.getStorageKey();

    // Leemos impactos guardados
    const data = sessionStorage.getItem(storageKey);

    if (data) {

      // Convertimos JSON a array
      try {
        this.impactos = JSON.parse(data);

        // Si falla el parseo evitamos error
      } catch (_) {
        this.impactos = [];
      }
    }

    // Si no hay registros mostramos mensaje
    if (!this.impactos.length) {
      this.sinDatos = true;
      return;
    }

    // Calculamos métricas generales
    this.calcularTotales();

    // Calculamos índice global
    this.calcularIndice();

    // Esperamos un poco para crear gráfico
    setTimeout(() => this.crearGrafico(), 200);
  }

  calcularTotales() {

    // Sumamos energía total
    this.totalEnergia = this.impactos.reduce(
      (s, i) => s + (i.energia || 0),
      0
    );

    // Sumamos agua total
    this.totalAgua = this.impactos.reduce(
      (s, i) => s + (i.agua || 0),
      0
    );

    // Sumamos CO2 total
    this.totalCo2 = this.impactos.reduce(
      (s, i) => s + (i.co2 || 0),
      0
    );

    // Sumamos residuos totales
    this.totalResiduos = this.impactos.reduce(
      (s, i) => s + (i.residuos || 0),
      0
    );

    // Número de registros
    const n = this.impactos.length;

    // Calculamos color de badge según referencia
    this.badgeEnergia  = this.calcBadge(this.totalEnergia, 1200 * n);
    this.badgeAgua     = this.calcBadge(this.totalAgua, 5000 * n);
    this.badgeCo2      = this.calcBadge(this.totalCo2, 500 * n);
    this.badgeResiduos = this.calcBadge(this.totalResiduos, 300 * n);

    // Convertimos badge en texto visual
    this.textoEnergia  = this.textoEstado(this.badgeEnergia);
    this.textoAgua     = this.textoEstado(this.badgeAgua);
    this.textoCo2      = this.textoEstado(this.badgeCo2);
    this.textoResiduos = this.textoEstado(this.badgeResiduos);
  }

  calcBadge(valor: number, ref: number): string {

    // Verde = consumo bajo
    if (valor <= ref * 0.8) return 'badge-verde';

    // Amarillo = dentro del límite
    if (valor <= ref) return 'badge-amarillo';

    // Rojo = supera referencia
    return 'badge-rojo';
  }

  textoEstado(badge: string): string {

    // Pasamos clase CSS a texto legible
    if (badge === 'badge-verde') {
      return '✅ Eficiente';
    }

    if (badge === 'badge-amarillo') {
      return '⚠️ Mejorable';
    }

    return '🔴 Alto';
  }

  calcularIndice() {

    // Metemos todos los badges en array
    const badges = [
      this.badgeEnergia,
      this.badgeAgua,
      this.badgeCo2,
      this.badgeResiduos
    ];

    // Sumamos puntos según color
    const puntos = badges.reduce((s, b) => {

      // Verde puntúa máximo
      if (b === 'badge-verde') {
        return s + 100;
      }

      // Amarillo puntúa medio
      if (b === 'badge-amarillo') {
        return s + 50;
      }

      // Rojo puntúa bajo
      return s + 10;

    }, 0);

    // Sacamos media final
    this.indicePorcentaje = Math.round(puntos / 4);

    // Definimos estado general según puntuación
    if (this.indicePorcentaje >= 80) {

      this.nivelGeneral = 'verde';

      this.mensajeGeneral = '🟢 Producción eficiente';

      this.descripcionGeneral =
        'Tu empresa está produciendo por debajo de los niveles de referencia del sector.';

    } else if (this.indicePorcentaje >= 40) {

      this.nivelGeneral = 'amarillo';

      this.mensajeGeneral = '🟡 Hay margen de mejora';

      this.descripcionGeneral =
        'Algunos indicadores están por encima de los valores recomendados.';

    } else {

      this.nivelGeneral = 'rojo';

      this.mensajeGeneral =
        '🔴 Eficiencia por debajo del estándar';

      this.descripcionGeneral =
        'Se recomienda implementar medidas correctoras.';
    }
  }

  crearGrafico() {

    // Si ya existe gráfico lo destruimos
    if (this.grafico) {
      this.grafico.destroy();
    }

    // Creamos etiquetas dinámicas
    const etiquetas = this.impactos.map(
      (_, i) => `Registro ${i + 1}`
    );

    // Creamos gráfico de barras
    this.grafico = new Chart('graficoInforme', {

      type: 'bar',

      data: {

        labels: etiquetas,

        datasets: [

          // Dataset energía
          {
            label: 'Energía (kWh)',
            data: this.impactos.map(i => i.energia),
            backgroundColor: 'rgba(245,158,11,0.8)'
          },

          // Dataset agua
          {
            label: 'Agua (L)',
            data: this.impactos.map(i => i.agua),
            backgroundColor: 'rgba(59,130,246,0.8)'
          },

          // Dataset CO2
          {
            label: 'CO₂ (kg)',
            data: this.impactos.map(i => i.co2),
            backgroundColor: 'rgba(107,114,128,0.8)'
          },

          // Dataset residuos
          {
            label: 'Residuos (kg)',
            data: this.impactos.map(i => i.residuos),
            backgroundColor: 'rgba(16,185,129,0.8)'
          }
        ]
      },

      options: {

        // Responsive automático
        responsive: true,

        plugins: {

          // Leyenda abajo
          legend: {
            position: 'bottom'
          }
        },

        scales: {

          // El eje Y empieza en 0
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  async generarPDF() {

    // Div que queremos convertir a PDF
    const elemento = document.getElementById('contenido-pdf');

    // Si no existe paramos
    if (!elemento) return;

    // Convertimos HTML a canvas
    const canvas = await html2canvas(elemento, {

      // Más calidad
      scale: 2,

      // Permite imágenes externas
      useCORS: true,

      // Fondo blanco
      backgroundColor: '#ffffff',

      // Tamaño usado para render
      windowWidth: 900,

      // Evita problemas de scroll
      scrollY: 0
    });

    // Convertimos canvas en imagen
    const imgData = canvas.toDataURL('image/png');

    // Creamos PDF A4 vertical
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Tamaño de página
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Márgenes
    const margin = 10;

    // Ancho útil del contenido
    const contentW = pageW - margin * 2;

    // Tamaño real del canvas
    const imgPxW = canvas.width;
    const imgPxH = canvas.height;

    // Relación píxeles -> mm
    const ratio = contentW / imgPxW;

    // Altura total escalada
    const totalContentH = imgPxH * ratio;

    // Espacio disponible por página
    const pageContentH = pageH - margin * 2;

    let offsetY = 0;
    let page = 0;

    // Divide automáticamente el contenido en páginas
    while (offsetY < totalContentH) {

      // Añadimos nueva página si hace falta
      if (page > 0) {
        pdf.addPage();
      }

      // Altura visible en esta página
      const sliceH = Math.min(
        pageContentH,
        totalContentH - offsetY
      );

      // Zona exacta del canvas original
      const srcY = (offsetY / ratio);
      const srcH = sliceH / ratio;

      // Canvas temporal para la página actual
      const pageCanvas = document.createElement('canvas');

      pageCanvas.width = imgPxW;
      pageCanvas.height = Math.ceil(srcH);

      const ctx = pageCanvas.getContext('2d')!;

      // Dibujamos solo el fragmento necesario
      ctx.drawImage(
        canvas,
        0,
        srcY,
        imgPxW,
        srcH,
        0,
        0,
        imgPxW,
        Math.ceil(srcH)
      );

      // Convertimos fragmento en imagen
      const pageImgData = pageCanvas.toDataURL('image/png');

      // Lo añadimos al PDF
      pdf.addImage(
        pageImgData,
        'PNG',
        margin,
        margin,
        contentW,
        sliceH
      );

      // Pasamos a la siguiente parte
      offsetY += pageContentH;
      page++;
    }

    // Guardamos PDF con nombre dinámico
    // replace sustituye espacios por guiones
    pdf.save(
      `informe-${this.nombreEmpresa
        .toLowerCase()
        .replace(/\s/g, '-')}.pdf`
    );
  }
}

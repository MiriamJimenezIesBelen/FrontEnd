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

  impactos: any[] = [];
  sinDatos: boolean = false;

  nombreEmpresa: string = 'Empresa';
  sectorEmpresa: string = '';
  fechaHoy: string = '';

  totalEnergia:  number = 0;
  totalAgua:     number = 0;
  totalCo2:      number = 0;
  totalResiduos: number = 0;

  badgeEnergia = '';  textoEnergia = '';
  badgeAgua    = '';  textoAgua    = '';
  badgeCo2     = '';  textoCo2     = '';
  badgeResiduos= '';  textoResiduos= '';

  indicePorcentaje: number = 0;
  nivelGeneral:       string = '';
  mensajeGeneral:     string = '';
  descripcionGeneral: string = '';

  grafico: any;

  // CORREGIDO: inyectar AuthService para obtener la clave correcta
  constructor(private auth: AuthService) {}

  ngOnInit() {
    const hoy = new Date();
    this.fechaHoy = hoy.toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    // Usuario
    const u = this.auth.getUser();
    if (u) {
      this.nombreEmpresa = u.nombre || 'Empresa';
      this.sectorEmpresa = u.sector || '';
    }

    // CORREGIDO: leer la clave correcta por empresa en lugar de la fija 'impactos'
    const storageKey = this.auth.getStorageKey();
    const data = sessionStorage.getItem(storageKey);

    if (data) {
      try {
        this.impactos = JSON.parse(data);
      } catch (_) {
        this.impactos = [];
      }
    }

    if (!this.impactos.length) {
      this.sinDatos = true;
      return;
    }

    this.calcularTotales();
    this.calcularIndice();

    setTimeout(() => this.crearGrafico(), 200);
  }

  calcularTotales() {
    this.totalEnergia  = this.impactos.reduce((s, i) => s + (i.energia  || 0), 0);
    this.totalAgua     = this.impactos.reduce((s, i) => s + (i.agua     || 0), 0);
    this.totalCo2      = this.impactos.reduce((s, i) => s + (i.co2      || 0), 0);
    this.totalResiduos = this.impactos.reduce((s, i) => s + (i.residuos || 0), 0);

    const n = this.impactos.length;
    this.badgeEnergia  = this.calcBadge(this.totalEnergia,  1200 * n);
    this.badgeAgua     = this.calcBadge(this.totalAgua,     5000 * n);
    this.badgeCo2      = this.calcBadge(this.totalCo2,       500 * n);
    this.badgeResiduos = this.calcBadge(this.totalResiduos,  300 * n);

    this.textoEnergia  = this.textoEstado(this.badgeEnergia);
    this.textoAgua     = this.textoEstado(this.badgeAgua);
    this.textoCo2      = this.textoEstado(this.badgeCo2);
    this.textoResiduos = this.textoEstado(this.badgeResiduos);
  }

  calcBadge(valor: number, ref: number): string {
    if (valor <= ref * 0.8) return 'badge-verde';
    if (valor <= ref)       return 'badge-amarillo';
    return 'badge-rojo';
  }

  textoEstado(badge: string): string {
    if (badge === 'badge-verde')    return '✅ Eficiente';
    if (badge === 'badge-amarillo') return '⚠️ Mejorable';
    return '🔴 Alto';
  }

  calcularIndice() {
    const badges = [this.badgeEnergia, this.badgeAgua, this.badgeCo2, this.badgeResiduos];
    const puntos = badges.reduce((s, b) => {
      if (b === 'badge-verde')    return s + 100;
      if (b === 'badge-amarillo') return s + 50;
      return s + 10;
    }, 0);
    this.indicePorcentaje = Math.round(puntos / 4);

    if (this.indicePorcentaje >= 80) {
      this.nivelGeneral       = 'verde';
      this.mensajeGeneral     = '🟢 Producción eficiente';
      this.descripcionGeneral = 'Tu empresa está produciendo por debajo de los niveles de referencia del sector. Mantén estas buenas prácticas y sigue registrando datos para detectar cualquier desviación.';
    } else if (this.indicePorcentaje >= 40) {
      this.nivelGeneral       = 'amarillo';
      this.mensajeGeneral     = '🟡 Hay margen de mejora';
      this.descripcionGeneral = 'Algunos indicadores están por encima de los valores recomendados. Revisa las áreas marcadas y considera implementar un plan de acción sostenible.';
    } else {
      this.nivelGeneral       = 'rojo';
      this.mensajeGeneral     = '🔴 Eficiencia por debajo del estándar';
      this.descripcionGeneral = 'Varios indicadores superan los valores de referencia del sector. Se recomienda implementar medidas correctoras a corto plazo.';
    }
  }

  crearGrafico() {
    if (this.grafico) this.grafico.destroy();

    const etiquetas = this.impactos.map((_, i) => `Registro ${i + 1}`);

    this.grafico = new Chart('graficoInforme', {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [
          { label: 'Energía (kWh)', data: this.impactos.map(i => i.energia),  backgroundColor: 'rgba(245,158,11,0.8)' },
          { label: 'Agua (L)',      data: this.impactos.map(i => i.agua),     backgroundColor: 'rgba(59,130,246,0.8)' },
          { label: 'CO₂ (kg)',      data: this.impactos.map(i => i.co2),      backgroundColor: 'rgba(107,114,128,0.8)' },
          { label: 'Residuos (kg)', data: this.impactos.map(i => i.residuos), backgroundColor: 'rgba(16,185,129,0.8)' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  async generarPDF() {
    const elemento = document.getElementById('contenido-pdf');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 900,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageW = pdf.internal.pageSize.getWidth();   // 210mm
    const pageH = pdf.internal.pageSize.getHeight();  // 297mm
    const margin = 10;
    const contentW = pageW - margin * 2;

    const imgPxW = canvas.width;
    const imgPxH = canvas.height;

    // Relación mm/px
    const ratio = contentW / imgPxW;
    const totalContentH = imgPxH * ratio;

    const pageContentH = pageH - margin * 2;
    let offsetY = 0;
    let page = 0;

    while (offsetY < totalContentH) {
      if (page > 0) pdf.addPage();

      // Altura restante en esta página
      const sliceH = Math.min(pageContentH, totalContentH - offsetY);

      // Posición Y en píxeles dentro del canvas original
      const srcY = (offsetY / ratio);
      const srcH = sliceH / ratio;

      // Crear canvas parcial
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgPxW;
      pageCanvas.height = Math.ceil(srcH);
      const ctx = pageCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, srcY, imgPxW, srcH, 0, 0, imgPxW, Math.ceil(srcH));

      const pageImgData = pageCanvas.toDataURL('image/png');
      pdf.addImage(pageImgData, 'PNG', margin, margin, contentW, sliceH);

      offsetY += pageContentH;
      page++;
    }

    pdf.save(`informe-${this.nombreEmpresa.toLowerCase().replace(/\s/g, '-')}.pdf`);
  }
}

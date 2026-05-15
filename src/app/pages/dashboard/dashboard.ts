import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

import { EmpresaService } from '../../services/empresa';
import { GamificacionService } from '../../services/gamificacion.service';
import { InsightsService } from '../../services/insights.service';
import { RankingService } from '../../services/ranking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  private storageKey = 'impactos';
  private idEmpresa: number | null = null;

  impactos: any[] = [];

  sinDatos = true;
  cargando = false;

  nombreEmpresa = 'Empresa';
  sectorEmpresa = '';
  fechaHoy = '';
  saludo = 'Buenos días';

  mostrarModal = false;
  indiceAEliminar: number | null = null;

  totalEnergia = 0;
  totalAgua = 0;
  totalCo2 = 0;
  totalResiduos = 0;

  badgeEnergia = '';
  badgeAgua = '';
  badgeCo2 = '';
  badgeResiduos = '';

  textoEnergia = '';
  textoAgua = '';
  textoCo2 = '';
  textoResiduos = '';

  barEnergia = 0;
  barAgua = 0;
  barCo2 = 0;
  barResiduos = 0;

  trendEnergia = { texto: '', clase: 'trend-neutro' };
  trendAgua    = { texto: '', clase: 'trend-neutro' };
  trendCo2     = { texto: '', clase: 'trend-neutro' };
  trendResiduos= { texto: '', clase: 'trend-neutro' };

  indicePorcentaje = 0;
  indiceClase = '';
  indiceMensaje = '';

  promedioEnergia = 0;
  promedioAgua = 0;
  promedioCo2 = 0;

  reduccionEnergia = 0;
  reduccionCo2 = 0;

  puntos = 0;
  medallas: string[] = [];
  nivel = '';
  nivelIcono = '🥉';
  progresoNivel = 0;
  puntosNivelActual = 0;
  puntosNivelSiguiente = 300;

  insights: string[] = [];

  @ViewChild('graficoLineas', { static: false })
  graficoLineasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('graficoDona', { static: false })
  graficoDonaRef!: ElementRef<HTMLCanvasElement>;

  graficoLineas?: Chart;
  graficoDona?: Chart;

  constructor(
    private empresaService: EmpresaService,
    private gamificacionService: GamificacionService,
    private insightsService: InsightsService,
    private rankingService: RankingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    const hora = new Date().getHours();
    if (hora < 13) {
      this.saludo = 'Buenos días';
    } else if (hora < 20) {
      this.saludo = 'Buenas tardes';
    } else {
      this.saludo = 'Buenas noches';
    }

    this.fechaHoy = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const u = JSON.parse(usuarioData);
      this.nombreEmpresa = u.nombre || 'Empresa';
      this.sectorEmpresa = u.sector || '';
      this.idEmpresa = u.idEmpresa ?? null;
      this.storageKey = `impactos_empresa_${u.idEmpresa ?? u.nombre}`;
    }

    // CARGAR CACHE
    const cached = sessionStorage.getItem(this.storageKey);
    if (cached) {
      this.impactos = JSON.parse(cached);
      if (this.impactos.length > 0) {
        this.sinDatos = false;
        this.recalcularTodo();
      }
    }

    // CARGAR BACKEND
    if (this.idEmpresa) {
      if (!cached || this.impactos.length === 0) {
        this.cargando = true;
      }

      this.empresaService.getMediciones(this.idEmpresa).subscribe({
        next: (data) => {
          this.cargando = false;

          if (data && data.length > 0) {

            // IMPORTANTE: guardamos la fecha para poder borrar en BD
            this.impactos = data.map((m: any) => ({
              fecha:    m.fecha,
              energia:  parseFloat(m.energia)  || 0,
              agua:     parseFloat(m.agua)     || 0,
              co2:      parseFloat(m.co2)      || 0,
              residuos: parseFloat(m.residuos) || 0
            }));

            sessionStorage.setItem(this.storageKey, JSON.stringify(this.impactos));
            this.sinDatos = false;
            this.recalcularTodo();
            this.refrescarGraficos();

          } else {
            if (this.impactos.length === 0) {
              this.sinDatos = true;
            }
          }
        },
        error: () => {
          this.cargando = false;
        }
      });
    }
  }

  ngAfterViewInit() {
    if (this.impactos.length > 0) {
      this.refrescarGraficos();
    }
  }

  private refrescarGraficos() {
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      this.crearGraficoLineas();
      this.crearGraficoDona();
    });
  }

  private recalcularTodo() {
    this.calcularKPIs();
    this.calcularTrends();
    this.calcularEstadisticas();
    this.calcularIndice();
    this.calcularGamificacion();
    this.insights = this.insightsService.generar(this.impactos);
    this.compararUltimos();
    if (this.totalEnergia > 5000) this.insights.push('⚠️ Consumo energético elevado en total');
    if (this.totalAgua > 20000)   this.insights.push('💧 Alto consumo de agua detectado');
  }

  calcularKPIs() {
    const n = this.impactos.length;

    this.totalEnergia  = this.impactos.reduce((s, i) => s + (i.energia  || 0), 0);
    this.totalAgua     = this.impactos.reduce((s, i) => s + (i.agua     || 0), 0);
    this.totalCo2      = this.impactos.reduce((s, i) => s + (i.co2      || 0), 0);
    this.totalResiduos = this.impactos.reduce((s, i) => s + (i.residuos || 0), 0);

    const refE = 1200 * n;
    const refA = 5000 * n;
    const refC = 500  * n;
    const refR = 300  * n;

    this.badgeEnergia  = this.calcBadge(this.totalEnergia,  refE);
    this.badgeAgua     = this.calcBadge(this.totalAgua,     refA);
    this.badgeCo2      = this.calcBadge(this.totalCo2,      refC);
    this.badgeResiduos = this.calcBadge(this.totalResiduos, refR);

    this.textoEnergia  = this.textoEstado(this.badgeEnergia);
    this.textoAgua     = this.textoEstado(this.badgeAgua);
    this.textoCo2      = this.textoEstado(this.badgeCo2);
    this.textoResiduos = this.textoEstado(this.badgeResiduos);

    this.barEnergia  = Math.min(100, Math.max(0, Math.round((this.totalEnergia  / refE) * 100)));
    this.barAgua     = Math.min(100, Math.max(0, Math.round((this.totalAgua     / refA) * 100)));
    this.barCo2      = Math.min(100, Math.max(0, Math.round((this.totalCo2      / refC) * 100)));
    this.barResiduos = Math.min(100, Math.max(0, Math.round((this.totalResiduos / refR) * 100)));
  }

  calcularTrends() {
    if (this.impactos.length < 2) return;
    const last = this.impactos.at(-1)!;
    const prev = this.impactos.at(-2)!;
    this.trendEnergia  = this.trend(last.energia,  prev.energia,  true);
    this.trendAgua     = this.trend(last.agua,     prev.agua,     true);
    this.trendCo2      = this.trend(last.co2,      prev.co2,      true);
    this.trendResiduos = this.trend(last.residuos, prev.residuos, true);
  }

  trend(actual: number, anterior: number, lowerIsBetter: boolean) {
    if (!anterior || anterior === 0) return { texto: 'Sin comparativa', clase: 'trend-neutro' };
    const diff = actual - anterior;
    const pct  = Math.min(100, Math.max(-100, Math.round((diff / anterior) * 100)));
    if (pct === 0) return { texto: 'Sin cambio vs anterior', clase: 'trend-neutro' };
    const baja  = pct < 0;
    const bueno = lowerIsBetter ? baja : !baja;
    return {
      texto: `${baja ? '↓' : '↑'} ${Math.abs(pct)}% vs anterior`,
      clase: bueno ? 'trend-verde' : 'trend-rojo'
    };
  }

  calcularEstadisticas() {
    const n = this.impactos.length;
    this.promedioEnergia = this.totalEnergia / n;
    this.promedioAgua    = this.totalAgua    / n;
    this.promedioCo2     = this.totalCo2     / n;

    if (n >= 2) {
      const e0 = this.impactos[0].energia || 1;
      this.reduccionEnergia = Math.min(100, Math.max(-100,
        Math.round(((this.impactos.at(-1)!.energia - e0) / e0) * 100)
      ));
      const c0 = this.impactos[0].co2 || 1;
      this.reduccionCo2 = Math.min(100, Math.max(-100,
        Math.round(((this.impactos.at(-1)!.co2 - c0) / c0) * 100)
      ));
    }
  }

  calcularIndice() {
    const badges = [this.badgeEnergia, this.badgeAgua, this.badgeCo2, this.badgeResiduos];
    const pts = badges.reduce((s, b) => s + (b === 'badge-verde' ? 100 : b === 'badge-amarillo' ? 50 : 10), 0);
    this.indicePorcentaje = Math.min(100, Math.max(0, Math.round(pts / 4)));

    if (this.indicePorcentaje >= 80) {
      this.indiceClase   = 'indice-verde';
      this.indiceMensaje = '🟢 Muy bien, sigue así';
    } else if (this.indicePorcentaje >= 40) {
      this.indiceClase   = 'indice-amarillo';
      this.indiceMensaje = '🟡 Puedes mejorar en algún área';
    } else {
      this.indiceClase   = 'indice-rojo';
      this.indiceMensaje = '🔴 Necesitas reducir tus consumos';
    }
  }

  calcularGamificacion() {
    this.puntos   = this.gamificacionService.calcularPuntos(this.impactos);
    this.medallas = this.gamificacionService.obtenerMedallas(this.puntos, this.impactos);
    this.nivel    = this.gamificacionService.calcularNivel(this.puntos);
    this.rankingService.guardarPuntuacion(this.nombreEmpresa, this.puntos);

    if (this.nivel === 'Oro') {
      this.nivelIcono          = '🥇';
      this.puntosNivelActual   = 600;
      this.puntosNivelSiguiente= 600;
      this.progresoNivel       = 100;
    } else if (this.nivel === 'Plata') {
      this.nivelIcono          = '🥈';
      this.puntosNivelActual   = 300;
      this.puntosNivelSiguiente= 600;
      this.progresoNivel       = Math.min(100, Math.max(0, Math.round(((this.puntos - 300) / 300) * 100)));
    } else {
      this.nivelIcono          = '🥉';
      this.puntosNivelActual   = 0;
      this.puntosNivelSiguiente= 300;
      this.progresoNivel       = Math.min(100, Math.max(0, Math.round((this.puntos / 300) * 100)));
    }
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

  compararUltimos() {
    if (this.impactos.length < 2) return;
    const u = this.impactos.at(-1)!;
    const a = this.impactos.at(-2)!;
    this.insights.push(
      u.energia > a.energia
        ? '⚡ El consumo energético ha aumentado respecto al registro anterior'
        : '✅ El consumo energético ha bajado respecto al registro anterior'
    );
  }

  pedirConfirmacion(index: number) {
    this.indiceAEliminar = index;
    this.mostrarModal = true;
  }

  cancelarEliminar() {
    this.mostrarModal = false;
    this.indiceAEliminar = null;
  }

  confirmarEliminar() {
    if (this.indiceAEliminar === null) return;

    const impacto = this.impactos[this.indiceAEliminar];

    // BORRAR EN BD si hay fecha e idEmpresa
    if (this.idEmpresa && impacto.fecha) {
      this.empresaService.eliminarMedicionPorFecha(
        this.idEmpresa,
        impacto.fecha
      ).subscribe({
        next: () => console.log('Borrado en BD correctamente'),
        error: (e: any) => console.error('Error al borrar en BD', e)
      });
    }

    // BORRAR EN LOCAL siempre
    this.impactos.splice(this.indiceAEliminar, 1);
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.impactos));

    this.mostrarModal = false;
    this.indiceAEliminar = null;

    if (this.impactos.length === 0) {
      this.sinDatos = true;
      this.graficoLineas?.destroy();
      this.graficoLineas = undefined;
      this.graficoDona?.destroy();
      this.graficoDona = undefined;
    } else {
      this.recalcularTodo();
      this.refrescarGraficos();
    }
  }

  eliminarImpacto(index: number) {
    this.pedirConfirmacion(index);
  }

  crearGraficoLineas() {
    if (!this.graficoLineasRef?.nativeElement) return;
    this.graficoLineas?.destroy();
    this.graficoLineas = new Chart(this.graficoLineasRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.impactos.map((_, i) => `Reg. ${i + 1}`),
        datasets: [
          {
            label: 'Energía (kWh)',
            data: this.impactos.map(i => i.energia),
            tension: 0.4,
            fill: true,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.1)'
          },
          {
            label: 'Agua (L)',
            data: this.impactos.map(i => i.agua),
            tension: 0.4,
            fill: true,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  crearGraficoDona() {
    if (!this.graficoDonaRef?.nativeElement) return;
    this.graficoDona?.destroy();
    this.graficoDona = new Chart(this.graficoDonaRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Energía', 'Agua', 'CO₂', 'Residuos'],
        datasets: [{
          data: [this.totalEnergia, this.totalAgua, this.totalCo2, this.totalResiduos],
          backgroundColor: ['#f59e0b', '#3b82f6', '#6b7280', '#10b981'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  exportarCSV() {
    let csv = 'energia,agua,co2,residuos\n';
    this.impactos.forEach(i => {
      csv += `${i.energia},${i.agua},${i.co2},${i.residuos}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `impactos_${this.nombreEmpresa}.csv`;
    a.click();
  }
}

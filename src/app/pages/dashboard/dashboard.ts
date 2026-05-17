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

  // Clave dinámica para sessionStorage, se personaliza por empresa en ngOnInit
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

  // Clase CSS del badge (badge-verde/amarillo/rojo) para cada KPI
  badgeEnergia = '';
  badgeAgua = '';
  badgeCo2 = '';
  badgeResiduos = '';

  textoEnergia = '';
  textoAgua = '';
  textoCo2 = '';
  textoResiduos = '';

  // Porcentaje (0-100) para la barra de progreso de cada KPI
  barEnergia = 0;
  barAgua = 0;
  barCo2 = 0;
  barResiduos = 0;

  // Comparativa con el registro anterior (texto + clase CSS de color)
  trendEnergia  = { texto: '', clase: 'trend-neutro' };
  trendAgua     = { texto: '', clase: 'trend-neutro' };
  trendCo2      = { texto: '', clase: 'trend-neutro' };
  trendResiduos = { texto: '', clase: 'trend-neutro' };

  indicePorcentaje = 0;
  indiceClase = '';
  indiceMensaje = '';

  promedioEnergia = 0;
  promedioAgua = 0;
  promedioCo2 = 0;

  // Variación % entre el primer y último registro
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

  // Referencias a los canvas de los gráficos para poder crearlos/destruirlos
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
    // Saludo según la hora del día
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

    // Leemos los datos del usuario logueado y construimos la clave de sessionStorage
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const u = JSON.parse(usuarioData);
      this.nombreEmpresa = u.nombre || 'Empresa';
      this.sectorEmpresa = u.sector || '';
      this.idEmpresa     = u.idEmpresa ?? null;
      this.storageKey    = `impactos_empresa_${u.idEmpresa ?? u.nombre}`;
    }

    // Cargamos primero desde caché para mostrar datos inmediatamente sin esperar al backend
    const cached = sessionStorage.getItem(this.storageKey);
    if (cached) {
      this.impactos = JSON.parse(cached);
      if (this.impactos.length > 0) {
        this.sinDatos = false;
        this.recalcularTodo();
      }
    }

    if (this.idEmpresa) {
      // Solo mostramos spinner si no había caché previa
      if (!cached || this.impactos.length === 0) {
        this.cargando = true;
      }

      this.empresaService.getMediciones(this.idEmpresa).subscribe({
        next: (data) => {
          this.cargando = false;

          if (data && data.length > 0) {
            // Normalizamos los datos del backend al mismo formato que usamos internamente
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
            this.sinDatos = true;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.cargando = false;
          this.sinDatos = true;
          this.cdr.detectChanges();
        }
      });

    } else {
      // Sin idEmpresa no podemos pedir datos al backend, mostramos estado vacío
      this.cargando = false;
      this.sinDatos = true;
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit() {
    // Si ya había datos en caché, creamos los gráficos una vez el HTML esté listo
    if (this.impactos.length > 0) {
      this.refrescarGraficos();
    }
  }

  // Fuerza la detección de cambios y espera al siguiente frame para crear los gráficos
  // así garantizamos que el canvas ya está en el DOM cuando Chart.js intenta accederlo
  private refrescarGraficos() {
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      this.crearGraficoLineas();
      this.crearGraficoDona();
    });
  }

  // Llama a todos los cálculos en orden; se ejecuta cada vez que cambian los datos
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

  // Calcula totales, promedios, badges y barras de progreso de los 4 indicadores
  // Los badges se basan en el promedio por registro, no en el total acumulado
  calcularKPIs() {
    const n = this.impactos.length;

    this.totalEnergia  = this.impactos.reduce((s, i) => s + (i.energia || 0), 0);
    this.totalAgua     = this.impactos.reduce((s, i) => s + (i.agua || 0), 0);
    this.totalCo2      = this.impactos.reduce((s, i) => s + (i.co2 || 0), 0);
    this.totalResiduos = this.impactos.reduce((s, i) => s + (i.residuos || 0), 0);

    if (n === 0) return;

    const avgE = this.totalEnergia / n;
    const avgA = this.totalAgua / n;
    const avgC = this.totalCo2 / n;
    const avgR = this.totalResiduos / n;

    this.badgeEnergia  = this.calcBadge(avgE, 1500);
    this.badgeAgua     = this.calcBadge(avgA, 6000);
    this.badgeCo2      = this.calcBadge(avgC, 700);
    this.badgeResiduos = this.calcBadge(avgR, 400);

    this.textoEnergia  = this.textoEstado(this.badgeEnergia);
    this.textoAgua     = this.textoEstado(this.badgeAgua);
    this.textoCo2      = this.textoEstado(this.badgeCo2);
    this.textoResiduos = this.textoEstado(this.badgeResiduos);

    // Math.min(100) para que la barra nunca supere el 100% visualmente
    this.barEnergia  = Math.min(100, Math.round((avgE / 1500) * 100));
    this.barAgua     = Math.min(100, Math.round((avgA / 6000) * 100));
    this.barCo2      = Math.min(100, Math.round((avgC / 700)  * 100));
    this.barResiduos = Math.min(100, Math.round((avgR / 400)  * 100));
  }

  // Compara el último registro con el anterior para mostrar la flecha de tendencia
  calcularTrends() {
    if (this.impactos.length < 2) return;
    const last = this.impactos.at(-1)!;
    const prev = this.impactos.at(-2)!;
    this.trendEnergia  = this.trend(last.energia,  prev.energia,  true);
    this.trendAgua     = this.trend(last.agua,     prev.agua,     true);
    this.trendCo2      = this.trend(last.co2,      prev.co2,      true);
    this.trendResiduos = this.trend(last.residuos, prev.residuos, true);
  }

  // Calcula el % de cambio entre dos valores y devuelve texto y clase CSS
  // lowerIsBetter=true significa que bajar es bueno (energía, CO₂, etc.)
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

  // Calcula promedios y la variación % entre el primer y último registro
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

  // Calcula el índice de sostenibilidad (0-100) sumando puntos por badge
  // verde=100, amarillo=50, rojo=10 → promedio de los 4 indicadores
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

  // Calcula puntos, medallas y nivel ESG, y actualiza el ranking local y del backend
  calcularGamificacion() {
    this.puntos   = this.gamificacionService.calcularPuntos(this.impactos);
    this.medallas = this.gamificacionService.obtenerMedallas(this.puntos, this.impactos);
    this.nivel    = this.gamificacionService.calcularNivel(this.puntos);

    this.guardarRanking();

    if (this.nivel === 'Oro') {
      this.nivelIcono          = '🥇';
      this.puntosNivelActual   = 600;
      this.puntosNivelSiguiente = 600;
      this.progresoNivel       = 100;

    } else if (this.nivel === 'Plata') {
      this.nivelIcono          = '🥈';
      this.puntosNivelActual   = 300;
      this.puntosNivelSiguiente = 600;
      this.progresoNivel = Math.min(100, Math.max(0, Math.round(((this.puntos - 300) / 300) * 100)));

    } else {
      this.nivelIcono          = '🥉';
      this.puntosNivelActual   = 0;
      this.puntosNivelSiguiente = 300;
      this.progresoNivel = Math.min(100, Math.max(0, Math.round((this.puntos / 300) * 100)));
    }
  }

  // Verde si está 20% bajo la referencia, amarillo si la cumple, rojo si la supera
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

  // Añade un insight comparando el último y penúltimo registro de energía
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
    this.mostrarModal    = true;
  }

  cancelarEliminar() {
    this.mostrarModal    = false;
    this.indiceAEliminar = null;
  }

  confirmarEliminar() {
    if (this.indiceAEliminar === null) return;

    const impacto = this.impactos[this.indiceAEliminar];

    // Borramos en BD si tenemos fecha e id (el borrado local ocurre siempre)
    if (this.idEmpresa && impacto.fecha) {
      this.empresaService.eliminarMedicionPorFecha(
        this.idEmpresa,
        impacto.fecha
      ).subscribe({
        next: () => console.log('Borrado en BD correctamente'),
        error: (e: any) => console.error('Error al borrar en BD', e)
      });
    }

    this.impactos.splice(this.indiceAEliminar, 1);
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.impactos));

    this.mostrarModal    = false;
    this.indiceAEliminar = null;

    if (this.impactos.length === 0) {
      // Si no quedan registros, destruimos los gráficos y mostramos estado vacío
      this.sinDatos = true;
      this.graficoLineas?.destroy();
      this.graficoLineas = undefined;
      this.graficoDona?.destroy();
      this.graficoDona  = undefined;
    } else {
      this.recalcularTodo();
      this.refrescarGraficos();
    }
  }

  // Alias público para abrir el modal de confirmación desde el HTML
  eliminarImpacto(index: number) {
    this.pedirConfirmacion(index);
  }

  // Crea el gráfico de líneas de energía y agua; si ya existía lo destruye primero
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
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // Crea el gráfico donut con la distribución de los 4 indicadores
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

  // Genera y descarga un CSV con los datos de impacto del historial
  exportarCSV() {
    let csv = 'energia,agua,co2,residuos\n';
    this.impactos.forEach(i => {
      csv += `${i.energia},${i.agua},${i.co2},${i.residuos}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = window.URL.createObjectURL(blob);
    a.download = `impactos_${this.nombreEmpresa}.csv`;
    a.click();
  }

  // Guarda la puntuación en localStorage (ranking local) y en el backend
  private guardarRanking() {
    if (!this.nombreEmpresa) return;
    this.rankingService.guardarPuntuacion(this.nombreEmpresa, this.puntos);
    this.rankingService.guardarPuntuacionBackend(this.nombreEmpresa, this.puntos)
      .subscribe({
        error: (e) => console.error('Error guardando ranking backend', e)
      });
  }
}

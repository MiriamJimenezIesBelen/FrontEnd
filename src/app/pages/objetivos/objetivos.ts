import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObjetivoESGService } from '../../services/objetivo-esg.service';

@Component({
  selector: 'app-objetivos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './objetivos.html',
  styleUrl: './objetivos.css'
})
export class ObjetivosComponent implements OnInit {

  // Hacemos Math accesible desde el HTML
  Math = Math;

  // Control de modales y estados
  mostrarForm  = false;
  guardando    = false;
  mostrarModal = false;

  // Objetivo seleccionado para eliminar
  objetivoAEliminar: any = null;

  // Modelo del formulario
  objetivo: any = this.nuevoObjetivo();

  // Lista de objetivos cargados
  objetivos: any[] = [];

  // Límites sostenibles máximos por categoría
  private limitesSostenibles: Record<string, number> = {
    CO2:      10000,
    ENERGIA:  50000,
    AGUA:     500000,
    RESIDUOS: 5000
  };

  // Factor multiplicador según período
  // Ejemplo:
  // mensual = límite anual dividido entre 12
  private factorPeriodo: Record<string, number> = {
    mensual:    1 / 12,
    trimestral: 1 / 4,
    semestral:  1 / 2,
    anual:      1
  };

  // Inyectamos servicio y ChangeDetector
  constructor(
    private service: ObjetivoESGService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // Al iniciar cargamos objetivos
    this.cargar();
  }

  private getIdEmpresa(): number | null {

    try {

      // Sacamos usuario del localStorage
      const u = JSON.parse(
        localStorage.getItem('usuario') || '{}'
      );

      // Devolvemos idEmpresa
      return u?.idEmpresa ?? null;

    } catch {

      // Si falla devolvemos null
      return null;
    }
  }

  nuevoObjetivo() {

    // Devuelve objeto vacío por defecto
    return {

      tipo: 'CO2',

      direccion: 'reducir',

      periodo: 'mensual',

      valorObjetivo: 0,

      valorActual: 0,

      fechaInicio: '',

      fechaFin: '',

      activo: true
    };
  }

  cargar() {

    // Sacamos ID empresa
    const id = this.getIdEmpresa();

    if (!id) return;

    // Pedimos objetivos al backend
    this.service.porEmpresa(id).subscribe({

      next: (data: any) => {

        // Añadimos valores por defecto si faltan
        this.objetivos = (data || []).map((o: any) => ({
          ...o,

          direccion: o.direccion || 'reducir',

          periodo: o.periodo || 'mensual'
        }));

        // Forzamos actualización visual
        this.cdr.detectChanges();
      },

      error: (err) =>
        console.error('Error cargando objetivos:', err)
    });
  }

  crear() {

    // Evita doble click mientras guarda
    if (this.guardando) return;

    // Obtenemos empresa
    const id = this.getIdEmpresa();

    if (!id) {
      alert('No se encontró el ID de empresa');
      return;
    }

    // Si intenta aumentar más del límite sostenible
    // cancelamos creación
    if (
      this.objetivo.direccion === 'aumentar' &&
      this.objetivo.valorObjetivo >
      this.getLimiteSostenible(this.objetivo)
    ) {
      return;
    }

    // Activamos estado guardando
    this.guardando = true;

    // Payload que se enviará al backend
    const payload = {

      ...this.objetivo,

      idEmpresa: id,

      // Si no hay fecha mandamos null
      fechaInicio: this.objetivo.fechaInicio || null,

      fechaFin: this.objetivo.fechaFin || null
    };

    // Guardamos objetivo
    this.service.crear(payload).subscribe({

      next: (res: any) => {

        // Añadimos objetivo nuevo arriba de la lista
        this.objetivos.unshift({

          ...res,

          direccion: res.direccion || 'reducir',

          periodo: res.periodo || 'mensual'
        });

        // Reiniciamos estados
        this.guardando = false;

        this.mostrarForm = false;

        this.objetivo = this.nuevoObjetivo();

        // Actualizamos vista
        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Error al guardar:', err);

        this.guardando = false;

        alert('Error al guardar objetivo');
      }
    });
  }

  pedirConfirmacion(obj: any) {

    // Guardamos objetivo seleccionado
    this.objetivoAEliminar = obj;

    // Abrimos modal
    this.mostrarModal = true;
  }

  cancelarEliminar() {

    // Cerramos modal
    this.mostrarModal = false;

    // Limpiamos objetivo seleccionado
    this.objetivoAEliminar = null;
  }

  confirmarEliminar() {

    // Si no existe ID cancelamos
    if (!this.objetivoAEliminar?.id) return;

    // Llamada para eliminar
    this.service
      .eliminar(this.objetivoAEliminar.id)
      .subscribe({

        next: () => {

          // Quitamos objetivo del array
          this.objetivos = this.objetivos.filter(
            o => o.id !== this.objetivoAEliminar.id
          );

          // Cerramos modal
          this.mostrarModal = false;

          this.objetivoAEliminar = null;

          // Refrescamos vista
          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error('Error eliminando:', err);

          alert('No se pudo eliminar el objetivo');
        }
      });
  }

  getLimiteSostenible(o: any): number {

    // Sacamos límite base según tipo
    const base = this.limitesSostenibles[o.tipo] || 10000;

    // Sacamos factor según período
    const factor = this.factorPeriodo[o.periodo] || 1;

    // Multiplicamos y redondeamos
    return Math.round(base * factor);
  }

  porcentajeDisplay(o: any): number {

    // Si no hay objetivo devolvemos 0
    if (!o.valorObjetivo || o.valorObjetivo === 0) {
      return 0;
    }

    // Caso objetivos de aumentar
    if (o.direccion === 'aumentar') {

      // Sacamos límite máximo sostenible
      const limite = this.getLimiteSostenible(o);

      // Evita superar el límite
      const objetivoReal = Math.min(
        o.valorObjetivo,
        limite
      );

      // Calcula porcentaje actual
      return Math.min(
        100,
        Math.round(
          (o.valorActual / objetivoReal) * 100
        )
      );
    }

    // Caso objetivos de reducir
    // Si ya está por debajo del objetivo = 100%
    if (o.valorActual <= o.valorObjetivo) {
      return 100;
    }

    // Creamos rango máximo para calcular progreso
    const maximo = o.valorObjetivo * 2;

    const avance = maximo - o.valorActual;

    const total = maximo - o.valorObjetivo;

    if (total <= 0) return 100;

    // Limitamos entre 0 y 100
    return Math.max(
      0,
      Math.min(
        100,
        Math.round((avance / total) * 100)
      )
    );
  }

  estadoClase(o: any): string {

    // Sacamos porcentaje visual
    const p = this.porcentajeDisplay(o);

    // Color según progreso
    if (p === 0) return 'gris';

    if (p >= 100) return 'verde';

    if (p >= 50) return 'amarillo';

    return 'rojo';
  }

  estadoTexto(o: any): string {

    // Texto visual según progreso
    const p = this.porcentajeDisplay(o);

    if (p === 0) return 'Sin iniciar';

    if (p >= 100) return '✓ Completado';

    if (p >= 75) return 'Casi listo';

    if (p >= 50) return 'En progreso';

    return 'Inicio';
  }

  explicacion(o: any): string {

    // Sacamos límite sostenible
    const limite = this.getLimiteSostenible(o);

    // Traducción del período
    const periodoLabel: Record<string, string> = {

      mensual: 'mes',

      trimestral: 'trimestre',

      semestral: 'semestre',

      anual: 'año'
    };

    const p = periodoLabel[o.periodo] || 'período';

    // Objetivos de reducción
    if (o.direccion === 'reducir') {

      // Si ya se cumplió el objetivo
      if (o.valorActual <= o.valorObjetivo)

        return `✅ ¡Bien! Tu consumo (${o.valorActual}) ya está por debajo del objetivo (${o.valorObjetivo} ${this.unidad(o.tipo)}).`;

      // Si aún falta por reducir
      return `Necesitas reducir ${o.valorActual - o.valorObjetivo} ${this.unidad(o.tipo)} más para alcanzar el objetivo.`;

    } else {

      // Si supera límite sostenible
      if (o.valorObjetivo > limite)

        return `⚠️ Tu objetivo (${o.valorObjetivo}) supera el límite sostenible por ${p} (${limite} ${this.unidad(o.tipo)}). Se usará ${limite} como tope.`;

      // Si ya alcanzó objetivo
      if (o.valorActual >= Math.min(o.valorObjetivo, limite))

        return `✅ ¡Objetivo alcanzado! Límite sostenible por ${p}: ${limite} ${this.unidad(o.tipo)}.`;

      // Si aún falta progreso
      const falta = o.valorObjetivo - o.valorActual;

      return `Te faltan ${falta} ${this.unidad(o.tipo)} para tu objetivo. Límite sostenible por ${p}: ${limite} ${this.unidad(o.tipo)}.`;
    }
  }

  // Devuelve emoji según tipo
  iconoTipo(t: string) {

    return ({
      CO2:'🌫️',
      ENERGIA:'⚡',
      AGUA:'💧',
      RESIDUOS:'🗑️'

    } as any)[t] || '📊';
  }

  // Devuelve texto bonito según tipo
  labelTipo(t: string) {

    return ({
      CO2:'Reducción de CO₂',
      ENERGIA:'Eficiencia energética',
      AGUA:'Consumo de agua',
      RESIDUOS:'Gestión de residuos'

    } as any)[t] || t;
  }

  // Devuelve unidad de medida
  unidad(t: string) {

    return ({
      CO2:'kg CO₂',
      ENERGIA:'kWh',
      AGUA:'litros',
      RESIDUOS:'kg'

    } as any)[t] || '';
  }

  // Traduce período a texto visual
  periodoLabel(t: string) {

    return ({
      mensual:'Mensual',
      trimestral:'Trimestral',
      semestral:'Semestral',
      anual:'Anual'

    } as any)[t] || t;
  }

  // Número de objetivos completados
  get completados() {

    return this.objetivos.filter(
      o => this.porcentajeDisplay(o) >= 100
    ).length;
  }

  // Objetivos en progreso
  get enProgreso() {

    return this.objetivos.filter(o => {

      const p = this.porcentajeDisplay(o);

      return p > 0 && p < 100;

    }).length;
  }

  // Objetivos sin empezar
  get sinIniciar() {

    return this.objetivos.filter(
      o => this.porcentajeDisplay(o) === 0
    ).length;
  }
}

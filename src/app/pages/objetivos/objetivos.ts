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

  Math = Math;
  mostrarForm  = false;
  guardando    = false;
  mostrarModal = false;
  objetivoAEliminar: any = null;
  objetivo: any = this.nuevoObjetivo();
  objetivos: any[] = [];

  private limitesSostenibles: Record<string, number> = {
    CO2:      10000,
    ENERGIA:  50000,
    AGUA:     500000,
    RESIDUOS: 5000
  };

  private factorPeriodo: Record<string, number> = {
    mensual:    1 / 12,
    trimestral: 1 / 4,
    semestral:  1 / 2,
    anual:      1
  };

  constructor(
    private service: ObjetivoESGService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  private getIdEmpresa(): number | null {
    try {
      const u = JSON.parse(localStorage.getItem('usuario') || '{}');
      return u?.idEmpresa ?? null;
    } catch { return null; }
  }

  nuevoObjetivo() {
    return {
      tipo:         'CO2',
      direccion:    'reducir',
      periodo:      'mensual',
      valorObjetivo: 0,
      valorActual:   0,
      fechaInicio:  '',
      fechaFin:     '',
      activo:       true
    };
  }

  cargar() {
    const id = this.getIdEmpresa();
    if (!id) return;

    this.service.porEmpresa(id).subscribe({
      next: (data: any) => {
        this.objetivos = (data || []).map((o: any) => ({
          ...o,
          direccion: o.direccion || 'reducir',
          periodo:   o.periodo   || 'mensual'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando objetivos:', err)
    });
  }

  crear() {
    if (this.guardando) return;
    const id = this.getIdEmpresa();
    if (!id) { alert('No se encontró el ID de empresa'); return; }

    if (this.objetivo.direccion === 'aumentar' &&
      this.objetivo.valorObjetivo > this.getLimiteSostenible(this.objetivo)) {
      return;
    }

    this.guardando = true;

    const payload = {
      ...this.objetivo,
      idEmpresa:   id,
      fechaInicio: this.objetivo.fechaInicio || null,
      fechaFin:    this.objetivo.fechaFin    || null
    };

    this.service.crear(payload).subscribe({
      next: (res: any) => {
        this.objetivos.unshift({
          ...res,
          direccion: res.direccion || 'reducir',
          periodo:   res.periodo   || 'mensual'
        });
        this.guardando   = false;
        this.mostrarForm = false;
        this.objetivo    = this.nuevoObjetivo();
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
    this.objetivoAEliminar = obj;
    this.mostrarModal = true;
  }

  cancelarEliminar() {
    this.mostrarModal = false;
    this.objetivoAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.objetivoAEliminar?.id) return;
    this.service.eliminar(this.objetivoAEliminar.id).subscribe({
      next: () => {
        this.objetivos = this.objetivos.filter(o => o.id !== this.objetivoAEliminar.id);
        this.mostrarModal = false;
        this.objetivoAEliminar = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error eliminando:', err);
        alert('No se pudo eliminar el objetivo');
      }
    });
  }

  getLimiteSostenible(o: any): number {
    const base   = this.limitesSostenibles[o.tipo] || 10000;
    const factor = this.factorPeriodo[o.periodo]   || 1;
    return Math.round(base * factor);
  }

  porcentajeDisplay(o: any): number {
    if (!o.valorObjetivo || o.valorObjetivo === 0) return 0;

    if (o.direccion === 'aumentar') {
      const limite      = this.getLimiteSostenible(o);
      const objetivoReal = Math.min(o.valorObjetivo, limite);
      return Math.min(100, Math.round((o.valorActual / objetivoReal) * 100));
    }

    if (o.valorActual <= o.valorObjetivo) return 100;
    const maximo = o.valorObjetivo * 2;
    const avance = maximo - o.valorActual;
    const total  = maximo - o.valorObjetivo;
    if (total <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((avance / total) * 100)));
  }

  estadoClase(o: any): string {
    const p = this.porcentajeDisplay(o);
    if (p === 0)  return 'gris';
    if (p >= 100) return 'verde';
    if (p >= 50)  return 'amarillo';
    return 'rojo';
  }

  estadoTexto(o: any): string {
    const p = this.porcentajeDisplay(o);
    if (p === 0)  return 'Sin iniciar';
    if (p >= 100) return '✓ Completado';
    if (p >= 75)  return 'Casi listo';
    if (p >= 50)  return 'En progreso';
    return 'Inicio';
  }

  explicacion(o: any): string {
    const limite = this.getLimiteSostenible(o);
    const periodoLabel: Record<string, string> = {
      mensual: 'mes', trimestral: 'trimestre', semestral: 'semestre', anual: 'año'
    };
    const p = periodoLabel[o.periodo] || 'período';

    if (o.direccion === 'reducir') {
      if (o.valorActual <= o.valorObjetivo)
        return `✅ ¡Bien! Tu consumo (${o.valorActual}) ya está por debajo del objetivo (${o.valorObjetivo} ${this.unidad(o.tipo)}).`;
      return `Necesitas reducir ${o.valorActual - o.valorObjetivo} ${this.unidad(o.tipo)} más para alcanzar el objetivo.`;
    } else {
      if (o.valorObjetivo > limite)
        return `⚠️ Tu objetivo (${o.valorObjetivo}) supera el límite sostenible por ${p} (${limite} ${this.unidad(o.tipo)}). Se usará ${limite} como tope.`;
      if (o.valorActual >= Math.min(o.valorObjetivo, limite))
        return `✅ ¡Objetivo alcanzado! Límite sostenible por ${p}: ${limite} ${this.unidad(o.tipo)}.`;
      const falta = o.valorObjetivo - o.valorActual;
      return `Te faltan ${falta} ${this.unidad(o.tipo)} para tu objetivo. Límite sostenible por ${p}: ${limite} ${this.unidad(o.tipo)}.`;
    }
  }

  iconoTipo(t: string)  { return ({ CO2:'🌫️', ENERGIA:'⚡', AGUA:'💧', RESIDUOS:'🗑️' } as any)[t] || '📊'; }
  labelTipo(t: string)  { return ({ CO2:'Reducción de CO₂', ENERGIA:'Eficiencia energética', AGUA:'Consumo de agua', RESIDUOS:'Gestión de residuos' } as any)[t] || t; }
  unidad(t: string)     { return ({ CO2:'kg CO₂', ENERGIA:'kWh', AGUA:'litros', RESIDUOS:'kg' } as any)[t] || ''; }
  periodoLabel(t: string) { return ({ mensual:'Mensual', trimestral:'Trimestral', semestral:'Semestral', anual:'Anual' } as any)[t] || t; }

  get completados() { return this.objetivos.filter(o => this.porcentajeDisplay(o) >= 100).length; }
  get enProgreso()  { return this.objetivos.filter(o => { const p = this.porcentajeDisplay(o); return p > 0 && p < 100; }).length; }
  get sinIniciar()  { return this.objetivos.filter(o => this.porcentajeDisplay(o) === 0).length; }
}

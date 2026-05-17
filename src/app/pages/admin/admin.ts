import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmpresaService } from '../../services/empresa';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Tipos internos ────────────────────────────────────────────────────────────

interface LogEntry {
  hora: string;
  icono: string;
  mensaje: string;
}

interface Notificacion {
  id: number;
  tipo: 'info' | 'exito' | 'error' | 'alerta';
  icono: string;
  texto: string;
}

type Vista = 'tabla' | 'detalle' | 'editar' | 'crear';

// ── Colores para gráficos ─────────────────────────────────────────────────────

const COLORES = [
  '#2e8b57', '#0a2e1f', '#4caf82', '#8ab4a0',
  '#1a5c3a', '#6dbf90', '#256e45', '#b2dfcc',
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {

  // ── Estado de vista ───────────────────────────────────────────────────────
  vistaActual: Vista = 'tabla';
  verLog             = false;

  // ── Datos ─────────────────────────────────────────────────────────────────
  usuarios:           any[] = [];
  usuariosFiltrados:  any[] = [];
  empresaEditando:    any   = {};
  empresaDetalle:     any   = null;
  medicionesDetalle:  any[] = [];
  nuevaEmpresa:       any   = this.empresaVacia();

  // ── Mensajes ──────────────────────────────────────────────────────────────
  mensajeExito = false;
  mensajeError = false;

  // ── Filtros / orden ───────────────────────────────────────────────────────
  textoBusqueda = '';
  filtroRol     = '';
  filtroTamano  = '';
  columnaOrden  = '';
  ordenAsc      = true;

  // ── Log de actividad ──────────────────────────────────────────────────────
  activityLog: LogEntry[] = [];

  // ── Notificaciones ────────────────────────────────────────────────────────
  notificaciones: Notificacion[] = [];
  private notifId = 0;

  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CARGA DE DATOS
  // ══════════════════════════════════════════════════════════════════════════

  cargarUsuarios() {
    this.empresaService.findAll().subscribe({
      next: (data: any[]) => {
        this.usuarios         = data;
        this.usuariosFiltrados = [...data];
        this.registrarLog('📥', `${data.length} empresas cargadas`);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar:', err);
        this.pushNotif('error', '❌', 'Error al cargar las empresas');
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ESTADÍSTICAS
  // ══════════════════════════════════════════════════════════════════════════

  contarRol(rol: string): number {
    return this.usuarios.filter(u => u.rol === rol).length;
  }

  contarPaisesUnicos(): number {
    return new Set(this.usuarios.map(u => u.pais).filter(Boolean)).size;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GRÁFICOS
  // ══════════════════════════════════════════════════════════════════════════

  getGrafico(campo: string): { key: string; count: number; pct: number; color: string }[] {
    const mapa: Record<string, number> = {};
    this.usuarios.forEach(u => {
      const v = u[campo] || 'Sin datos';
      mapa[v] = (mapa[v] || 0) + 1;
    });
    const max = Math.max(...Object.values(mapa), 1);
    return Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, count], i) => ({
        key,
        count,
        pct: Math.round((count / max) * 100),
        color: COLORES[i % COLORES.length],
      }));
  }

  getDonutSegments(): { label: string; count: number; color: string; dash: string; offset: string }[] {
    const tamanos = ['pequena', 'mediana', 'grande'];
    const colores = ['#9d174d', '#92400e', '#1e40af'];
    const labels  = ['Pequeña', 'Mediana', 'Grande'];
    const total   = this.usuarios.length || 1;
    const circum  = 2 * Math.PI * 45; // 282.74

    let acumulado = 0;
    return tamanos.map((t, i) => {
      const count = this.usuarios.filter(u => u.tamano === t).length;
      const frac  = count / total;
      const dash  = `${frac * circum} ${circum}`;
      const offset = `${-acumulado * circum}`;
      acumulado += frac;
      return { label: labels[i], count, color: colores[i], dash, offset };
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FILTROS Y ORDEN
  // ══════════════════════════════════════════════════════════════════════════

  aplicarFiltros() {
    const texto = this.textoBusqueda.toLowerCase().trim();
    let resultado = this.usuarios.filter(u => {
      const coincideTexto =
        !texto ||
        u.nombre?.toLowerCase().includes(texto) ||
        u.sector?.toLowerCase().includes(texto) ||
        u.pais?.toLowerCase().includes(texto) ||
        u.ciudad?.toLowerCase().includes(texto);
      const coincideRol    = !this.filtroRol    || u.rol    === this.filtroRol;
      const coincideTamano = !this.filtroTamano || u.tamano === this.filtroTamano;
      return coincideTexto && coincideRol && coincideTamano;
    });
    if (this.columnaOrden) resultado = this.sortArray(resultado, this.columnaOrden, this.ordenAsc);
    this.usuariosFiltrados = resultado;
    this.cdr.detectChanges();
  }

  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  ordenarPor(columna: string) {
    this.ordenAsc      = this.columnaOrden === columna ? !this.ordenAsc : true;
    this.columnaOrden  = columna;
    this.usuariosFiltrados = this.sortArray(this.usuariosFiltrados, columna, this.ordenAsc);
    this.cdr.detectChanges();
  }

  getSortIcon(col: string): string {
    if (this.columnaOrden !== col) return '↕';
    return this.ordenAsc ? '↑' : '↓';
  }

  private sortArray(arr: any[], col: string, asc: boolean): any[] {
    return [...arr].sort((a, b) => {
      const va = (a[col] ?? '').toString().toLowerCase();
      const vb = (b[col] ?? '').toString().toLowerCase();
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ROL INLINE
  // ══════════════════════════════════════════════════════════════════════════

  toggleRol(empresa: any) {
    const nuevo = empresa.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`¿Cambiar rol de "${empresa.nombre}" a ${nuevo}?`)) return;
    this.empresaService.updateEmpresa(empresa.idEmpresa, { ...empresa, rol: nuevo }).subscribe({
      next: (data: any) => {
        const i = this.usuarios.findIndex(u => u.idEmpresa === data.idEmpresa);
        if (i !== -1) this.usuarios[i] = data;
        this.aplicarFiltros();
        this.registrarLog('🔄', `Rol de "${empresa.nombre}" cambiado a ${nuevo}`);
        this.pushNotif('exito', '✅', `Rol actualizado a ${nuevo}`);
      },
      error: () => this.pushNotif('error', '❌', 'No se pudo cambiar el rol'),
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EDITAR
  // ══════════════════════════════════════════════════════════════════════════

  editar(empresa: any) {
    this.empresaEditando = { ...empresa };
    this.vistaActual     = 'editar';
    this.mensajeExito    = false;
    this.mensajeError    = false;
  }

  cancelarEdicion() {
    this.vistaActual     = 'tabla';
    this.empresaEditando = {};
  }

  guardarEdicion() {
    this.empresaService.updateEmpresa(this.empresaEditando.idEmpresa, this.empresaEditando).subscribe({
      next: (actualizada: any) => {
        const i = this.usuarios.findIndex(u => u.idEmpresa === actualizada.idEmpresa);
        if (i !== -1) this.usuarios[i] = actualizada;
        this.mensajeExito = true;
        this.mensajeError = false;
        this.registrarLog('✏️', `Empresa "${actualizada.nombre}" editada`);
        this.pushNotif('exito', '✅', `"${actualizada.nombre}" actualizada correctamente`);
        setTimeout(() => {
          this.mensajeExito    = false;
          this.vistaActual     = 'tabla';
          this.empresaEditando = {};
          this.aplicarFiltros();
        }, 1800);
      },
      error: () => {
        this.mensajeError = true;
        this.pushNotif('error', '❌', 'Error al guardar los cambios');
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CREAR EMPRESA
  // ══════════════════════════════════════════════════════════════════════════

  abrirCrear() {
    this.nuevaEmpresa = this.empresaVacia();
    this.mensajeExito = false;
    this.mensajeError = false;
    this.vistaActual  = 'crear';
  }

  cerrarCrear() {
    this.vistaActual = 'tabla';
  }

  crearEmpresa() {
    const { nombre, sector, pais, correoContacto, password } = this.nuevaEmpresa;
    if (!nombre || !sector || !pais || !correoContacto || !password) {
      this.pushNotif('alerta', '⚠️', 'Rellena todos los campos obligatorios');
      return;
    }

    console.log('📤 Enviando:', this.nuevaEmpresa); // ← añade esto

    this.empresaService.createEmpresa(this.nuevaEmpresa).subscribe({
      next: (creada: any) => {
        console.log('✅ Respuesta:', creada); // ← y esto
        this.usuarios.push(creada);
        this.aplicarFiltros();
        this.mensajeExito = true;
        this.mensajeError = false;
        this.registrarLog('➕', `Empresa "${creada.nombre}" creada`);
        this.pushNotif('exito', '✅', `"${creada.nombre}" creada correctamente`);
        setTimeout(() => {
          this.mensajeExito = false;
          this.vistaActual  = 'tabla';
        }, 1800);
      },
      error: (err) => {
        console.error('❌ Error:', err); // ← y esto
        this.mensajeError = true;
        this.pushNotif('error', '❌', 'Error al crear la empresa');
      },
    });
  }

  private empresaVacia() {
    return {
      nombre: '', sector: '', pais: '', ciudad: '',
      correoContacto: '', password: '', numeroRegistro: '',
      tamano: 'mediana', rol: 'USER',
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA DETALLE
  // ══════════════════════════════════════════════════════════════════════════

  verDetalle(empresa: any) {
    this.empresaDetalle    = empresa;
    this.medicionesDetalle = [];
    this.vistaActual       = 'detalle';

    this.empresaService.getMedicionesByEmpresa(empresa.idEmpresa).subscribe({
      next: (m: any[]) => { this.medicionesDetalle = m.slice(0, 10); this.cdr.detectChanges(); },
      error: () => { this.medicionesDetalle = []; },
    });

    this.registrarLog('👁', `Vista detalle: "${empresa.nombre}"`);
  }

  volverTabla() {
    this.vistaActual    = 'tabla';
    this.empresaDetalle = null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ELIMINAR
  // ══════════════════════════════════════════════════════════════════════════

  eliminar(id: number) {
    const empresa = this.usuarios.find(u => u.idEmpresa === id);
    if (!id || !confirm(`¿Eliminar "${empresa?.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.empresaService.deleteEmpresa(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.idEmpresa !== id);
        this.aplicarFiltros();
        if (this.vistaActual === 'detalle') this.vistaActual = 'tabla';
        this.registrarLog('🗑️', `Empresa "${empresa?.nombre}" eliminada`);
        this.pushNotif('alerta', '🗑️', `"${empresa?.nombre}" eliminada`);
      },
      error: () => this.pushNotif('error', '❌', 'Error al eliminar la empresa'),
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EXPORTAR CSV
  // ══════════════════════════════════════════════════════════════════════════

  exportarCSV() {
    const cabecera = ['ID', 'Nombre', 'Sector', 'País', 'Ciudad', 'Tamaño', 'Correo', 'Rol'];
    const filas    = this.usuariosFiltrados.map(u => [
      u.idEmpresa, u.nombre, u.sector, u.pais,
      u.ciudad, u.tamano, u.correoContacto, u.rol,
    ]);
    const csv  = [cabecera, ...filas].map(f => f.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `empresas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.registrarLog('⬇️', `CSV exportado (${this.usuariosFiltrados.length} empresas)`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LOG DE ACTIVIDAD
  // ══════════════════════════════════════════════════════════════════════════

  toggleLog() { this.verLog = !this.verLog; }

  limpiarLog() { this.activityLog = []; }

  private registrarLog(icono: string, mensaje: string) {
    const ahora = new Date();
    const hora  = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.activityLog.unshift({ hora, icono, mensaje });
    if (this.activityLog.length > 50) this.activityLog.pop();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NOTIFICACIONES
  // ══════════════════════════════════════════════════════════════════════════

  cerrarNotif(n: Notificacion) {
    this.notificaciones = this.notificaciones.filter(x => x.id !== n.id);
  }

  private pushNotif(tipo: Notificacion['tipo'], icono: string, texto: string) {
    const n: Notificacion = { id: ++this.notifId, tipo, icono, texto };
    this.notificaciones.push(n);
    this.cdr.detectChanges();
    setTimeout(() => this.cerrarNotif(n), 4000);
  }
}

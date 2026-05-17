import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmpresaService } from '../../services/empresa';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

// Las 4 pantallas posibles del panel admin
type Vista = 'tabla' | 'detalle' | 'editar' | 'crear';

// Paleta de colores para los gráficos de barras y donut
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

  vistaActual: Vista = 'tabla';
  verLog             = false;

  usuarios:           any[] = [];
  // Copia filtrada de usuarios que es la que se muestra en la tabla
  usuariosFiltrados:  any[] = [];
  empresaEditando:    any   = {};
  empresaDetalle:     any   = null;
  medicionesDetalle:  any[] = [];
  nuevaEmpresa:       any   = this.empresaVacia();

  mensajeExito = false;
  mensajeError = false;

  textoBusqueda = '';
  filtroRol     = '';
  filtroTamano  = '';
  columnaOrden  = '';
  ordenAsc      = true;

  activityLog: LogEntry[] = [];

  notificaciones: Notificacion[] = [];
  // Contador autoincremental para dar id único a cada notificación
  private notifId = 0;

  constructor(
    private empresaService: EmpresaService,
    // ChangeDetectorRef fuerza a Angular a redibujar la vista manualmente
    // necesario porque algunos cambios ocurren fuera del ciclo de detección normal
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Carga todas las empresas del backend al entrar al panel
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

  // Devuelve cuántas empresas tienen el rol indicado
  contarRol(rol: string): number {
    return this.usuarios.filter(u => u.rol === rol).length;
  }

  // Devuelve cuántos países distintos hay entre todas las empresas
  // filter(Boolean) elimina valores null/undefined/vacíos
  contarPaisesUnicos(): number {
    return new Set(this.usuarios.map(u => u.pais).filter(Boolean)).size;
  }

  // Genera los datos para el gráfico de barras de un campo dado (sector, país...)
  // Devuelve máximo 6 entradas ordenadas de mayor a menor, con % relativo al máximo
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

  // Genera los segmentos del gráfico donut de tamaños de empresa
  // dash y offset son los valores SVG stroke-dasharray/stroke-dashoffset
  // que posicionan cada segmento del círculo correctamente
  getDonutSegments(): { label: string; count: number; color: string; dash: string; offset: string }[] {
    const tamanos = ['pequena', 'mediana', 'grande'];
    const colores = ['#9d174d', '#92400e', '#1e40af'];
    const labels  = ['Pequeña', 'Mediana', 'Grande'];
    const total   = this.usuarios.length || 1;
    const circum  = 2 * Math.PI * 45; // perímetro del círculo SVG (radio 45)

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

  // Filtra y ordena la tabla según el texto de búsqueda y los selectores de rol/tamaño
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

  // Vacía el buscador y recalcula los filtros
  limpiarBusqueda() {
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  // Ordena por la columna pulsada; si ya estaba activa, invierte el orden
  ordenarPor(columna: string) {
    this.ordenAsc      = this.columnaOrden === columna ? !this.ordenAsc : true;
    this.columnaOrden  = columna;
    this.usuariosFiltrados = this.sortArray(this.usuariosFiltrados, columna, this.ordenAsc);
    this.cdr.detectChanges();
  }

  // Devuelve el icono de ordenación para la cabecera de cada columna
  getSortIcon(col: string): string {
    if (this.columnaOrden !== col) return '↕';
    return this.ordenAsc ? '↑' : '↓';
  }

  // Ordena un array por el campo indicado, comparando como strings para soportar texto y números
  private sortArray(arr: any[], col: string, asc: boolean): any[] {
    return [...arr].sort((a, b) => {
      const va = (a[col] ?? '').toString().toLowerCase();
      const vb = (b[col] ?? '').toString().toLowerCase();
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  // Cambia el rol de una empresa entre ADMIN y USER directamente desde la tabla
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

  // Carga los datos de la empresa en el formulario y cambia a la vista de edición
  editar(empresa: any) {
    // Spread para no mutar el objeto original de la lista mientras se edita
    this.empresaEditando = { ...empresa };
    this.vistaActual     = 'editar';
    this.mensajeExito    = false;
    this.mensajeError    = false;
  }

  // Descarta los cambios y vuelve a la tabla
  cancelarEdicion() {
    this.vistaActual     = 'tabla';
    this.empresaEditando = {};
  }

  // Envía los cambios al backend y actualiza la empresa en la lista local
  guardarEdicion() {
    this.empresaService.updateEmpresa(this.empresaEditando.idEmpresa, this.empresaEditando).subscribe({
      next: (actualizada: any) => {
        const i = this.usuarios.findIndex(u => u.idEmpresa === actualizada.idEmpresa);
        if (i !== -1) this.usuarios[i] = actualizada;
        this.mensajeExito = true;
        this.mensajeError = false;
        this.registrarLog('✏️', `Empresa "${actualizada.nombre}" editada`);
        this.pushNotif('exito', '✅', `"${actualizada.nombre}" actualizada correctamente`);
        // Volvemos a la tabla automáticamente tras 1.8s para que el usuario vea el mensaje
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

  // Resetea el formulario de creación y abre el modal
  abrirCrear() {
    this.nuevaEmpresa = this.empresaVacia();
    this.mensajeExito = false;
    this.mensajeError = false;
    this.vistaActual  = 'crear';
  }

  cerrarCrear() {
    this.vistaActual = 'tabla';
  }

  // Valida campos obligatorios y crea la empresa en el backend
  crearEmpresa() {
    const { nombre, sector, pais, correoContacto, password } = this.nuevaEmpresa;
    if (!nombre || !sector || !pais || !correoContacto || !password) {
      this.pushNotif('alerta', '⚠️', 'Rellena todos los campos obligatorios');
      return;
    }

    console.log('📤 Enviando:', this.nuevaEmpresa);

    this.empresaService.createEmpresa(this.nuevaEmpresa).subscribe({
      next: (creada: any) => {
        console.log('✅ Respuesta:', creada);
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
        console.error('❌ Error:', err);
        this.mensajeError = true;
        this.pushNotif('error', '❌', 'Error al crear la empresa');
      },
    });
  }

  // Objeto base con campos vacíos para el formulario de creación
  private empresaVacia() {
    return {
      nombre: '', sector: '', pais: '', ciudad: '',
      correoContacto: '', password: '', numeroRegistro: '',
      tamano: 'mediana', rol: 'USER',
    };
  }

  // Carga el detalle de una empresa y sus últimas mediciones
  verDetalle(empresa: any) {
    this.empresaDetalle    = empresa;
    this.medicionesDetalle = [];
    this.vistaActual       = 'detalle';

    // Solo mostramos las 10 más recientes para no sobrecargar la vista
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

  mostrarModalEliminar = false;
  idAEliminar: number | null = null;
  nombreAEliminar = '';

  // Abre el modal de confirmación guardando qué empresa se va a borrar
  eliminar(id: number) {
    const empresa = this.usuarios.find(u => u.idEmpresa === id);
    if (!id) return;
    this.idAEliminar          = id;
    this.nombreAEliminar      = empresa?.nombre ?? '';
    this.mostrarModalEliminar = true;
  }

  // Ejecuta el borrado tras confirmación del modal
  confirmarEliminar() {
    if (!this.idAEliminar) return;
    const id     = this.idAEliminar;
    const nombre = this.nombreAEliminar;
    this.mostrarModalEliminar = false;
    this.idAEliminar = null;

    this.empresaService.deleteEmpresa(id).subscribe({
      next: () => {
        // Eliminamos de la lista local sin recargar todo del backend
        this.usuarios = this.usuarios.filter(u => u.idEmpresa !== id);
        this.aplicarFiltros();
        if (this.vistaActual === 'detalle') this.vistaActual = 'tabla';
        this.registrarLog('🗑️', `Empresa "${nombre}" eliminada`);
        this.pushNotif('alerta', '🗑️', `"${nombre}" eliminada`);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        console.error('Error body:', err.error);
        this.pushNotif('error', '❌', `Error ${err.status} al eliminar "${nombre}"`);
      },
    });
  }

  // Cierra el modal sin hacer nada
  cancelarEliminar() {
    this.mostrarModalEliminar = false;
    this.idAEliminar = null;
  }

  // Genera y descarga un CSV con las empresas actualmente visibles en la tabla
  // '\ufeff' es el BOM de UTF-8, necesario para que Excel abra el CSV con tildes correctamente
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
    // Liberamos la URL temporal de memoria una vez descargado
    URL.revokeObjectURL(url);
    this.registrarLog('⬇️', `CSV exportado (${this.usuariosFiltrados.length} empresas)`);
  }

  // Muestra u oculta el panel de log de actividad
  toggleLog() { this.verLog = !this.verLog; }

  limpiarLog() { this.activityLog = []; }

  // Añade una entrada al log con la hora actual, limitando a 50 entradas máximo
  // unshift añade al principio para que lo más reciente aparezca arriba
  private registrarLog(icono: string, mensaje: string) {
    const ahora = new Date();
    const hora  = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.activityLog.unshift({ hora, icono, mensaje });
    if (this.activityLog.length > 50) this.activityLog.pop();
  }

  // Elimina una notificación específica de la lista por su id
  cerrarNotif(n: Notificacion) {
    this.notificaciones = this.notificaciones.filter(x => x.id !== n.id);
  }

  // Crea una notificación, la muestra y la elimina automáticamente a los 4 segundos
  private pushNotif(tipo: Notificacion['tipo'], icono: string, texto: string) {
    const n: Notificacion = { id: ++this.notifId, tipo, icono, texto };
    this.notificaciones.push(n);
    this.cdr.detectChanges();
    setTimeout(() => this.cerrarNotif(n), 4000);
  }
}

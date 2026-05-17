import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-buscador-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './buscador-proveedores.html',
  styleUrl: './buscador-proveedores.css'
})
export class BuscadorProveedoresComponent implements OnInit {

  // Valores de los filtros activos (vacío = sin filtro)
  filtroTipo: string = '';
  filtroSector: string = '';
  filtroUbicacion: string = '';
  textoBusqueda: string = '';

  // Lista que se muestra en pantalla (cambia al filtrar)
  proveedoresFiltrados: any[] = [];

  // Base de datos estática de proveedores sostenibles
  todosProveedores: any[] = [
    {
      nombre: 'Acciona',
      icono: '🌬️',
      descripcion: 'Grupo empresarial español líder en energías renovables, agua y servicios. Opera en más de 60 países con tecnología propia.',
      razonSostenible: 'Una de las mayores empresas de energía renovable del mundo. Objetivo net-zero 2050.',
      tags: ['Energía renovable', 'ISO 14001', 'ESG'],
      tipo: 'energia',
      tipoLabel: 'Energía renovable',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.acciona.com'
    },
    {
      nombre: 'Iberdrola',
      icono: '⚡',
      descripcion: 'Compañía energética española y líder mundial en energía eólica. Más de 35.000 MW renovables instalados globalmente.',
      razonSostenible: 'Líder mundial en energía eólica. Comprometida con cero emisiones netas antes de 2030.',
      tags: ['Eólica', 'Solar', 'Cero emisiones'],
      tipo: 'energia',
      tipoLabel: 'Energía renovable',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.iberdrola.com'
    },
    {
      nombre: 'Endesa',
      icono: '☀️',
      descripcion: 'Principal operadora eléctrica de España. Comprometida con la transición energética y la descarbonización total.',
      razonSostenible: 'Plan de transición energética con 60% de energía renovable antes de 2030.',
      tags: ['Solar', 'Eólica', 'Descarbonización'],
      tipo: 'energia',
      tipoLabel: 'Energía renovable',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.endesa.com'
    },
    {
      nombre: 'Veolia España',
      icono: '💧',
      descripcion: 'Referente global en gestión del agua, residuos y energía. Servicios medioambientales para industrias y municipios.',
      razonSostenible: 'Trata más de 100 millones de m³ de agua al año. Economía circular aplicada a residuos industriales.',
      tags: ['Gestión agua', 'Residuos', 'Economía circular'],
      tipo: 'agua',
      tipoLabel: 'Gestión del agua',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.veolia.es'
    },
    {
      nombre: 'Suez Water Spain',
      icono: '🌊',
      descripcion: 'Especialistas en soluciones de gestión del agua para industria, municipios y agroindustria con tecnología avanzada.',
      razonSostenible: 'Tecnologías de reutilización y depuración de aguas residuales con huella mínima.',
      tags: ['Depuración', 'Reutilización', 'Industria'],
      tipo: 'agua',
      tipoLabel: 'Gestión del agua',
      sector: 'alimentacion',
      ubicacion: 'españa',
      sitioWeb: 'https://www.suez.com/es-es'
    },
    {
      nombre: 'Holcim España',
      icono: '🏗️',
      descripcion: 'Fabricante de materiales de construcción sostenibles. Cementos y áridos con la menor huella de carbono del sector.',
      razonSostenible: 'Líder en cemento bajo en carbono. Usa un 40% de materiales reciclados en sus productos.',
      tags: ['Materiales reciclados', 'Construcción verde', 'CO₂ reducido'],
      tipo: 'materiales',
      tipoLabel: 'Materiales reciclados',
      sector: 'construccion',
      ubicacion: 'españa',
      sitioWeb: 'https://www.holcim.es'
    },
    {
      nombre: 'Ecoembes',
      icono: '♻️',
      descripcion: 'Organización sin ánimo de lucro que coordina el reciclaje de envases en España. Punto Verde certificado.',
      razonSostenible: 'Recupera y recicla más de 1,6 millones de toneladas de envases al año en España.',
      tags: ['Reciclaje', 'Envases', 'Economía circular'],
      tipo: 'residuos',
      tipoLabel: 'Gestión de residuos',
      sector: 'alimentacion',
      ubicacion: 'españa',
      sitioWeb: 'https://www.ecoembes.com'
    },
    {
      nombre: 'Urbaser',
      icono: '🗑️',
      descripcion: 'Empresa española de gestión integral de residuos municipales e industriales presente en más de 20 países.',
      razonSostenible: 'Convierte residuos en recursos energéticos. Valorización del 90% de los residuos tratados.',
      tags: ['Residuos industriales', 'Valorización', 'Biogás'],
      tipo: 'residuos',
      tipoLabel: 'Gestión de residuos',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.urbaser.com'
    },
    {
      nombre: 'DHL GoGreen',
      icono: '🚚',
      descripcion: 'Programa de logística sostenible de DHL con flota de vehículos eléctricos y compensación de emisiones en envíos.',
      razonSostenible: 'Meta de cero emisiones netas en 2050. Ya opera con más de 90.000 vehículos eléctricos.',
      tags: ['Transporte eléctrico', 'Logística verde', 'Neutro CO₂'],
      tipo: 'transporte',
      tipoLabel: 'Transporte eficiente',
      sector: 'logistica',
      ubicacion: 'europa',
      sitioWeb: 'https://www.dhl.com/es-es/home/nuestras-divisiones/freight/servicios/gogreen.html'
    },
    {
      nombre: 'Correos Express',
      icono: '📦',
      descripcion: 'Paquetería urgente con plan de descarbonización y flota eléctrica creciente en zonas urbanas españolas.',
      razonSostenible: 'Más de 2.000 vehículos eléctricos y plan de flota 100% sostenible para 2030.',
      tags: ['Última milla', 'Vehículo eléctrico', 'España'],
      tipo: 'transporte',
      tipoLabel: 'Transporte eficiente',
      sector: 'logistica',
      ubicacion: 'españa',
      sitioWeb: 'https://www.correosexpress.com'
    },
    {
      nombre: 'Siemens Energy',
      icono: '🔋',
      descripcion: 'Proveedor global de tecnologías energéticas: turbinas de gas, eólica offshore, hidrógeno verde y almacenamiento.',
      razonSostenible: 'Tecnología de hidrógeno verde y electrólisis. Comprometida con neutralidad climática en 2030.',
      tags: ['Hidrógeno verde', 'Eólica offshore', 'Almacenamiento'],
      tipo: 'energia',
      tipoLabel: 'Energía renovable',
      sector: 'manufactura',
      ubicacion: 'europa',
      sitioWeb: 'https://www.siemens-energy.com'
    },
    {
      nombre: 'Schneider Electric',
      icono: '🔌',
      descripcion: 'Especialista en gestión de energía y automatización industrial. Soluciones para eficiencia energética y digitalización.',
      razonSostenible: 'Ayuda a sus clientes a reducir emisiones de CO₂ en más de 120 Mt al año globalmente.',
      tags: ['Eficiencia energética', 'Automatización', 'ISO 50001'],
      tipo: 'energia',
      tipoLabel: 'Energía renovable',
      sector: 'manufactura',
      ubicacion: 'europa',
      sitioWeb: 'https://www.se.com/es/es/'
    },
    {
      nombre: 'Upcyclea',
      icono: '🔄',
      descripcion: 'Plataforma española de economía circular que conecta empresas para reutilizar materiales y residuos industriales.',
      razonSostenible: 'Evita que residuos industriales vayan a vertedero conectando empresas compradoras y vendedoras de subproductos.',
      tags: ['Economía circular', 'Subproductos', 'Industria'],
      tipo: 'materiales',
      tipoLabel: 'Materiales reciclados',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.upcyclea.com'
    },
    {
      nombre: 'Naturgy',
      icono: '🌿',
      descripcion: 'Empresa energética española con fuerte apuesta por el gas natural renovable, biometano e hidrógeno verde.',
      razonSostenible: 'Inversión de 14.000 M€ en energías limpias hasta 2026. Líderes en biometano en España.',
      tags: ['Biometano', 'Gas renovable', 'Hidrógeno'],
      tipo: 'energia',
      tipoLabel: 'Energía renovable',
      sector: 'manufactura',
      ubicacion: 'españa',
      sitioWeb: 'https://www.naturgy.com'
    }
  ];

  ngOnInit() {
    // Cargamos todos los proveedores al entrar (sin filtros activos)
    this.filtrar();
  }

  // Filtra la lista según los criterios activos
  // Si un filtro está vacío, no se aplica (muestra todos para ese campo)
  // El texto busca en nombre, descripción y tags a la vez
  filtrar() {
    this.proveedoresFiltrados = this.todosProveedores.filter(p => {
      const okTipo      = !this.filtroTipo      || p.tipo === this.filtroTipo;
      const okSector    = !this.filtroSector    || p.sector === this.filtroSector;
      const okUbicacion = !this.filtroUbicacion || p.ubicacion === this.filtroUbicacion;
      const okTexto     = !this.textoBusqueda   ||
        p.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        p.tags.some((t: string) => t.toLowerCase().includes(this.textoBusqueda.toLowerCase()));
      return okTipo && okSector && okUbicacion && okTexto;
    });
  }

  // Resetea todos los filtros y vuelve a mostrar todos los proveedores
  limpiarFiltros() {
    this.filtroTipo = '';
    this.filtroSector = '';
    this.filtroUbicacion = '';
    this.textoBusqueda = '';
    this.filtrar();
  }

  // Abre el sitio web del proveedor en una pestaña nueva
  abrirWeb(url: string) {
    if (url) window.open(url, '_blank');
  }

  // Función de tracking para *ngFor: usa el nombre como identificador único
  // Evita que Angular redibuje tarjetas que no han cambiado al filtrar
  trackByNombre(index: number, item: any): string {
    return item.nombre;
  }
}

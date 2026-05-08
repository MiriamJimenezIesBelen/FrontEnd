import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Opcion {
  label: string;
  hint: string;
  dinero: number;
  esg: number;
  msg: string;
}

interface Evento {
  tag: string;
  titulo: string;
  desc: string;
  opciones: Opcion[];
}

@Component({
  selector: 'app-simulador-esg',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulador-esg.html',
  styleUrl: './simulador-esg.css'
})


export class SimuladorEsgComponent implements OnInit {

  constructor(private cd: ChangeDetectorRef) {}

  dinero = 10000;
  esg = 50;
  ronda = 1;
  maxRondas = 8;
  eventoActual: Evento | null = null;
  mensaje = '';
  juegoTerminado = false;
  esperando = false;

  get rondasArray() { return Array.from({ length: this.maxRondas }, (_, i) => i); }
  get esgPct() { return Math.min(100, Math.max(0, this.esg)); }
  get esgColor() {
    if (this.esg >= 70) return '#639922';
    if (this.esg >= 45) return '#378add';
    if (this.esg >= 25) return '#ef9f27';
    return '#e24b4a';
  }
  get esgTag() {
    if (this.esg >= 70) return 'Líder sostenible';
    if (this.esg >= 45) return 'En progreso';
    if (this.esg >= 25) return 'Bajo riesgo';
    return 'Crítico';
  }
  get endGradeClass() {
    if (this.esg >= 75) return 'grade-s';
    if (this.esg >= 55) return 'grade-a';
    if (this.esg >= 35) return 'grade-b';
    return 'grade-c';
  }
  get endGradeLabel() {
    if (this.esg >= 75) return 'Rango S — Empresa referente ESG';
    if (this.esg >= 55) return 'Rango A — Buena gestión sostenible';
    if (this.esg >= 35) return 'Rango B — Margen de mejora';
    return 'Rango C — Gestión insostenible';
  }

  eventos: Evento[] = [
    {
      tag: 'ambiental',
      titulo: 'Superas los límites de CO2',
      desc: 'Tu fábrica ha emitido un 40% más de lo permitido. Los reguladores han abierto una investigación.',
      opciones: [
        { label: 'Ignorar las multas', hint: 'Arriesgado pero rentable a corto plazo', dinero: 2000, esg: -15, msg: 'Pagaste las multas mínimas. La prensa lo ha publicado.' },
        { label: 'Reducir la producción', hint: 'Medida temporal mientras buscas solución', dinero: -1000, esg: 10, msg: 'Producción reducida. Los empleados están preocupados.' },
        { label: 'Invertir en filtros industriales', hint: 'Costoso pero sostenible a largo plazo', dinero: -3000, esg: 25, msg: 'Nueva tecnología instalada. Los inversores ESG aprueban la medida.' }
      ]
    },
    {
      tag: 'social',
      titulo: 'Auditoría de condiciones laborales',
      desc: 'Un informe externo señala deficiencias en las condiciones de trabajo en tu planta principal.',
      opciones: [
        { label: 'Desacreditar el informe', hint: 'Puede funcionar, pero es arriesgado', dinero: 500, esg: -18, msg: 'La estrategia de desacreditación empeoró la situación mediática.' },
        { label: 'Mejora mínima obligatoria', hint: 'Cumple lo justo exigido por ley', dinero: -800, esg: 8, msg: 'Cumples los mínimos. Los sindicatos siguen insatisfechos.' },
        { label: 'Plan integral de bienestar', hint: 'Inversión alta con gran impacto reputacional', dinero: -2800, esg: 22, msg: 'El plan de bienestar recibe cobertura positiva en medios especializados.' }
      ]
    },
    {
      tag: 'gobernanza',
      titulo: 'Escándalo de corrupción menor',
      desc: 'Se descubre que un directivo aceptó comisiones de un proveedor. El consejo debe actuar.',
      opciones: [
        { label: 'Encubrirlo internamente', hint: 'Nadie lo sabrá... de momento', dinero: 1000, esg: -22, msg: 'El escándalo salió a la luz igualmente. Daño reputacional severo.' },
        { label: 'Despedir al directivo', hint: 'Acción visible pero superficial', dinero: -500, esg: 8, msg: 'Comunicado oficial emitido. Los medios piden más transparencia.' },
        { label: 'Auditoría externa completa', hint: 'Transparencia total y reforma estructural', dinero: -2000, esg: 20, msg: 'La auditoría refuerza la confianza de inversores institucionales.' }
      ]
    },
    {
      tag: 'ambiental',
      titulo: 'Crisis de residuos industriales',
      desc: 'Tu empresa genera residuos tóxicos en exceso. Necesitas una solución inmediata.',
      opciones: [
        { label: 'Exportar residuos ilegalmente', hint: 'Muy rentable, altamente ilegal', dinero: 2500, esg: -28, msg: 'Detectado por aduanas. Multa millonaria en proceso.' },
        { label: 'Reciclaje básico externo', hint: 'Solución económica y legal', dinero: -600, esg: 7, msg: 'Residuos gestionados. No es la solución más eficiente.' },
        { label: 'Construir planta de reciclaje propia', hint: 'Gran inversión con retorno a largo plazo', dinero: -3500, esg: 30, msg: 'La planta se convierte en referente del sector.' }
      ]
    },
    {
      tag: 'social',
      titulo: 'Huelga de trabajadores',
      desc: 'Los empleados exigen mejores salarios. La huelga lleva 3 días y la producción se ha parado.',
      opciones: [
        { label: 'Contratar esquiroles', hint: 'Muy impopular con consecuencias legales', dinero: 1200, esg: -20, msg: 'El conflicto escala. Varios sindicatos se unen a la protesta.' },
        { label: 'Negociar subida mínima', hint: 'Acuerdo rápido y económico', dinero: -900, esg: 10, msg: 'Acuerdo firmado. La paz social dura de momento.' },
        { label: 'Subida salarial y plan de carrera', hint: 'Cara pero genera fidelización y productividad', dinero: -2500, esg: 20, msg: 'La empresa es premiada como uno de los mejores empleadores del sector.' }
      ]
    },
    {
      tag: 'mercado',
      titulo: 'Oportunidad de energía renovable',
      desc: 'Un proveedor ofrece cubrir el 80% de tu energía con solar. Es una ventana de oportunidad limitada.',
      opciones: [
        { label: 'Rechazar la oferta', hint: 'Sin cambios, sin costes adicionales', dinero: 0, esg: -5, msg: 'Tus competidores aprovechan la oferta. Quedas por detrás en ESG.' },
        { label: 'Adopción parcial del 40%', hint: 'Equilibrio entre coste y beneficio', dinero: -1500, esg: 12, msg: 'Reducción moderada de huella de carbono. Buena imagen de marca.' },
        { label: 'Transición completa al solar', hint: 'Alta inversión, máximo impacto climático', dinero: -4000, esg: 28, msg: 'Tu empresa logra la certificación de carbono neutro.' }
      ]
    },
    {
      tag: 'gobernanza',
      titulo: 'Presión de inversores cortoplacistas',
      desc: 'Inversores presionan para recortar gastos en sostenibilidad y aumentar dividendos.',
      opciones: [
        { label: 'Ceder a sus exigencias', hint: 'Dividendos altos, reputación dañada', dinero: 3000, esg: -20, msg: 'Los fondos ESG venden sus acciones. Cotización cae un 8%.' },
        { label: 'Negociar un equilibrio', hint: 'Compromiso entre rentabilidad y sostenibilidad', dinero: 500, esg: -5, msg: 'Acuerdo moderado aceptado. Ningún bando queda del todo satisfecho.' },
        { label: 'Defender la estrategia ESG', hint: 'Sin ceder, con visión a largo plazo', dinero: -500, esg: 15, msg: 'Los medios especializados destacan tu liderazgo y visión.' }
      ]
    },
    {
      tag: 'ambiental',
      titulo: 'Inundación en zona de producción',
      desc: 'Un evento climático extremo afecta tu planta. Tu respuesta marcará la percepción pública.',
      opciones: [
        { label: 'Reclamar al seguro y esperar', hint: 'Sin proactividad, sin coste adicional', dinero: 1000, esg: -8, msg: 'La comunidad local critica tu falta de ayuda.' },
        { label: 'Apoyar a empleados afectados', hint: 'Coste moderado, alto impacto social', dinero: -1200, esg: 14, msg: 'Los medios cubren positivamente tu respuesta humana.' },
        { label: 'Fondo de resiliencia climática', hint: 'Inversión estructural para el futuro', dinero: -3000, esg: 24, msg: 'Tu empresa lidera el sector en adaptación al cambio climático.' }
      ]
    }
  ];

  ngOnInit() {
    this.siguienteEvento();
  }

  siguienteEvento() {
    if (this.ronda > this.maxRondas) {
      this.juegoTerminado = true;
      this.eventoActual = null;
      return;
    }
    const idx = Math.floor(Math.random() * this.eventos.length);
    this.eventoActual = { ...this.eventos[idx] };
    this.mensaje = '';
  }

  elegir(opcion: Opcion) {
    this.dinero += opcion.dinero;
    this.esg = Math.min(100, Math.max(0, this.esg + opcion.esg));
    this.mensaje = opcion.msg;
    this.ronda++;
    this.eventoActual = null;
    this.cd.detectChanges();
    setTimeout(() => {
      this.siguienteEvento();
      this.cd.detectChanges();
    }, 800);
  }


  reset() {
    this.dinero = 10000;
    this.esg = 50;
    this.ronda = 1;
    this.juegoTerminado = false;
    this.mensaje = '';
    this.eventoActual = null;
    setTimeout(() => this.siguienteEvento(), 50);
  }
}

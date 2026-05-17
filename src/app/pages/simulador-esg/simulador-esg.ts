import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Opcion {

  // Texto principal del botón
  label: string;

  // Explicación corta de la opción
  hint: string;

  // Dinero que gana o pierde el jugador
  dinero: number;

  // Impacto en puntuación ESG
  esg: number;

  // Mensaje mostrado tras elegir opción
  msg: string;
}

interface Evento {

  // Categoría visual del evento
  tag: string;

  // Título principal
  titulo: string;

  // Descripción del problema
  desc: string;

  // Opciones disponibles
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

  // ChangeDetector para refrescar la vista manualmente
  constructor(private cd: ChangeDetectorRef) {}

  // Dinero inicial del jugador
  dinero = 10000;

  // Nivel ESG inicial
  esg = 50;

  // Ronda actual
  ronda = 1;

  // Número máximo de rondas
  maxRondas = 8;

  // Evento actual mostrado
  eventoActual: Evento | null = null;

  // Mensaje tras tomar decisión
  mensaje = '';

  // Indica si el juego terminó
  juegoTerminado = false;

  // Estado auxiliar de espera
  esperando = false;

  // Array usado para pintar rondas visualmente
  get rondasArray() {

    return Array.from(
      { length: this.maxRondas },
      (_, i) => i
    );
  }

  // Limita ESG entre 0 y 100
  get esgPct() {

    return Math.min(
      100,
      Math.max(0, this.esg)
    );
  }

  // Devuelve color según nivel ESG
  get esgColor() {

    if (this.esg >= 70) return '#639922';

    if (this.esg >= 45) return '#378add';

    if (this.esg >= 25) return '#ef9f27';

    return '#e24b4a';
  }

  // Texto visual según puntuación ESG
  get esgTag() {

    if (this.esg >= 70) {
      return 'Líder sostenible';
    }

    if (this.esg >= 45) {
      return 'En progreso';
    }

    if (this.esg >= 25) {
      return 'Bajo riesgo';
    }

    return 'Crítico';
  }

  // Clase CSS final según resultado
  get endGradeClass() {

    if (this.esg >= 75) return 'grade-s';

    if (this.esg >= 55) return 'grade-a';

    if (this.esg >= 35) return 'grade-b';

    return 'grade-c';
  }

  // Texto final según puntuación ESG
  get endGradeLabel() {

    if (this.esg >= 75) {
      return 'Rango S — Empresa referente ESG';
    }

    if (this.esg >= 55) {
      return 'Rango A — Buena gestión sostenible';
    }

    if (this.esg >= 35) {
      return 'Rango B — Margen de mejora';
    }

    return 'Rango C — Gestión insostenible';
  }

  // Todos los eventos posibles del juego
  eventos: Evento[] = [

    // EVENTO 1
    {
      tag: 'ambiental',

      titulo: 'Superas los límites de CO2',

      desc:
        'Tu fábrica ha emitido un 40% más de lo permitido.',

      opciones: [

        {
          label: 'Ignorar las multas',

          hint:
            'Arriesgado pero rentable a corto plazo',

          dinero: 2000,

          esg: -15,

          msg:
            'Pagaste las multas mínimas.'
        },

        {
          label: 'Reducir la producción',

          hint:
            'Medida temporal mientras buscas solución',

          dinero: -1000,

          esg: 10,

          msg:
            'Producción reducida.'
        },

        {
          label: 'Invertir en filtros industriales',

          hint:
            'Costoso pero sostenible a largo plazo',

          dinero: -3000,

          esg: 25,

          msg:
            'Nueva tecnología instalada.'
        }
      ]
    },

    // EVENTO 2
    {
      tag: 'social',

      titulo: 'Auditoría de condiciones laborales',

      desc:
        'Un informe externo detecta problemas laborales.',

      opciones: [

        {
          label: 'Desacreditar el informe',

          hint:
            'Puede funcionar, pero es arriesgado',

          dinero: 500,

          esg: -18,

          msg:
            'La situación mediática empeoró.'
        },

        {
          label: 'Mejora mínima obligatoria',

          hint:
            'Cumple solo lo exigido por ley',

          dinero: -800,

          esg: 8,

          msg:
            'Cumples los mínimos legales.'
        },

        {
          label: 'Plan integral de bienestar',

          hint:
            'Inversión alta con gran impacto',

          dinero: -2800,

          esg: 22,

          msg:
            'La empresa recibe cobertura positiva.'
        }
      ]
    },

    // EVENTO 3
    {
      tag: 'gobernanza',

      titulo: 'Escándalo de corrupción menor',

      desc:
        'Un directivo aceptó comisiones ilegales.',

      opciones: [

        {
          label: 'Encubrirlo internamente',

          hint:
            'Nadie lo sabrá... de momento',

          dinero: 1000,

          esg: -22,

          msg:
            'El escándalo acabó saliendo.'
        },

        {
          label: 'Despedir al directivo',

          hint:
            'Acción visible pero superficial',

          dinero: -500,

          esg: 8,

          msg:
            'Los medios piden más transparencia.'
        },

        {
          label: 'Auditoría externa completa',

          hint:
            'Transparencia total',

          dinero: -2000,

          esg: 20,

          msg:
            'Los inversores recuperan confianza.'
        }
      ]
    },

    // EVENTO 4
    {
      tag: 'ambiental',

      titulo: 'Crisis de residuos industriales',

      desc:
        'Tu empresa genera residuos tóxicos en exceso.',

      opciones: [

        {
          label: 'Exportar residuos ilegalmente',

          hint:
            'Muy rentable pero ilegal',

          dinero: 2500,

          esg: -28,

          msg:
            'La empresa fue descubierta.'
        },

        {
          label: 'Reciclaje básico externo',

          hint:
            'Solución legal y barata',

          dinero: -600,

          esg: 7,

          msg:
            'Residuos gestionados.'
        },

        {
          label: 'Construir planta propia',

          hint:
            'Gran inversión sostenible',

          dinero: -3500,

          esg: 30,

          msg:
            'La empresa se vuelve referente.'
        }
      ]
    },

    // EVENTO 5
    {
      tag: 'social',

      titulo: 'Huelga de trabajadores',

      desc:
        'Los empleados exigen mejores salarios.',

      opciones: [

        {
          label: 'Contratar esquiroles',

          hint:
            'Muy impopular',

          dinero: 1200,

          esg: -20,

          msg:
            'El conflicto empeoró.'
        },

        {
          label: 'Negociar subida mínima',

          hint:
            'Acuerdo rápido y barato',

          dinero: -900,

          esg: 10,

          msg:
            'Acuerdo firmado.'
        },

        {
          label: 'Subida salarial completa',

          hint:
            'Cara pero positiva a largo plazo',

          dinero: -2500,

          esg: 20,

          msg:
            'La empresa mejora reputación.'
        }
      ]
    },

    // EVENTO 6
    {
      tag: 'mercado',

      titulo: 'Oportunidad de energía renovable',

      desc:
        'Puedes cambiar gran parte de tu energía a solar.',

      opciones: [

        {
          label: 'Rechazar la oferta',

          hint:
            'Sin cambios ni costes',

          dinero: 0,

          esg: -5,

          msg:
            'La competencia avanza más rápido.'
        },

        {
          label: 'Adopción parcial',

          hint:
            'Equilibrio entre coste y beneficio',

          dinero: -1500,

          esg: 12,

          msg:
            'Buena mejora de imagen.'
        },

        {
          label: 'Transición completa',

          hint:
            'Máximo impacto ambiental positivo',

          dinero: -4000,

          esg: 28,

          msg:
            'Consigues certificación verde.'
        }
      ]
    },

    // EVENTO 7
    {
      tag: 'gobernanza',

      titulo: 'Presión de inversores',

      desc:
        'Quieren reducir gastos ESG para ganar más dinero.',

      opciones: [

        {
          label: 'Aceptar exigencias',

          hint:
            'Más dividendos, peor reputación',

          dinero: 3000,

          esg: -20,

          msg:
            'Fondos ESG abandonan la empresa.'
        },

        {
          label: 'Buscar equilibrio',

          hint:
            'Acuerdo intermedio',

          dinero: 500,

          esg: -5,

          msg:
            'Nadie queda del todo satisfecho.'
        },

        {
          label: 'Defender estrategia ESG',

          hint:
            'Visión sostenible a largo plazo',

          dinero: -500,

          esg: 15,

          msg:
            'La empresa gana prestigio.'
        }
      ]
    },

    // EVENTO 8
    {
      tag: 'ambiental',

      titulo: 'Inundación en planta industrial',

      desc:
        'Un evento climático afecta tu producción.',

      opciones: [

        {
          label: 'Esperar al seguro',

          hint:
            'Sin actuar directamente',

          dinero: 1000,

          esg: -8,

          msg:
            'La comunidad critica tu pasividad.'
        },

        {
          label: 'Ayudar a empleados',

          hint:
            'Respuesta humana y social',

          dinero: -1200,

          esg: 14,

          msg:
            'La respuesta recibe apoyo público.'
        },

        {
          label: 'Crear fondo climático',

          hint:
            'Inversión estratégica futura',

          dinero: -3000,

          esg: 24,

          msg:
            'Tu empresa lidera adaptación climática.'
        }
      ]
    }
  ];

  ngOnInit() {

    // Al iniciar cargamos primer evento
    this.siguienteEvento();
  }

  siguienteEvento() {

    // Si superamos rondas terminamos juego
    if (this.ronda > this.maxRondas) {

      this.juegoTerminado = true;

      this.eventoActual = null;

      return;
    }

    // Elegimos evento aleatorio
    const idx = Math.floor(
      Math.random() * this.eventos.length
    );

    // Copiamos evento seleccionado
    this.eventoActual = {
      ...this.eventos[idx]
    };

    // Limpiamos mensaje anterior
    this.mensaje = '';
  }

  elegir(opcion: Opcion) {

    // Modificamos dinero según decisión
    this.dinero += opcion.dinero;

    // Modificamos ESG limitando entre 0 y 100
    this.esg = Math.min(
      100,
      Math.max(0, this.esg + opcion.esg)
    );

    // Mostramos mensaje resultado
    this.mensaje = opcion.msg;

    // Pasamos a siguiente ronda
    this.ronda++;

    // Ocultamos evento actual temporalmente
    this.eventoActual = null;

    // Refrescamos vista manualmente
    this.cd.detectChanges();

    // Esperamos antes de mostrar siguiente evento
    setTimeout(() => {

      this.siguienteEvento();

      this.cd.detectChanges();

    }, 800);
  }

  reset() {

    // Reiniciamos valores iniciales
    this.dinero = 10000;

    this.esg = 50;

    this.ronda = 1;

    this.juegoTerminado = false;

    this.mensaje = '';

    this.eventoActual = null;

    // Cargamos nuevo evento
    setTimeout(
      () => this.siguienteEvento(),
      50
    );
  }
}

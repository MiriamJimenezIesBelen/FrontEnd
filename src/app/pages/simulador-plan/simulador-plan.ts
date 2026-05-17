import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-simulador-plan',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './simulador-plan.html',
  styleUrl: './simulador-plan.css'
})
export class SimuladorPlanComponent {

  // Área seleccionada por el usuario
  areaSeleccionada: string = '';

  // Controla si ya se generó el plan
  planGenerado: boolean = false;

  // Guarda el plan mostrado actualmente
  planActual: any = null;

  // Lista de áreas disponibles
  areas = [

    {
      clave: 'energia',

      nombre: 'Energía',

      icono: '⚡'
    },

    {
      clave: 'agua',

      nombre: 'Agua',

      icono: '💧'
    },

    {
      clave: 'residuos',

      nombre: 'Residuos',

      icono: '♻️'
    },

    {
      clave: 'transporte',

      nombre: 'Transporte',

      icono: '🚛'
    },

    {
      clave: 'emisiones',

      nombre: 'Emisiones',

      icono: '🌫️'
    }
  ];

  // Objeto que contiene todos los planes
  // cada área tiene acciones distintas
  planes: any = {

    // PLAN ENERGÍA
    energia: {

      nombre: 'Energía',

      icono: '⚡',

      acciones: [

        {
          titulo:
            'Auditoría energética básica',

          descripcion:
            'Identifica qué máquinas consumen más energía.',

          tiempo:
            '1-2 semanas',

          dificultad:
            'baja'
        },

        {
          titulo:
            'Instalar iluminación LED',

          descripcion:
            'Reduce el consumo eléctrico hasta un 70%.',

          tiempo:
            '2-4 semanas',

          dificultad:
            'baja'
        },

        {
          titulo:
            'Contrato de energía renovable',

          descripcion:
            'Cambiar a electricidad 100% renovable.',

          tiempo:
            '1 mes',

          dificultad:
            'baja'
        }
      ]
    },

    // PLAN AGUA
    agua: {

      nombre: 'Agua',

      icono: '💧',

      acciones: [

        {
          titulo:
            'Instalar contadores por zona',

          descripcion:
            'Permite detectar consumos excesivos y fugas.',

          tiempo:
            '2-3 semanas',

          dificultad:
            'media'
        },

        {
          titulo:
            'Sistema de reutilización',

          descripcion:
            'Reutilizar agua en procesos internos.',

          tiempo:
            '1-3 meses',

          dificultad:
            'alta'
        },

        {
          titulo:
            'Revisión y reparación de fugas',

          descripcion:
            'Evita desperdicio de agua innecesario.',

          tiempo:
            '1 semana',

          dificultad:
            'baja'
        }
      ]
    },

    // PLAN RESIDUOS
    residuos: {

      nombre: 'Residuos',

      icono: '♻️',

      acciones: [

        {
          titulo:
            'Clasificación en origen',

          descripcion:
            'Separar residuos desde producción.',

          tiempo:
            '1-2 semanas',

          dificultad:
            'baja'
        },

        {
          titulo:
            'Gestor autorizado de residuos',

          descripcion:
            'Cumplir normativa y reciclar correctamente.',

          tiempo:
            '2-4 semanas',

          dificultad:
            'media'
        },

        {
          titulo:
            'Reducir embalajes',

          descripcion:
            'Usar menos materiales y materiales reciclados.',

          tiempo:
            '1-2 meses',

          dificultad:
            'media'
        }
      ]
    },

    // PLAN TRANSPORTE
    transporte: {

      nombre: 'Transporte',

      icono: '🚛',

      acciones: [

        {
          titulo:
            'Optimización de rutas',

          descripcion:
            'Reducir kilómetros y combustible.',

          tiempo:
            '2-4 semanas',

          dificultad:
            'media'
        },

        {
          titulo:
            'Consolidación de envíos',

          descripcion:
            'Agrupar pedidos para hacer menos viajes.',

          tiempo:
            '1 mes',

          dificultad:
            'baja'
        },

        {
          titulo:
            'Vehículos eléctricos o híbridos',

          descripcion:
            'Reducir emisiones de transporte.',

          tiempo:
            '2-6 meses',

          dificultad:
            'alta'
        }
      ]
    },

    // PLAN EMISIONES
    emisiones: {

      nombre: 'Emisiones',

      icono: '🌫️',

      acciones: [

        {
          titulo:
            'Calcular huella de carbono',

          descripcion:
            'Medir emisiones actuales de CO₂.',

          tiempo:
            '1-2 semanas',

          dificultad:
            'media'
        },

        {
          titulo:
            'Mantenimiento preventivo',

          descripcion:
            'Mejora eficiencia y reduce emisiones.',

          tiempo:
            '1 mes',

          dificultad:
            'baja'
        },

        {
          titulo:
            'Compensación de emisiones',

          descripcion:
            'Comprar créditos de carbono certificados.',

          tiempo:
            '2-4 semanas',

          dificultad:
            'baja'
        }
      ]
    }
  };

  seleccionar(clave: string) {

    // Guarda el área elegida
    this.areaSeleccionada = clave;
  }

  generarPlan() {

    // Busca el plan según área seleccionada
    this.planActual =
      this.planes[this.areaSeleccionada];

    // Activa vista del plan
    this.planGenerado = true;
  }

  resetear() {

    // Reinicia toda la simulación
    this.areaSeleccionada = '';

    this.planGenerado = false;

    this.planActual = null;
  }
}

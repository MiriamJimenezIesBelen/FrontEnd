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

  areaSeleccionada: string = '';
  planGenerado: boolean = false;
  planActual: any = null;

  areas = [
    { clave: 'energia',   nombre: 'Energía',    icono: '⚡' },
    { clave: 'agua',      nombre: 'Agua',        icono: '💧' },
    { clave: 'residuos',  nombre: 'Residuos',    icono: '♻️' },
    { clave: 'transporte',nombre: 'Transporte',  icono: '🚛' },
    { clave: 'emisiones', nombre: 'Emisiones',   icono: '🌫️' },
  ];

  planes: any = {
    energia: {
      nombre: 'Energía',
      icono: '⚡',
      acciones: [
        {
          titulo: 'Auditoría energética básica',
          descripcion: 'Identifica qué máquinas o procesos consumen más electricidad. Puedes usar un medidor de consumo por enchufe o revisar las facturas por periodos.',
          tiempo: '1-2 semanas',
          dificultad: 'baja'
        },
        {
          titulo: 'Instalar iluminación LED en toda la planta',
          descripcion: 'Sustituir las bombillas tradicionales por LED puede reducir el consumo de iluminación hasta un 70%. Es una de las mejoras con mayor retorno de inversión.',
          tiempo: '2-4 semanas',
          dificultad: 'baja'
        },
        {
          titulo: 'Contrato de energía renovable',
          descripcion: 'Cambia tu contrato eléctrico a una tarifa de energía 100% renovable. Muchas comercializadoras lo ofrecen sin coste adicional significativo.',
          tiempo: '1 mes',
          dificultad: 'baja'
        }
      ]
    },
    agua: {
      nombre: 'Agua',
      icono: '💧',
      acciones: [
        {
          titulo: 'Instalar contadores por zona',
          descripcion: 'Coloca contadores de agua en cada área de la planta para identificar dónde se consume más y detectar posibles fugas.',
          tiempo: '2-3 semanas',
          dificultad: 'media'
        },
        {
          titulo: 'Sistema de reutilización de agua de proceso',
          descripcion: 'Recoge el agua utilizada en procesos de enfriamiento o limpieza para reutilizarla en otros usos no potables dentro de la planta.',
          tiempo: '1-3 meses',
          dificultad: 'alta'
        },
        {
          titulo: 'Revisión y reparación de fugas',
          descripcion: 'Una revisión periódica de tuberías, grifos y válvulas puede detectar fugas que desperdicien cientos de litros al día sin que te des cuenta.',
          tiempo: '1 semana',
          dificultad: 'baja'
        }
      ]
    },
    residuos: {
      nombre: 'Residuos',
      icono: '♻️',
      acciones: [
        {
          titulo: 'Clasificación y separación en origen',
          descripcion: 'Coloca contenedores diferenciados en cada zona de producción para separar plástico, metal, papel y residuos orgánicos desde el momento en que se generan.',
          tiempo: '1-2 semanas',
          dificultad: 'baja'
        },
        {
          titulo: 'Acuerdo con gestor de residuos autorizado',
          descripcion: 'Contrata un gestor de residuos certificado que recoja y recicle correctamente los materiales. Esto también te ayuda a cumplir con la normativa.',
          tiempo: '2-4 semanas',
          dificultad: 'media'
        },
        {
          titulo: 'Plan de reducción de residuos en embalaje',
          descripcion: 'Revisa el embalaje de tus productos y busca alternativas con menos material o materiales reciclados. Pequeños cambios pueden reducir toneladas de residuos al año.',
          tiempo: '1-2 meses',
          dificultad: 'media'
        }
      ]
    },
    transporte: {
      nombre: 'Transporte',
      icono: '🚛',
      acciones: [
        {
          titulo: 'Optimización de rutas de distribución',
          descripcion: 'Usa software de optimización de rutas para reducir kilómetros recorridos. Menos kilómetros significa menos combustible y menos emisiones.',
          tiempo: '2-4 semanas',
          dificultad: 'media'
        },
        {
          titulo: 'Consolidación de envíos',
          descripcion: 'Agrupa pedidos para reducir el número de viajes. Coordinar con clientes para envíos semanales en lugar de diarios puede reducir las emisiones de transporte hasta un 40%.',
          tiempo: '1 mes',
          dificultad: 'baja'
        },
        {
          titulo: 'Evaluar vehículos eléctricos o híbridos',
          descripcion: 'Para flotas de reparto local, los vehículos eléctricos pueden reducir costes operativos y emisiones. Analiza la viabilidad según tus rutas habituales.',
          tiempo: '2-6 meses',
          dificultad: 'alta'
        }
      ]
    },
    emisiones: {
      nombre: 'Emisiones',
      icono: '🌫️',
      acciones: [
        {
          titulo: 'Calcular tu huella de carbono actual',
          descripcion: 'Antes de reducir, necesitas medir. Usa los datos de energía, transporte y producción que ya tienes para calcular tus emisiones totales de CO₂ anuales.',
          tiempo: '1-2 semanas',
          dificultad: 'media'
        },
        {
          titulo: 'Mantenimiento preventivo de maquinaria',
          descripcion: 'Las máquinas mal mantenidas consumen más energía y emiten más. Un plan de mantenimiento regular mejora la eficiencia y reduce emisiones indirectas.',
          tiempo: '1 mes',
          dificultad: 'baja'
        },
        {
          titulo: 'Compensación de emisiones con proyectos certificados',
          descripcion: 'Mientras reduces, puedes compensar las emisiones que no puedes eliminar todavía comprando créditos de carbono de proyectos certificados (reforestación, energías renovables).',
          tiempo: '2-4 semanas',
          dificultad: 'baja'
        }
      ]
    }
  };

  seleccionar(clave: string) {
    this.areaSeleccionada = clave;
  }

  generarPlan() {
    this.planActual = this.planes[this.areaSeleccionada];
    this.planGenerado = true;
  }

  resetear() {
    this.areaSeleccionada = '';
    this.planGenerado = false;
    this.planActual = null;
  }
}

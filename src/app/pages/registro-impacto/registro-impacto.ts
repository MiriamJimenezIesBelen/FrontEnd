import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { EmpresaService } from '../../services/empresa';

@Component({
  selector: 'app-registro-impacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-impacto.html',
  styleUrl: './registro-impacto.css'
})
export class RegistroImpactoComponent implements OnInit, AfterViewInit {

  // Instancia del gráfico
  grafico: any;

  // Control del spinner al guardar
  guardando: boolean = false;

  // Muestra mensaje visual de éxito
  mensajeExito: boolean = false;

  // Modelo del formulario
  impacto = {
    energia: 0,
    agua: 0,
    co2: 0,
    residuos: 0
  };

  // Lista de impactos registrados
  listaImpactos: any[] = [];

  // ID de la empresa logeada
  idEmpresa: number | null = null;

  // Clave única usada para guardar datos
  // así cada empresa tiene sus propios impactos
  private storageKey = 'impactos';

  // Inyectamos servicio de empresa
  constructor(private empresaService: EmpresaService) {}

  ngOnInit() {

    // Sacamos usuario guardado
    const data = localStorage.getItem('usuario');

    if (data) {

      const usuario = JSON.parse(data);

      // Guardamos ID empresa
      this.idEmpresa = usuario.idEmpresa;

      // Creamos clave única por empresa
      this.storageKey =
        `impactos_empresa_${usuario.idEmpresa ?? usuario.nombre}`;

      // Si existe empresa cargamos desde backend
      if (this.idEmpresa) {

        this.cargarDesdeBD();

      } else {

        // Si no hay empresa usamos sessionStorage
        this.cargarDesdeSession();
      }

    } else {

      // Si no hay usuario cargamos desde session
      this.cargarDesdeSession();
    }
  }

  ngAfterViewInit() {

    // Cuando termina de cargar la vista
    // creamos gráfico si hay datos
    if (this.listaImpactos.length) {
      this.crearGrafico();
    }
  }

  // Carga datos desde backend
  cargarDesdeBD() {

    this.empresaService
      .getMediciones(this.idEmpresa!)
      .subscribe({

        next: (data) => {

          // Convertimos strings a números
          this.listaImpactos = data.map(m => ({

            energia: parseFloat(m.energia),

            agua: parseFloat(m.agua),

            co2: parseFloat(m.co2),

            residuos: parseFloat(m.residuos)
          }));

          // Guardamos copia local como cache
          sessionStorage.setItem(
            this.storageKey,
            JSON.stringify(this.listaImpactos)
          );

          // Esperamos al render antes de crear gráfico
          setTimeout(() => this.crearGrafico(), 0);
        },

        // Si backend falla usamos cache local
        error: () => this.cargarDesdeSession()
      });
  }

  cargarDesdeSession() {

    // Leemos impactos guardados localmente
    const data = sessionStorage.getItem(this.storageKey);

    if (data) {

      // Convertimos JSON a array
      this.listaImpactos = JSON.parse(data);

      // Creamos gráfico
      setTimeout(() => this.crearGrafico(), 0);
    }
  }

  guardarImpacto() {

    // Activamos spinner
    this.guardando = true;

    // Si existe empresa guardamos en backend
    if (this.idEmpresa) {

      // Payload enviado a la API
      const payload = {

        idEmpresa: this.idEmpresa,

        energia: this.impacto.energia,

        agua: this.impacto.agua,

        co2: this.impacto.co2,

        residuos: this.impacto.residuos
      };

      // Guardamos medición
      this.empresaService
        .guardarMedicion(payload)
        .subscribe({

          next: () => {

            // Añadimos nuevo impacto al array local
            this.listaImpactos.push({
              ...this.impacto
            });

            // Guardamos cache local
            sessionStorage.setItem(
              this.storageKey,
              JSON.stringify(this.listaImpactos)
            );

            // Mostramos mensaje éxito
            this.mostrarExito();

            // Actualizamos gráfico
            this.crearGrafico();

            // Limpiamos formulario
            this.resetForm();
          },

          error: (err) => {

            console.error(
              'Error al guardar en BD:',
              err
            );

            // Quitamos spinner
            this.guardando = false;

            // No guardamos localmente si backend falla
            alert(
              'Error al guardar. Comprueba tu conexión.'
            );
          }
        });

    } else {

      // Si no hay cuenta guardamos solo en session
      this.guardarEnSession();
    }
  }

  guardarEnSession() {

    // Añadimos nuevo impacto
    this.listaImpactos.push({
      ...this.impacto
    });

    // Guardamos en sessionStorage
    sessionStorage.setItem(
      this.storageKey,
      JSON.stringify(this.listaImpactos)
    );

    // Mostramos éxito
    this.mostrarExito();

    // Actualizamos gráfico
    this.crearGrafico();

    // Reiniciamos formulario
    this.resetForm();
  }

  mostrarExito() {

    // Quitamos spinner
    this.guardando = false;

    // Mostramos mensaje visual
    this.mensajeExito = true;

    // Lo ocultamos tras 3 segundos
    setTimeout(() =>
        this.mensajeExito = false,
      3000
    );
  }

  resetForm() {

    // Reinicia formulario a valores iniciales
    this.impacto = {

      energia: 0,

      agua: 0,

      co2: 0,

      residuos: 0
    };
  }

  crearGrafico() {

    // Si no hay datos no hacemos nada
    if (this.listaImpactos.length === 0) return;

    // Si ya existe gráfico lo destruimos
    // para evitar duplicados
    if (this.grafico) {

      this.grafico.destroy();

      this.grafico = null;
    }

    // Esperamos al render del canvas
    setTimeout(() => {

      // Buscamos canvas HTML
      const canvas = document.getElementById(
        'graficoImpacto'
      ) as HTMLCanvasElement;

      if (!canvas) return;

      // Creamos gráfico de barras
      this.grafico = new Chart(canvas, {

        type: 'bar',

        data: {

          // Etiquetas dinámicas
          labels: this.listaImpactos.map(
            (_, i) => `Registro ${i + 1}`
          ),

          datasets: [

            // Dataset energía
            {
              label: 'Energía',

              data: this.listaImpactos.map(
                i => i.energia
              ),

              backgroundColor:
                'rgba(245,158,11,0.8)'
            },

            // Dataset agua
            {
              label: 'Agua',

              data: this.listaImpactos.map(
                i => i.agua
              ),

              backgroundColor:
                'rgba(59,130,246,0.8)'
            },

            // Dataset CO2
            {
              label: 'CO₂',

              data: this.listaImpactos.map(
                i => i.co2
              ),

              backgroundColor:
                'rgba(107,114,128,0.8)'
            },

            // Dataset residuos
            {
              label: 'Residuos',

              data: this.listaImpactos.map(
                i => i.residuos
              ),

              backgroundColor:
                'rgba(16,185,129,0.8)'
            }
          ]
        },

        options: {

          // Hace gráfico responsive
          responsive: true,

          plugins: {

            // Leyenda abajo
            legend: {
              position: 'bottom'
            }
          }
        }
      });

    }, 0);
  }
}

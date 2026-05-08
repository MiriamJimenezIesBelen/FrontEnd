import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css'
})
export class CalculadoraComponent implements OnInit {

  get unidades() {
    return this.impactos.length;
  }

  get energiaFormateada(): number {
    return this.eficienciaEnergia ?? 0;
  }

  mes: string = '';
  calculado: boolean = false;
  sinDatos: boolean = false;

  impactos: any[] = [];

  // Resultados
  eficienciaEnergia:  number = 0;
  eficienciaAgua:     number = 0;
  eficienciaCo2:      number = 0;
  eficienciaResiduos: number = 0;



  // Semáforos
  semEnergia = '';  textoSemEnergia = '';
  semAgua    = '';  textoSemAgua    = '';
  semCo2     = '';  textoSemCo2     = '';
  semResiduos= '';  textoSemResiduos= '';

  // Conclusión general
  nivelGeneral:       string = '';
  mensajeGeneral:     string = '';
  descripcionGeneral: string = '';

  grafico: any;


  unidadMedida: string = 'unidades';
  tipoActividad: string = 'manufactura';

  // Referencias por unidad (sector manufacturero mediano)
  readonly REF_ENERGIA  = 0.25; // kWh/unidad
  readonly REF_AGUA     = 1.0;  // L/unidad
  readonly REF_CO2      = 0.1;  // kg/unidad
  readonly REF_RESIDUOS = 0.05; // kg/unidad

  ngOnInit() {
    const hoy = new Date();
    this.mes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    // Carga los datos guardados en el navegador
    const data = sessionStorage.getItem('impactos');
    if (data) {
      this.impactos = JSON.parse(data);
    }
    if (!this.impactos.length) {
      this.sinDatos = true;
    }
  }

  calcular() {

    // Si no hay unidades, o son 0, o no hay datos → no hacemos nada
    if (!this.unidades || this.unidades <= 0 || !this.impactos.length) return;


    //  SUMAR TODOS LOS DATOS (de todos los registros)

    // Recorre todos los impactos y suma la energía total
    const totalEnergia  = this.impactos.reduce((suma, item) => suma + (item.energia  || 0), 0);

    // Suma total de agua
    const totalAgua     = this.impactos.reduce((suma, item) => suma + (item.agua     || 0), 0);

    // Suma total de CO2
    const totalCo2      = this.impactos.reduce((suma, item) => suma + (item.co2      || 0), 0);

    // Suma total de residuos
    const totalResiduos = this.impactos.reduce((suma, item) => suma + (item.residuos || 0), 0);


    const factorUnidad =
      this.unidadMedida === 'euros' ? 0.8 :
        this.unidadMedida === 'toneladas' ? 1.2 :
          this.unidadMedida === 'pedidos' ? 1.1 :
            1;


    //  CALCULAR EFICIENCIA (por unidad producida)

    const unidades = this.impactos.length || 1;

    this.eficienciaEnergia  = (totalEnergia / unidades) * factorUnidad;
    this.eficienciaAgua     = (totalAgua / unidades) * factorUnidad;
    this.eficienciaCo2      = (totalCo2 / unidades) * factorUnidad;
    this.eficienciaResiduos = (totalResiduos / unidades) * factorUnidad;
    //  CALCULAR SEMÁFORO (verde, amarillo, rojo)

    // Comparamos la eficiencia con un valor de referencia
    this.semEnergia  = this.calcSemaforo(this.eficienciaEnergia,  this.REF_ENERGIA);
    this.semAgua     = this.calcSemaforo(this.eficienciaAgua,     this.REF_AGUA);
    this.semCo2      = this.calcSemaforo(this.eficienciaCo2,      this.REF_CO2);
    this.semResiduos = this.calcSemaforo(this.eficienciaResiduos, this.REF_RESIDUOS);


    //  CONVERTIR SEMÁFORO A TEXTO

    this.textoSemEnergia  = this.textoSemaforo(this.semEnergia);
    this.textoSemAgua     = this.textoSemaforo(this.semAgua);
    this.textoSemCo2      = this.textoSemaforo(this.semCo2);
    this.textoSemResiduos = this.textoSemaforo(this.semResiduos);


    //  CALCULAR MENSAJE GENERAL
    this.calcularConclusionGeneral();


    // Marcamos que ya se ha calculado
    this.calculado = true;


    //  Esperamos un poco y dibujamos el gráfico
    // (porque Angular necesita tiempo para pintar el HTML)
    setTimeout(() => this.crearGrafico(), 100);
  }

  calcSemaforo(valor: number, referencia: number): string {

    // 🟢 Si estás MUY por debajo del valor ideal → perfecto
    if (valor <= referencia * 0.8) return 'sem-verde';

    // 🟡 Si estás dentro del límite → aceptable
    if (valor <= referencia) return 'sem-amarillo';

    // 🔴 Si te pasas → mal
    return 'sem-rojo';
  }

  textoSemaforo(sem: string): string {
    if (sem === 'sem-verde')    return '✅ Eficiente';
    if (sem === 'sem-amarillo') return '⚠️ Mejorable';
    return '🔴 Por encima';
  }

  calcularConclusionGeneral() {
    // Metemos todos los semaforos en un array, y contamos cuantos hay en rojo y amarillo
    const sems = [this.semEnergia, this.semAgua, this.semCo2, this.semResiduos];
    const rojos    = sems.filter(s => s === 'sem-rojo').length;
    const amarillos = sems.filter(s => s === 'sem-amarillo').length;

    if (rojos === 0 && amarillos <= 1) {
      this.nivelGeneral       = 'verde';
      this.mensajeGeneral     = '🟢 Producción eficiente';
      this.descripcionGeneral = 'Tu empresa está produciendo por debajo de los niveles de referencia. Mantén estas buenas prácticas y sigue registrando para detectar cualquier cambio.';
    } else if (rojos <= 1) {
      this.nivelGeneral       = 'amarillo';
      this.mensajeGeneral     = '🟡 Hay margen de mejora';
      this.descripcionGeneral = 'Algunos indicadores están por encima de los valores recomendados. Revisa el área marcada en rojo y considera usar el Simulador de Plan de Acción.';
    } else {
      this.nivelGeneral       = 'rojo';
      this.mensajeGeneral     = '🔴 Eficiencia por debajo del estándar';
      this.descripcionGeneral = 'Varios indicadores superan los valores de referencia. Te recomendamos generar un Plan de Acción para identificar las mejoras prioritarias.';
    }
  }

  crearGrafico() {

    // Si ya hay un gráfico, lo borramos
    if (this.grafico) this.grafico.destroy();


    // 🏷 Crear etiquetas: Reg.1, Reg.2, Reg.3...
    const labels = this.impactos.map((_, i) => `Reg. ${i + 1}`);


    //  Crear gráfico de barras
    this.grafico = new Chart('graficoEficiencia', {
      type: 'bar',

      data: {
        labels,

        datasets: [

          //  Energía
          {
            label: 'Energía kWh/ud',
            data: this.impactos.map(i => +(i.energia / this.unidades).toFixed(2)),
            backgroundColor: 'rgba(245,158,11,0.7)'
          },

          //  Agua
          {
            label: 'Agua L/ud',
            data: this.impactos.map(i => +(i.agua / this.unidades).toFixed(2)),
            backgroundColor: 'rgba(59,130,246,0.7)'
          },

          //  CO2
          {
            label: 'CO₂ kg/ud',
            data: this.impactos.map(i => +(i.co2 / this.unidades).toFixed(2)),
            backgroundColor: 'rgba(107,114,128,0.7)'
          },

          //  Residuos
          {
            label: 'Residuos kg/ud',
            data: this.impactos.map(i => +(i.residuos / this.unidades).toFixed(2)),
            backgroundColor: 'rgba(16,185,129,0.7)'
          }
        ]
      },

      // ️ Opciones del gráfico
      options: {
        responsive: true, // se adapta a la pantalla
        plugins: { legend: { position: 'bottom' } }, // leyenda abajo
        scales: { y: { beginAtZero: true } } // eje Y empieza en 0
      }
    });
  }
}

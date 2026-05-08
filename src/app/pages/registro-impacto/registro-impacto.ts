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

  grafico: any;
  guardando: boolean = false;
  mensajeExito: boolean = false;

  impacto = { energia: 0, agua: 0, co2: 0, residuos: 0 };
  listaImpactos: any[] = [];
  idEmpresa: number | null = null;

  constructor(private empresaService: EmpresaService) {}

  ngOnInit() {
    // Obtener id empresa del localStorage
    const data = localStorage.getItem('usuario');
    if (data) {
      const usuario = JSON.parse(data);
      this.idEmpresa = usuario.idEmpresa;
      if (this.idEmpresa) {
        this.cargarDesdeBD();
      } else {
        this.cargarDesdeSession();
      }
    } else {
      this.cargarDesdeSession();
    }
  }

  ngAfterViewInit() {
    if (this.listaImpactos.length) {
      this.crearGrafico();
    }
  }

  // Carga desde backend si hay idEmpresa
  cargarDesdeBD() {
    this.empresaService.getMediciones(this.idEmpresa!).subscribe({
      next: (data) => {
        this.listaImpactos = data.map(m => ({
          energia:  parseFloat(m.energia),
          agua:     parseFloat(m.agua),
          co2:      parseFloat(m.co2),
          residuos: parseFloat(m.residuos)
        }));

        sessionStorage.setItem('impactos', JSON.stringify(this.listaImpactos));

        setTimeout(() => this.crearGrafico(), 0);
      },
      error: () => this.cargarDesdeSession()
    });
  }

  cargarDesdeSession() {
    const data = sessionStorage.getItem('impactos');
    if (data) {
      this.listaImpactos = JSON.parse(data);


      setTimeout(() => this.crearGrafico(), 0);
    }
  }

  guardarImpacto() {
    this.guardando = true;

    if (this.idEmpresa) {
      // Guardar en backend
      const payload = {
        idEmpresa: this.idEmpresa,
        energia:   this.impacto.energia,
        agua:      this.impacto.agua,
        co2:       this.impacto.co2,
        residuos:  this.impacto.residuos
      };

      this.empresaService.guardarMedicion(payload).subscribe({
        next: () => {
          this.listaImpactos.push({ ...this.impacto });
          sessionStorage.setItem('impactos', JSON.stringify(this.listaImpactos));
          this.mostrarExito();
          this.crearGrafico();
          this.resetForm();
        },
        error: () => {
          // Si falla el backend, guardamos en session igualmente
          this.guardarEnSession();
        }
      });
    } else {
      this.guardarEnSession();
    }
  }

  guardarEnSession() {
    this.listaImpactos.push({ ...this.impacto });
    sessionStorage.setItem('impactos', JSON.stringify(this.listaImpactos));
    this.mostrarExito();
    this.crearGrafico();
    this.resetForm();
  }

  mostrarExito() {
    this.guardando = false;
    this.mensajeExito = true;
    setTimeout(() => this.mensajeExito = false, 3000);
  }

  resetForm() {
    this.impacto = { energia: 0, agua: 0, co2: 0, residuos: 0 };
  }

  crearGrafico() {
    if (this.listaImpactos.length === 0) return;

    if (this.grafico) {
      this.grafico.destroy();
      this.grafico = null;
    }

    setTimeout(() => {
      const canvas = document.getElementById('graficoImpacto') as HTMLCanvasElement;
      if (!canvas) return;

      this.grafico = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.listaImpactos.map((_, i) => `Registro ${i + 1}`),
          datasets: [
            { label: 'Energía',  data: this.listaImpactos.map(i => i.energia),  backgroundColor: 'rgba(245,158,11,0.8)' },
            { label: 'Agua',     data: this.listaImpactos.map(i => i.agua),     backgroundColor: 'rgba(59,130,246,0.8)'  },
            { label: 'CO₂',      data: this.listaImpactos.map(i => i.co2),      backgroundColor: 'rgba(107,114,128,0.8)' },
            { label: 'Residuos', data: this.listaImpactos.map(i => i.residuos), backgroundColor: 'rgba(16,185,129,0.8)'  }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });

    }, 0);
  }
}

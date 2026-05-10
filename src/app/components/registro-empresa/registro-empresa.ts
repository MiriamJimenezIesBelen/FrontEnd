import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Empresa } from '../../models/empresa.model';
import { EmpresaService } from '../../services/empresa';

@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-empresa.html',
  styleUrl: './registro-empresa.css'
})
export class RegistroEmpresaComponent {

  nuevaEmpresa: Empresa = {
    numeroRegistro: '',
    nombre: '',
    sector: '',
    pais: '',
    ciudad: '',
    tamano: 'mediana',
    correoContacto: '',
    password: ''
  };

  guardando    = false;
  toastVisible = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.guardando) return;
    this.guardando = true;

    this.empresaService.saveEmpresa(this.nuevaEmpresa).subscribe({
      next: (data) => {
        // ── Guardar en localStorage con los campos que necesita el dashboard ──
        // El backend devuelve el objeto Empresa guardado; nos aseguramos
        // de que idEmpresa esté presente para el storageKey del dashboard.
        localStorage.setItem('usuario', JSON.stringify({
          idEmpresa: data.idEmpresa ?? data.id,   // según cómo lo llame tu backend
          nombre:    data.nombre,
          sector:    data.sector,
          rol:       data.rol ?? 'USER'
        }));

        this.guardando = false;
        this.mostrarToast(`✅ ¡Empresa "${this.nuevaEmpresa.nombre}" creada con éxito!`, 'success');

        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (err) => {
        console.error('Error al guardar la empresa:', err);
        this.guardando = false;
        this.mostrarToast('❌ Error al crear la empresa. Comprueba los datos e inténtalo de nuevo.', 'error');
      }
    });
  }

  private mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje  = mensaje;
    this.toastTipo     = tipo;
    this.toastVisible  = true;
    setTimeout(() => { this.toastVisible = false; }, 3500);
  }

  limpiarFormulario() {
    this.nuevaEmpresa = {
      numeroRegistro: '',
      nombre: '',
      sector: '',
      pais: '',
      ciudad: '',
      tamano: 'mediana',
      correoContacto: '',
      password: ''
    };
  }
}

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

  // Objeto con los datos del formulario, vacío por defecto
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

  // true mientras se está enviando el formulario (evita doble envío)
  guardando    = false;
  toastVisible = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  constructor(
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  // Se ejecuta al enviar el formulario
  onSubmit() {
    // Si ya se está guardando, ignoramos clicks extra
    if (this.guardando) return;
    this.guardando = true;

    // Guardamos el password antes del subscribe porque después del registro
    // lo necesitamos para hacer login automático, y el objeto puede haber cambiado
    const password = this.nuevaEmpresa.password ?? '';

    // Paso 1: registrar la empresa en el backend
    this.empresaService.saveEmpresa(this.nuevaEmpresa).subscribe({
      next: (data) => {
        // Paso 2: si el registro fue bien, hacemos login automático
        // para obtener el token sin que el usuario tenga que volver a loguearse
        this.empresaService.login(this.nuevaEmpresa.correoContacto, password).subscribe({
          next: (loginData) => {
            // Guardamos el token y los datos del usuario en localStorage
            // ?? significa "si el valor de la izquierda es null/undefined, usa el de la derecha"
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('usuario', JSON.stringify({
              idEmpresa: loginData.idEmpresa ?? data.idEmpresa,
              nombre:    loginData.nombre    ?? data.nombre,
              sector:    loginData.sector    ?? data.sector,
              rol:       loginData.rol       ?? 'USER'
            }));

            this.guardando = false;
            this.mostrarToast(`✅ ¡Empresa "${this.nuevaEmpresa.nombre}" creada con éxito!`, 'success');
            // Esperamos 2s para que el usuario lea el mensaje antes de redirigir
            setTimeout(() => this.router.navigate(['/dashboard']), 2000);
          },
          // Si el login automático falla (raro), mandamos al login manual
          error: () => {
            this.guardando = false;
            this.mostrarToast('✅ Cuenta creada. Inicia sesión.', 'success');
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        });
      },
      // Si el registro falla (correo duplicado, datos inválidos, etc.)
      error: (err) => {
        console.error('Error al guardar la empresa:', err);
        this.guardando = false;
        this.mostrarToast('❌ Error al crear la empresa. Comprueba los datos e inténtalo de nuevo.', 'error');
      }
    });
  }

  // Muestra una notificación temporal y la oculta a los 3.5 segundos
  private mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje  = mensaje;
    this.toastTipo     = tipo;
    this.toastVisible  = true;
    setTimeout(() => { this.toastVisible = false; }, 3500);
  }

  // Resetea el formulario a sus valores vacíos iniciales
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

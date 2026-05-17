import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services/empresa';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {

  // Datos introducidos en el formulario
  correo = '';
  password = '';

  // Controla mensaje de error en login
  error = false;

  // Controla spinner de carga
  cargando = false;

  // Inyectamos router para navegar entre páginas
  // empresaService para hacer login
  // auth para comprobar sesión
  constructor(
    private router: Router,
    private empresaService: EmpresaService,
    private auth: AuthService
  ) {}

  ngOnInit() {

    // Si ya hay sesión iniciada
    // redirigimos directamente al dashboard
    if (this.auth.isLogged()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {

    // Reiniciamos posibles errores anteriores
    this.error = false;

    // Activamos spinner mientras carga
    this.cargando = true;

    // Llamada al backend para iniciar sesión
    this.empresaService
      .login(this.correo, this.password)
      .subscribe({

        // Si login va bien
        next: (response) => {

          // Guardamos token JWT
          localStorage.setItem('token', response.token);

          // Guardamos datos básicos del usuario
          localStorage.setItem(
            'usuario',
            JSON.stringify({

              idEmpresa: response.idEmpresa,
              nombre: response.nombre,
              sector: response.sector,
              rol: response.rol
            })
          );

          // Lanzamos evento storage manualmente
          // para actualizar navbar u otros componentes
          window.dispatchEvent(new Event('storage'));

          // Si es admin va al panel admin
          if (response.rol === 'ADMIN') {

            this.router.navigate(['/admin']);

          } else {

            // Si no es admin va al dashboard normal
            this.router.navigate(['/dashboard']);
          }
        },

        // Si el login falla
        error: () => {

          // Quitamos spinner
          this.cargando = false;

          // Activamos mensaje de error
          this.error = true;
        }
      });
  }
}

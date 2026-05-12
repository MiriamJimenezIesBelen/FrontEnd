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

  correo   = '';
  password = '';
  error    = false;
  cargando = false;

  constructor(
    private router: Router,
    private empresaService: EmpresaService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // Si ya hay sesión activa, redirigir directamente
    if (this.auth.isLogged()) {
      const u = this.auth.getUser();
      if (u?.rol === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  login() {
    this.error    = false;
    this.cargando = true;

    this.empresaService.login(this.correo, this.password).subscribe({
      next: (response) => {
        this.cargando = false;

        // Guardar token y datos del usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify({
          idEmpresa: response.idEmpresa,
          nombre:    response.nombre,
          sector:    response.sector,
          rol:       response.rol
        }));

        // Limpiar sessionStorage de sesiones anteriores para que
        // el dashboard cargue datos frescos del usuario que acaba de entrar
        sessionStorage.clear();

        // Notificar al header para que se actualice
        window.dispatchEvent(new Event('storage'));

        if (response.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.cargando = false;
        this.error    = true;
      }
    });
  }
}

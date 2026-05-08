import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
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
export class LoginComponent {

  correo = '';
  password = '';
  error = false;

  constructor(private router: Router,
              private empresaService: EmpresaService,
              private auth: AuthService) {
  }

  ngOnInit() {
    if (this.auth.isLogged()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {

    // esto hace una peticion al backend
    this.empresaService.login(this.correo, this.password).subscribe({
      next: (response) => {
        // Guarda el token y los datos del usuario
        localStorage.setItem('token', response.token);
        // Si todo va bien el backend develve un token
        localStorage.setItem('usuario', JSON.stringify({
          idEmpresa: response.idEmpresa,
          nombre:    response.nombre,
          sector:    response.sector,
          rol:       response.rol
        }));

        window.dispatchEvent(new Event('storage'));

        if (response.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.error = true;
      }
    });
  }
}

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

  correo = '';
  password = '';
  error = false;
  cargando = false; // NUEVO

  constructor(private router: Router,
              private empresaService: EmpresaService,
              private auth: AuthService) {}

  ngOnInit() {
    if (this.auth.isLogged()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    this.error = false;
    this.cargando = true; // NUEVO: activar spinner al pulsar

    this.empresaService.login(this.correo, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
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
        this.cargando = false; // NUEVO: apagar spinner si hay error
        this.error = true;
      }
    });
  }
}

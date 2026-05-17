import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit, AfterViewInit {

  isLoggedIn    = false;
  nombreEmpresa = '';
  menuAbierto   = false;
  dropdownAbierto = false;
  dropdownActivo = false;

  @ViewChild('navScroll') navScrollRef!: ElementRef<HTMLElement>;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.checkLogin();
    window.addEventListener('storage', () => this.checkLogin());

    // ← AÑADE ESTO: fuerza recheck en cada navegación
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLogin();
        this.menuAbierto = false;
      });
  }

  ngAfterViewInit() {
    setTimeout(() => this.updateScrollState(), 100);
  }

  checkLogin() {
    if (!this.auth.isLogged()) {
      this.isLoggedIn    = false;
      this.nombreEmpresa = '';
      return;
    }
    const usuario = this.auth.getUser();
    if (usuario) {
      this.isLoggedIn    = true;
      this.nombreEmpresa = usuario.nombre || 'Empresa';
    } else {
      this.isLoggedIn = false;
    }
  }

  logout() {
    this.auth.logout();
    sessionStorage.clear();
    this.isLoggedIn    = false;
    this.nombreEmpresa = '';
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }


  private updateScrollState() {
    const el = this.navScrollRef?.nativeElement;
    if (!el) return;
  }
}

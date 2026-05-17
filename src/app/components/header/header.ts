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

  // Estado del usuario y del menú
  isLoggedIn      = false;  // true si hay sesión activa
  nombreEmpresa   = '';     // nombre que se muestra en el header
  menuAbierto     = false;  // controla si el menú móvil está visible
  dropdownAbierto = false;  // controla si el dropdown de Herramientas está abierto
  dropdownActivo  = false;  // true si alguna ruta del dropdown está activa (para resaltar el botón)

  // Referencia al elemento de scroll del nav, por si en el futuro
  // se necesita controlar el scroll horizontal de la barra de navegación
  @ViewChild('navScroll') navScrollRef!: ElementRef<HTMLElement>;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    // Comprobamos si hay sesión al cargar el header por primera vez
    this.checkLogin();

    // Si en otra pestaña del navegador se hace login o logout,
    // el evento 'storage' lo detecta y actualiza el header automáticamente
    window.addEventListener('storage', () => this.checkLogin());

    // Cada vez que el usuario navega a otra página, volvemos a comprobar
    // la sesión y cerramos el menú móvil si estaba abierto
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLogin();
        this.menuAbierto = false;
      });
  }

  ngAfterViewInit() {
    // Esperamos 100ms después de que el HTML esté listo antes de
    // intentar acceder al elemento de scroll (evita errores de timing)
    setTimeout(() => this.updateScrollState(), 100);
  }

  // Comprueba si hay una sesión válida y actualiza las variables del header
  checkLogin() {
    if (!this.auth.isLogged()) {
      // Si no hay sesión (token inválido o expirado), limpiamos todo
      this.isLoggedIn    = false;
      this.nombreEmpresa = '';
      return;
    }
    // Si hay sesión, leemos los datos del usuario del localStorage
    const usuario = this.auth.getUser();
    if (usuario) {
      this.isLoggedIn    = true;
      this.nombreEmpresa = usuario.nombre || 'Empresa'; // fallback por si no tiene nombre
    } else {
      // Caso raro: hay token pero no hay datos de usuario guardados
      this.isLoggedIn = false;
    }
  }

  // Cierra la sesión: limpia el token, borra sessionStorage y manda al usuario a /home
  logout() {
    this.auth.logout();       // elimina token y usuario del localStorage
    sessionStorage.clear();   // limpia también los datos cacheados de mediciones, etc.
    this.isLoggedIn    = false;
    this.nombreEmpresa = '';
    this.router.navigate(['/home']);
  }

  // Abre o cierra el menú móvil al pulsar el botón hamburguesa
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // Función preparada para controlar el estado del scroll del nav
  // De momento no hace nada, pero está lista por si se añade
  // lógica para mostrar/ocultar flechas de scroll en el futuro
  private updateScrollState() {
    const el = this.navScrollRef?.nativeElement;
    if (!el) return;
  }
}

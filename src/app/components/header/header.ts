import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoggedIn    = false;
  nombreEmpresa = '';
  menuAbierto   = false;
  atStart       = true;
  atEnd         = false;

  @ViewChild('navScroll') navScrollRef!: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.checkLogin();
    window.addEventListener('storage', () => this.checkLogin());

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLogin();
        this.menuAbierto = false;
        // Esperamos a que Angular actualice el DOM tras cambio de ruta
        setTimeout(() => this.updateScrollState(), 80);
      });
  }

  ngAfterViewInit() {
    // Primer cálculo una vez el DOM está pintado
    this.scheduleScrollUpdate();

    // Recalcula si el contenedor cambia de tamaño (ej. resize de ventana)
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateScrollState());
      const wrap = this.navScrollRef?.nativeElement?.closest('.nav-desktop-wrap');
      if (wrap) this.resizeObserver.observe(wrap);
    }

    // Fallback: escucha resize de ventana también
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('storage', () => this.checkLogin());
  }

  // ── Auth ────────────────────────────────────────────────────────────────

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

  // ── Menú móvil ──────────────────────────────────────────────────────────

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // ── Scroll del nav desktop ──────────────────────────────────────────────

  scrollNav(amount: number) {
    const el = this.navScrollRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    // Actualiza estado tras la animación de scroll suave (~350 ms)
    setTimeout(() => this.updateScrollState(), 360);
  }

  onNavScroll(event: Event) {
    const el = event.target as HTMLElement;
    this.setScrollState(el);
  }

  // ── Helpers privados ────────────────────────────────────────────────────

  private onWindowResize = () => this.updateScrollState();

  private scheduleScrollUpdate() {
    // requestAnimationFrame garantiza que el layout ya está calculado
    requestAnimationFrame(() => {
      this.updateScrollState();
      // Segunda pasada por si las fuentes/imágenes aún no cargaron
      setTimeout(() => this.updateScrollState(), 300);
    });
  }

  private updateScrollState() {
    const el = this.navScrollRef?.nativeElement;
    if (!el) return;
    this.setScrollState(el);
  }

  private setScrollState(el: HTMLElement) {
    const scrollLeft   = Math.round(el.scrollLeft);
    const maxScroll    = el.scrollWidth - el.clientWidth;

    this.atStart = scrollLeft <= 4;
    this.atEnd   = maxScroll <= 0 || scrollLeft >= maxScroll - 4;

    // Fuerza detección de cambios si el componente usa OnPush en el futuro
    this.cdr.markForCheck();
  }
}

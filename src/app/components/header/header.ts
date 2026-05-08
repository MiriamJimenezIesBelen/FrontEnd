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
  atStart       = true;
  atEnd         = false;

  @ViewChild('navScroll') navScrollRef!: ElementRef<HTMLElement>;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.checkLogin();
    window.addEventListener('storage', () => this.checkLogin());
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLogin();
        this.menuAbierto = false;
        setTimeout(() => this.updateScrollState(), 50);
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

  scrollNav(amount: number) {
    const el = this.navScrollRef?.nativeElement;
    if (el) el.scrollLeft += amount;
  }

  onNavScroll(event: Event) {
    const el = event.target as HTMLElement;
    this.atStart = el.scrollLeft <= 4;
    this.atEnd   = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
  }

  private updateScrollState() {
    const el = this.navScrollRef?.nativeElement;
    if (!el) return;
    this.atStart = el.scrollLeft <= 4;
    this.atEnd   = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
  }
}

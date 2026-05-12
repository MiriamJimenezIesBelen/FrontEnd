import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  isLogged(): boolean {
    const token = localStorage.getItem('token');

    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

      // Si ha expirado → logout automático
      if (Date.now() > exp) {
        this.logout();
        return false;
      }

      return true;

    } catch (e) {
      this.logout();
      return false;
    }
  }

  getUser() {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getStorageKey(): string {
    return 'usuario';
  }
}

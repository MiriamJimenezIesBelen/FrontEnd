import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  isLogged(): boolean {
    const token = localStorage.getItem('token');

    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

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

  /**
   * Clave de sessionStorage específica para cada empresa.
   * Usada tanto en el dashboard como en el informe PDF para que
   * siempre lean los datos del usuario que ha iniciado sesión.
   */
  getStorageKey(): string {
    const u = this.getUser();
    if (!u) return 'impactos_anonimo';
    return `impactos_empresa_${u.idEmpresa ?? u.nombre}`;
  }

  logout() {
    // Obtener la clave ANTES de borrar el usuario del localStorage
    const key = this.getStorageKey();

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    // Limpiar la caché de mediciones de esta empresa
    if (key !== 'impactos_anonimo') {
      sessionStorage.removeItem(key);
    }
  }
}

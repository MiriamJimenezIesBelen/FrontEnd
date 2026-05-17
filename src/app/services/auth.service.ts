import { Injectable } from '@angular/core';

// Servicio global de autenticación
// disponible en toda la app (singleton)
@Injectable({ providedIn: 'root' })
export class AuthService {

  isLogged(): boolean {

    // Recupera token guardado en localStorage
    const token = localStorage.getItem('token');

    // Si no hay token → no está logueado
    if (!token) return false;

    try {

      // Decodifica payload del JWT
      // (segunda parte del token)
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      // Fecha de expiración del token (en ms)
      const exp = payload.exp * 1000;

      // Si el token ya expiró
      // hacemos logout automático
      if (Date.now() > exp) {

        this.logout();

        return false;
      }

      // Token válido
      return true;

    } catch (e) {

      // Si el token está corrupto o mal formado
      this.logout();

      return false;
    }
  }

  getUser() {

    // Recupera usuario guardado en localStorage
    const data = localStorage.getItem('usuario');

    // Si existe lo parsea a objeto
    return data ? JSON.parse(data) : null;
  }

  logout() {

    // Limpia sesión completamente
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getStorageKey(): string {

    // Obtiene usuario actual
    const usuario = this.getUser();

    // Si no hay usuario usa clave genérica
    if (!usuario) {
      return 'impactos';
    }

    // Genera clave única por empresa
    // para separar datos en sessionStorage
    return `impactos_empresa_${
      usuario.idEmpresa ?? usuario.nombre
    }`;
  }
}

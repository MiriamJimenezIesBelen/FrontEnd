import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// Guarda de ruta: bloquea el acceso a rutas protegidas si no hay sesión activa
export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  // Comprobamos si hay datos de usuario guardados en localStorage
  const logged = localStorage.getItem('usuario');

  // Si existe, dejamos pasar
  if (logged) {
    return true;
  }

  // Si no hay sesión, redirigimos al login y bloqueamos la ruta
  router.navigate(['/login']);
  return false;

};

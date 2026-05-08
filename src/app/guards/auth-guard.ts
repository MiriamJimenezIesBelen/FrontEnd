import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// Permitir acceso a una ruta solo si el usuario esta logueado
export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const logged = localStorage.getItem('usuario');

  if (logged) {
    return true;
  }

  router.navigate(['/login']);
  return false;

};

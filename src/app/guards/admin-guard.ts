import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// Esto controla quien puede acceder a ciertas paginas
export const AdminGuard: CanActivateFn = () => {

  const router = inject(Router);

  const data = localStorage.getItem('usuario');

  if (!data) {
    router.navigate(['/login']);
    return false;
  }

  const usuario = JSON.parse(data);

  // Solo si le usuario tiene rol admin
  if (usuario.rol === 'ADMIN') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

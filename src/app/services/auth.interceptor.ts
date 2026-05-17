import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor global de Angular
// se ejecuta automáticamente en cada petición HTTP
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Sacamos token guardado en localStorage
  const token = localStorage.getItem('token');

  // Si existe token
  if (token) {

    // Clonamos petición original
    // porque las requests son inmutables
    const cloned = req.clone({

      // Añadimos cabecera Authorization
      // formato requerido por JWT
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });

    // Continuamos petición modificada
    return next(cloned);
  }

  // Si no hay token
  // enviamos petición normal
  return next(req);
};

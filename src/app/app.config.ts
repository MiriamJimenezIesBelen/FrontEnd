import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Configuración global de la aplicación Angular
// aquí se registran router, HTTP client e interceptores
export const appConfig: ApplicationConfig = {

  providers: [

    // Configura las rutas de la app
    provideRouter(routes),

    // Activa HttpClient y añade interceptores globales
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};

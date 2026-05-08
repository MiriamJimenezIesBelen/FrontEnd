import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AdminComponent } from './pages/admin/admin';
import { AdminGuard } from './guards/admin-guard';
import { CalculadoraComponent } from './pages/calculadora/calculadora';
import { InformePdfComponent } from './pages/informe-pdf/informe-pdf';
import { ComunidadComponent } from './pages/comunidad/comunidad';
import { BuscadorProveedoresComponent } from './pages/buscador-proveedores/buscador-proveedores';
import { RankingComponent } from './pages/ranking/ranking';

import { authGuard } from './guards/auth-guard';
import { RegistroImpactoComponent } from './pages/registro-impacto/registro-impacto';
import { SimuladorPlanComponent } from './pages/simulador-plan/simulador-plan';

export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  { path: 'registro-impacto', component: RegistroImpactoComponent, canActivate: [authGuard] },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard]
  },

  { path: 'simulador-plan', component: SimuladorPlanComponent, canActivate: [authGuard] },

  { path: 'calculadora', component: CalculadoraComponent, canActivate: [authGuard] },
  { path: 'informe-pdf', component: InformePdfComponent, canActivate: [authGuard] },

  { path: 'comunidad', component: ComunidadComponent },
  { path: 'buscador-proveedores', component: BuscadorProveedoresComponent, canActivate: [authGuard] },

  { path: 'ranking', component: RankingComponent, canActivate: [authGuard] },

  {
    path: 'objetivos',
    loadComponent: () =>
      import('./pages/objetivos/objetivos').then(m => m.ObjetivosComponent)
  },

  {
    path: 'simulador-esg',
    loadComponent: () =>
      import('./pages/simulador-esg/simulador-esg')
        .then(m => m.SimuladorEsgComponent)
  }

];

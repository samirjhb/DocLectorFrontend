import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'resultado',
    loadComponent: () =>
      import('./pages/resultado/resultado.component').then((m) => m.ResultadoComponent),
  },
  { path: '**', redirectTo: '' },
];

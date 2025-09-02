import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/raffle/raffle.component').then(c => c.RaffleComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

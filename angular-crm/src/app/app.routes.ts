import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'crm',
        loadComponent: () => import('./pages/crm/crm.component').then((m) => m.CrmComponent),
      },
      {
        path: 'leads',
        loadComponent: () => import('./pages/leads/leads.component').then((m) => m.LeadsComponent),
      },
      {
        path: 'oportunidades',
        loadComponent: () =>
          import('./pages/oportunidades/oportunidades.component').then(
            (m) => m.OportunidadesComponent,
          ),
      },
      {
        path: 'empresas',
        loadComponent: () =>
          import('./pages/empresas/empresas.component').then((m) => m.EmpresasComponent),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

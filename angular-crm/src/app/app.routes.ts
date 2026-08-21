import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'trocar-senha',
    loadComponent: () =>
      import('./pages/trocar-senha/trocar-senha.component').then((m) => m.TrocarSenhaComponent),
  },
  {
    path: 'esqueci-senha',
    loadComponent: () =>
      import('./pages/esqueci-senha/esqueci-senha.component').then((m) => m.EsqueciSenhaComponent),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./pages/redefinir-senha/redefinir-senha.component').then(
        (m) => m.RedefinirSenhaComponent,
      ),
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
        path: 'empresas/:id/web-widget',
        loadComponent: () =>
          import('./pages/empresas/tenant-web-widget/tenant-web-widget.component').then(
            (m) => m.TenantWebWidgetComponent,
          ),
      },
      {
        path: 'empresas/:id/usuarios',
        loadComponent: () =>
          import('./pages/empresas/tenant-users/tenant-users.component').then(
            (m) => m.TenantUsersComponent,
          ),
      },
      {
        path: 'configuracoes',
        loadComponent: () =>
          import('./pages/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
      },
      {
        path: 'motivos',
        loadComponent: () =>
          import('./pages/motivos/motivos.component').then((m) => m.MotivosComponent),
      },
      {
        path: 'cadastros',
        loadComponent: () =>
          import('./pages/cadastros/cadastros.component').then((m) => m.CadastrosComponent),
      },
      {
        path: 'acessos',
        loadComponent: () =>
          import('./pages/acessos/acessos.component').then((m) => m.AcessosComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

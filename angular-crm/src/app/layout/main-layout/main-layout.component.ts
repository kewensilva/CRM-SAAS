import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

const TENANT_BASE_MENU_ITEMS: MenuItem[] = [
  { label: 'Painel', route: '/dashboard', icon: 'assets/icons/icon-line-alt.svg' },
  { label: 'CRM', route: '/crm', icon: 'assets/icons/icon-group.svg' },
  { label: 'Leads', route: '/leads', icon: 'assets/icons/icon-filter-alt.svg' },
  { label: 'Oportunidades', route: '/oportunidades', icon: 'assets/icons/icon-send.svg' },
];

// Motivos e Cadastros são administrativos — só o Tenant Admin gerencia (Manager/User
// só operam leads/negociações no dia a dia, ver permissions.md).
const TENANT_ADMIN_ONLY_ITEMS: MenuItem[] = [
  { label: 'Motivos', route: '/motivos', icon: 'assets/icons/icon-filter-alt.svg' },
  { label: 'Cadastros', route: '/cadastros', icon: 'assets/icons/icon-group.svg' },
];

const OWNER_MENU_ITEMS: MenuItem[] = [
  { label: 'Painel', route: '/dashboard', icon: 'assets/icons/icon-line-alt.svg' },
  { label: 'Empresas', route: '/empresas', icon: 'assets/icons/icon-group.svg' },
  { label: 'Motivos', route: '/motivos', icon: 'assets/icons/icon-filter-alt.svg' },
  { label: 'Cadastros', route: '/cadastros', icon: 'assets/icons/icon-group.svg' },
];

// Só existe para o perfil Analista: escolher/trocar qual base de cliente ele está
// acessando no momento (ver core/auth/tenant-switch.service.ts).
const ACESSOS_ITEM: MenuItem = {
  label: 'Acessos',
  route: '/acessos',
  icon: 'assets/icons/icon-send.svg',
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly isCollapsed = signal(false);
  readonly isMobileMenuOpen = signal(false);

  constructor(
    private readonly session: SessionService,
    private readonly authService: AuthService,
  ) {}

  toggleSidebar(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  readonly menuItems = computed<MenuItem[]>(() => {
    if (this.session.isOwner()) {
      return OWNER_MENU_ITEMS;
    }

    // Analista ainda não escolheu uma base de cliente — só pode ver o seletor de acessos.
    if (this.session.isAnalystBase()) {
      return [ACESSOS_ITEM];
    }

    const profile = this.session.profile();
    const items =
      profile === 'TENANT_ADMIN' ? [...TENANT_BASE_MENU_ITEMS, ...TENANT_ADMIN_ONLY_ITEMS] : TENANT_BASE_MENU_ITEMS;

    // Analista já dentro de um tenant (trocou de contexto) opera como Tenant Admin, mas
    // ganha de volta o item pra trocar de base de cliente.
    return this.session.isAnalystSession() ? [...items, ACESSOS_ITEM] : items;
  });

  readonly settingsItem: MenuItem = {
    label: 'Configurações',
    route: '/configuracoes',
    icon: 'assets/icons/icon-setting-line.svg',
  };

  // Configurações é restrito a Tenant Admin no backend (permissions.md > Configurações:
  // Manager e User "Sem acesso") — o menu tinha ficado visível pra todo mundo, inclusive
  // vendedor (User), que via o botão mas caía em 403 ao tentar usar.
  readonly showSettings = computed<boolean>(() => this.session.profile() === 'TENANT_ADMIN');
}

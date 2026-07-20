import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { SessionService } from '../../core/auth/session.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

const TENANT_MENU_ITEMS: MenuItem[] = [
  { label: 'Painel', route: '/dashboard', icon: 'assets/icons/icon-line-alt.svg' },
  { label: 'CRM', route: '/crm', icon: 'assets/icons/icon-group.svg' },
  { label: 'Leads', route: '/leads', icon: 'assets/icons/icon-filter-alt.svg' },
  { label: 'Oportunidades', route: '/oportunidades', icon: 'assets/icons/icon-send.svg' },
];

const OWNER_MENU_ITEMS: MenuItem[] = [
  { label: 'Painel', route: '/dashboard', icon: 'assets/icons/icon-line-alt.svg' },
  { label: 'Empresas', route: '/empresas', icon: 'assets/icons/icon-group.svg' },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly isCollapsed = signal(false);

  constructor(private readonly session: SessionService) {}

  toggleSidebar(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  readonly menuItems = computed<MenuItem[]>(() =>
    this.session.isOwner() ? OWNER_MENU_ITEMS : TENANT_MENU_ITEMS,
  );

  readonly settingsItem: MenuItem = {
    label: 'Configurações',
    route: '/configuracoes',
    icon: 'assets/icons/icon-setting-line.svg',
  };
}

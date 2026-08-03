import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { TenantSwitchService } from '../../core/auth/tenant-switch.service';
import { AnalystTenantAccess } from '../../models/analyst.model';

@Component({
  selector: 'app-acessos',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './acessos.component.html',
  styleUrl: './acessos.component.scss',
})
export class AcessosComponent implements OnInit {
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly tenants = signal<AnalystTenantAccess[]>([]);
  readonly switching = signal<string | null>(null);

  constructor(
    private readonly tenantSwitchService: TenantSwitchService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.tenantSwitchService.myTenantAccess().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar suas empresas de acesso.');
        this.loading.set(false);
      },
    });
  }

  selectTenant(tenantId: string): void {
    this.switching.set(tenantId);
    this.errorMessage.set(null);

    this.tenantSwitchService.switchTenant(tenantId).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.switching.set(null);
        this.errorMessage.set('Não foi possível acessar esta empresa.');
      },
    });
  }
}

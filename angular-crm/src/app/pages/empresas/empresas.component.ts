import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { TenantsService } from '../../core/tenants/tenants.service';
import { Tenant } from '../../models/tenant.model';
import { CreateTenantDialogComponent } from './create-tenant-dialog/create-tenant-dialog.component';
import {
  DeleteTenantDialogComponent,
  DeleteTenantDialogData,
} from './delete-tenant-dialog/delete-tenant-dialog.component';
import {
  EditTenantDialogComponent,
  EditTenantDialogData,
} from './edit-tenant-dialog/edit-tenant-dialog.component';

const DISPLAYED_COLUMNS = ['name', 'tradeName', 'domain', 'status', 'actions'];

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatTableModule, MatTooltipModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.scss',
})
export class EmpresasComponent implements OnInit {
  readonly displayedColumns = DISPLAYED_COLUMNS;
  readonly tenants = signal<Tenant[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly togglingId = signal<string | null>(null);

  constructor(
    private readonly tenantsService: TenantsService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.tenantsService.list().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar as empresas.');
        this.loading.set(false);
      },
    });
  }

  toggleStatus(tenant: Tenant): void {
    const nextStatus = tenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.togglingId.set(tenant.id);

    this.tenantsService.update(tenant.id, { status: nextStatus }).subscribe({
      next: (updated) => {
        this.replaceTenant(updated);
        this.togglingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Não foi possível alterar o status da empresa.');
        this.togglingId.set(null);
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open<CreateTenantDialogComponent, undefined, Tenant>(
      CreateTenantDialogComponent,
      { width: '480px' },
    );

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.tenants.update((list) => [created, ...list]);
      }
    });
  }

  openEditDialog(tenant: Tenant): void {
    const dialogRef = this.dialog.open<EditTenantDialogComponent, EditTenantDialogData, Tenant>(
      EditTenantDialogComponent,
      { width: '480px', data: { tenant } },
    );

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.replaceTenant(updated);
      }
    });
  }

  openDeleteDialog(tenant: Tenant): void {
    const dialogRef = this.dialog.open<
      DeleteTenantDialogComponent,
      DeleteTenantDialogData,
      boolean
    >(DeleteTenantDialogComponent, { width: '420px', data: { tenant } });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.tenantsService.remove(tenant.id).subscribe({
        next: () => {
          this.tenants.update((list) => list.filter((item) => item.id !== tenant.id));
        },
        error: () => {
          this.errorMessage.set('Não foi possível excluir a empresa.');
        },
      });
    });
  }

  openWidgetConfig(tenant: Tenant): void {
    this.router.navigate(['/empresas', tenant.id, 'web-widget']);
  }

  openUsers(tenant: Tenant): void {
    this.router.navigate(['/empresas', tenant.id, 'usuarios']);
  }

  private replaceTenant(updated: Tenant): void {
    this.tenants.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
  }
}

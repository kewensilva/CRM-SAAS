import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CreateTenantUserPayload,
  TenantUserProfile,
  TenantsService,
} from '../../../core/tenants/tenants.service';
import { Tenant, TenantUser } from '../../../models/tenant.model';

const PROFILE_OPTIONS: { value: TenantUserProfile; label: string }[] = [
  { value: 'TENANT_ADMIN', label: 'Administrador' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'USER', label: 'Vendedor' },
];

// Tela do Owner pra gerenciar os usuários de uma empresa específica (botão "Usuários" na
// coluna Ações de /empresas) — cria/edita/exclui Tenant Admin/Manager/User daquele tenant.
// Nunca cria OWNER/ANALYST por aqui (ver pages/cadastros para isso).
@Component({
  selector: 'app-tenant-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './tenant-users.component.html',
  styleUrl: './tenant-users.component.scss',
})
export class TenantUsersComponent implements OnInit {
  readonly profileOptions = PROFILE_OPTIONS;

  readonly tenant = signal<Tenant | null>(null);
  readonly users = signal<TenantUser[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly saving = signal(false);
  readonly editingUserId = signal<string | null>(null);

  readonly createForm;
  readonly editForm;

  private tenantId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly tenantsService: TenantsService,
  ) {
    this.createForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.nonNullable.control('', Validators.required),
      profile: this.formBuilder.nonNullable.control<TenantUserProfile>('USER'),
    });

    this.editForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
      profile: this.formBuilder.nonNullable.control<TenantUserProfile>('USER'),
      status: this.formBuilder.nonNullable.control<'ACTIVE' | 'INACTIVE'>('ACTIVE'),
    });
  }

  ngOnInit(): void {
    const tenantId = this.route.snapshot.paramMap.get('id');

    if (!tenantId) {
      this.router.navigate(['/empresas']);
      return;
    }

    this.tenantId = tenantId;
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.tenantsService.list().subscribe({
      next: (tenants) => {
        this.tenant.set(tenants.find((item) => item.id === this.tenantId) ?? null);

        this.tenantsService.listUsers(this.tenantId).subscribe({
          next: (users) => {
            this.users.set(users);
            this.loading.set(false);
          },
          error: () => {
            this.errorMessage.set('Não foi possível carregar os usuários.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar a empresa.');
        this.loading.set(false);
      },
    });
  }

  createUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const payload: CreateTenantUserPayload = this.createForm.getRawValue();

    this.tenantsService.createUser(this.tenantId, payload).subscribe({
      next: (user) => {
        this.users.update((current) => [...current, user]);
        this.createForm.reset({ name: '', email: '', password: '', profile: 'USER' });
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  startEdit(user: TenantUser): void {
    this.editingUserId.set(user.id);
    this.editForm.setValue({
      name: user.name,
      email: user.email,
      profile: user.profile as TenantUserProfile,
      status: user.status,
    });
  }

  cancelEdit(): void {
    this.editingUserId.set(null);
  }

  saveEdit(user: TenantUser): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.tenantsService.updateUser(this.tenantId, user.id, this.editForm.getRawValue()).subscribe({
      next: (updated) => {
        this.users.update((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        this.editingUserId.set(null);
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  removeUser(user: TenantUser): void {
    this.errorMessage.set(null);

    this.tenantsService.removeUser(this.tenantId, user.id).subscribe({
      next: () => {
        this.users.update((current) => current.filter((item) => item.id !== user.id));
      },
      error: (error) => {
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  back(): void {
    this.router.navigate(['/empresas']);
  }

  private extractErrorMessage(error: unknown): string {
    const httpError = error as { error?: { message?: string } };
    return httpError?.error?.message ?? 'Não foi possível concluir a ação.';
  }
}

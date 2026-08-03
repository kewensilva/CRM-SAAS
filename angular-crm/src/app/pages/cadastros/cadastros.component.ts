import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AnalystsService } from '../../core/analysts/analysts.service';
import { SessionService } from '../../core/auth/session.service';
import { OwnersService } from '../../core/owners/owners.service';
import { TenantsService } from '../../core/tenants/tenants.service';
import { CreateUserPayload, UsersService } from '../../core/users/users.service';
import { Analyst } from '../../models/analyst.model';
import { Owner } from '../../models/owner.model';
import { Tenant } from '../../models/tenant.model';
import { TenantUser } from '../../models/tenant.model';

const USER_PROFILE_OPTIONS: { value: CreateUserPayload['profile']; label: string }[] = [
  { value: 'TENANT_ADMIN', label: 'Administrador' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'USER', label: 'Vendedor' },
];

@Component({
  selector: 'app-cadastros',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './cadastros.component.html',
  styleUrl: './cadastros.component.scss',
})
export class CadastrosComponent implements OnInit {
  readonly profileOptions = USER_PROFILE_OPTIONS;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly saving = signal(false);

  readonly users = signal<TenantUser[]>([]);
  readonly analysts = signal<Analyst[]>([]);
  readonly tenants = signal<Tenant[]>([]);
  readonly owners = signal<Owner[]>([]);

  readonly userForm;
  readonly analystForm;
  readonly ownerForm;

  constructor(
    readonly session: SessionService,
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService,
    private readonly analystsService: AnalystsService,
    private readonly tenantsService: TenantsService,
    private readonly ownersService: OwnersService,
  ) {
    this.userForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.nonNullable.control('', Validators.required),
      profile: this.formBuilder.nonNullable.control<CreateUserPayload['profile']>('USER'),
    });

    this.analystForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.nonNullable.control('', Validators.required),
      tenantIds: this.formBuilder.nonNullable.control<string[]>([]),
    });

    this.ownerForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.nonNullable.control('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (this.session.isOwner()) {
      this.tenantsService.list().subscribe({
        next: (tenants) => {
          this.tenants.set(tenants);
          this.analystsService.list().subscribe({
            next: (analysts) => {
              this.analysts.set(analysts);
              this.ownersService.list().subscribe({
                next: (owners) => {
                  this.owners.set(owners);
                  this.loading.set(false);
                },
                error: () => {
                  this.errorMessage.set('Não foi possível carregar os owners.');
                  this.loading.set(false);
                },
              });
            },
            error: () => {
              this.errorMessage.set('Não foi possível carregar os analistas.');
              this.loading.set(false);
            },
          });
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar as empresas.');
          this.loading.set(false);
        },
      });
      return;
    }

    this.usersService.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os usuários.');
        this.loading.set(false);
      },
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.usersService.create(this.userForm.getRawValue()).subscribe({
      next: (user) => {
        this.users.update((current) => [...current, user]);
        this.userForm.reset({ name: '', email: '', password: '', profile: 'USER' });
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  createAnalyst(): void {
    if (this.analystForm.invalid || this.analystForm.getRawValue().tenantIds.length === 0) {
      this.analystForm.markAllAsTouched();
      this.errorMessage.set('Selecione ao menos uma empresa.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.analystsService.create(this.analystForm.getRawValue()).subscribe({
      next: (analyst) => {
        this.analysts.update((current) => [...current, analyst]);
        this.analystForm.reset({ name: '', email: '', password: '', tenantIds: [] });
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  removeAnalyst(analyst: Analyst): void {
    this.analystsService.remove(analyst.id).subscribe({
      next: () => {
        this.analysts.update((current) => current.filter((item) => item.id !== analyst.id));
      },
      error: () => {
        this.errorMessage.set('Não foi possível remover o analista.');
      },
    });
  }

  createOwner(): void {
    if (this.ownerForm.invalid) {
      this.ownerForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.ownersService.create(this.ownerForm.getRawValue()).subscribe({
      next: (owner) => {
        this.owners.update((current) => [...current, owner]);
        this.ownerForm.reset({ name: '', email: '', password: '' });
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  removeOwner(owner: Owner): void {
    this.errorMessage.set(null);

    this.ownersService.remove(owner.id).subscribe({
      next: () => {
        this.owners.update((current) => current.filter((item) => item.id !== owner.id));
      },
      error: (error) => {
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  isSelf(owner: Owner): boolean {
    return owner.id === this.session.userId();
  }

  private extractErrorMessage(error: unknown): string {
    const httpError = error as { error?: { message?: string } };
    return httpError?.error?.message ?? 'Não foi possível concluir a ação.';
  }
}

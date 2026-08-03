import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TenantsService } from '../../../core/tenants/tenants.service';
import { ApiErrorResponse } from '../../../models/auth.model';
import { Tenant } from '../../../models/tenant.model';

const PASSWORD_MIN_LENGTH = 8;
// Mesmas 3 regras que o backend valida (tenant.validator.ts) — checagem client-side é só UX,
// a validação oficial continua no backend.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$/;

interface FieldError {
  field: string;
  message: string;
}

@Component({
  selector: 'app-create-tenant-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-tenant-dialog.component.html',
  styleUrl: './create-tenant-dialog.component.scss',
})
export class CreateTenantDialogComponent {
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  readonly form;

  constructor(
    private readonly dialogRef: MatDialogRef<CreateTenantDialogComponent, Tenant>,
    private readonly formBuilder: FormBuilder,
    private readonly tenantsService: TenantsService,
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      tradeName: [''],
      domain: ['', [Validators.required]],
      adminName: ['', [Validators.required]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: [
        '',
        [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH), Validators.pattern(PASSWORD_PATTERN)],
      ],
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, tradeName, domain, adminName, adminEmail, adminPassword } =
      this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set(null);

    this.tenantsService
      .create({
        name: name ?? '',
        tradeName: tradeName || undefined,
        domain: domain ?? '',
        adminName: adminName ?? '',
        adminEmail: adminEmail ?? '',
        adminPassword: adminPassword ?? '',
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.dialogRef.close(created);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.applyServerError(error);
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private applyServerError(error: HttpErrorResponse): void {
    const apiError = error.error as ApiErrorResponse | undefined;

    if (error.status === 422 && Array.isArray(apiError?.errors)) {
      for (const detail of apiError.errors as FieldError[]) {
        const control = this.form.get(detail.field);
        if (control) {
          control.setErrors({ ...(control.errors ?? {}), server: detail.message });
          control.markAsTouched();
        }
      }
    }

    this.errorMessage.set(apiError?.message ?? 'Não foi possível criar a empresa.');
  }
}

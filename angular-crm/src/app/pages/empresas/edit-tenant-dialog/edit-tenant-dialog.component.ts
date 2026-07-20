import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TenantsService } from '../../../core/tenants/tenants.service';
import { Tenant } from '../../../models/tenant.model';

export interface EditTenantDialogData {
  tenant: Tenant;
}

@Component({
  selector: 'app-edit-tenant-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-tenant-dialog.component.html',
  styleUrl: './edit-tenant-dialog.component.scss',
})
export class EditTenantDialogComponent {
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: EditTenantDialogData,
    private readonly dialogRef: MatDialogRef<EditTenantDialogComponent, Tenant>,
    private readonly formBuilder: FormBuilder,
    private readonly tenantsService: TenantsService,
  ) {
    this.form = this.formBuilder.group({
      name: [this.data.tenant.name, [Validators.required]],
      tradeName: [this.data.tenant.tradeName ?? ''],
      domain: [this.data.tenant.domain, [Validators.required]],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, tradeName, domain } = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set(null);

    // A API só aceita string | undefined em tradeName ("omitir" = não alterar) — não
    // suporta null explícito. Omitir a chave em vez de mandar null quando o campo está vazio.
    this.tenantsService
      .update(this.data.tenant.id, {
        name: name ?? '',
        tradeName: tradeName || undefined,
        domain: domain ?? '',
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.dialogRef.close(updated);
        },
        error: () => {
          this.saving.set(false);
          this.errorMessage.set('Não foi possível salvar as alterações.');
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Tenant } from '../../../models/tenant.model';

export interface DeleteTenantDialogData {
  tenant: Tenant;
}

@Component({
  selector: 'app-delete-tenant-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './delete-tenant-dialog.component.html',
  styleUrl: './delete-tenant-dialog.component.scss',
})
export class DeleteTenantDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: DeleteTenantDialogData,
    private readonly dialogRef: MatDialogRef<DeleteTenantDialogComponent, boolean>,
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

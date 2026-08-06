import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ChangePasswordDialogData {
  userName: string;
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.scss',
})
export class ChangePasswordDialogComponent {
  readonly form;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: ChangePasswordDialogData,
    private readonly dialogRef: MatDialogRef<ChangePasswordDialogComponent, string>,
    private readonly formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      newPassword: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN),
      ]),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue().newPassword);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CreateLeadPayload } from '../../../models/lead.model';

@Component({
  selector: 'app-add-lead-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './add-lead-dialog.component.html',
  styleUrl: './add-lead-dialog.component.scss',
})
export class AddLeadDialogComponent {
  readonly form;

  constructor(
    private readonly dialogRef: MatDialogRef<AddLeadDialogComponent, CreateLeadPayload>,
    private readonly formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', Validators.required),
      email: this.formBuilder.nonNullable.control(''),
      phone: this.formBuilder.nonNullable.control(''),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone } = this.form.getRawValue();
    const payload: CreateLeadPayload = { name: name.trim() };

    if (email.trim()) {
      payload.email = email.trim();
    }
    if (phone.trim()) {
      payload.phone = phone.trim();
    }

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

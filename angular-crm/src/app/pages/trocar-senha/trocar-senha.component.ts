import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ApiErrorResponse } from '../../models/auth.model';

const NEW_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Tela obrigatória de primeiro acesso (ou depois de um reset feito por um Tenant Admin)
// — fora do MainLayoutComponent de propósito, igual ao login: nada de menu lateral até
// a senha ser trocada. session.mustChangePassword() é o que decide se essa tela aparece
// (ver main-layout.component.ts, que redireciona pra cá enquanto a flag for true).
@Component({
  selector: 'app-trocar-senha',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './trocar-senha.component.html',
  styleUrl: './trocar-senha.component.scss',
})
export class TrocarSenhaComponent {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hideCurrentPassword = signal(true);
  readonly hideNewPassword = signal(true);

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(NEW_PASSWORD_PATTERN)]],
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.hideCurrentPassword.update((value) => !value);
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword.update((value) => !value);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.changePassword(currentPassword ?? '', newPassword ?? '').subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        const apiError = error.error as ApiErrorResponse | undefined;
        this.errorMessage.set(
          apiError?.message ?? 'Não foi possível trocar a senha. Tente novamente.',
        );
      },
    });
  }
}

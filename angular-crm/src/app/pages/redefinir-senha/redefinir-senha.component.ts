import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ApiErrorResponse } from '../../models/auth.model';

const NEW_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.scss',
})
export class RedefinirSenhaComponent implements OnInit {
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly success = signal(false);
  readonly hideNewPassword = signal(true);
  // Sem token na URL, nem mostra o formulário — só o link "pedir um novo".
  readonly hasToken = signal(false);

  readonly form;

  private token = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.pattern(NEW_PASSWORD_PATTERN)]],
    });
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    this.token = token ?? '';
    this.hasToken.set(!!token);
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword.update((value) => !value);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword } = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword(this.token, newPassword ?? '').subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        const apiError = error.error as ApiErrorResponse | undefined;
        this.errorMessage.set(
          apiError?.message ?? 'Não foi possível redefinir a senha. Tente novamente.',
        );
      },
    });
  }
}

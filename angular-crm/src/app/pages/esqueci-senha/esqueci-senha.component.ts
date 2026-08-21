import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ApiErrorResponse } from '../../models/auth.model';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.scss',
})
export class EsqueciSenhaComponent {
  readonly isSubmitting = signal(false);
  // Uma vez enviado, sempre mostra a mesma mensagem de sucesso — o backend nunca revela
  // se o e-mail existe, então a tela não pode diferenciar os dois casos.
  readonly submitted = signal(false);
  // Exceção: erro de limite de tentativas (429) é seguro mostrar — não depende de o
  // e-mail existir ou não, é só sobre o IP tentando rápido demais.
  readonly errorMessage = signal<string | null>(null);

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(email ?? '').subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 429) {
          const apiError = error.error as ApiErrorResponse | undefined;
          this.errorMessage.set(
            apiError?.message ?? 'Muitas tentativas em pouco tempo. Tente novamente mais tarde.',
          );
          return;
        }

        // Qualquer outro erro (rede, 500, etc.) ainda mostra sucesso — não é seguro
        // diferenciar "e-mail não existe" de "erro no servidor" pro usuário final.
        this.submitted.set(true);
      },
    });
  }
}

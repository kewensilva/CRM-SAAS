import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { SessionService } from '../../core/auth/session.service';
import { LostReasonsService } from '../../core/lost-reasons/lost-reasons.service';
import { LostReason } from '../../models/lost-reason.model';

@Component({
  selector: 'app-motivos',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './motivos.component.html',
  styleUrl: './motivos.component.scss',
})
export class MotivosComponent implements OnInit {
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly reasons = signal<LostReason[]>([]);
  readonly saving = signal(false);

  readonly form;

  constructor(
    readonly session: SessionService,
    private readonly formBuilder: FormBuilder,
    private readonly lostReasonsService: LostReasonsService,
  ) {
    this.form = this.formBuilder.group({
      label: this.formBuilder.nonNullable.control(''),
    });
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.lostReasonsService.list().subscribe({
      next: (reasons) => {
        this.reasons.set(reasons);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os motivos.');
        this.loading.set(false);
      },
    });
  }

  // Motivo é "próprio" (apagável por quem está logado) quando o escopo bate com o
  // tenant do usuário (Tenant Admin) ou quando é global e quem está logado é o Owner.
  isOwnReason(reason: LostReason): boolean {
    return this.session.isOwner() ? reason.tenantId === null : reason.tenantId !== null;
  }

  get canManage(): boolean {
    const profile = this.session.profile();
    return profile === 'OWNER' || profile === 'TENANT_ADMIN';
  }

  add(): void {
    const label = this.form.getRawValue().label.trim();

    if (!label) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.lostReasonsService.create(label).subscribe({
      next: (reason) => {
        this.reasons.update((current) => [...current, reason]);
        this.form.reset({ label: '' });
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível cadastrar o motivo.');
        this.saving.set(false);
      },
    });
  }

  remove(reason: LostReason): void {
    this.lostReasonsService.remove(reason.id).subscribe({
      next: () => {
        this.reasons.update((current) => current.filter((item) => item.id !== reason.id));
      },
      error: () => {
        this.errorMessage.set('Não foi possível remover o motivo.');
      },
    });
  }
}

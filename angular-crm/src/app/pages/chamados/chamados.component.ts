import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { SessionService } from '../../core/auth/session.service';
import { SupportTicketsService } from '../../core/support-tickets/support-tickets.service';
import {
  SUPPORT_TICKET_MESSAGE_MAX_LENGTH,
  SUPPORT_TICKET_TITLE_MAX_LENGTH,
  SupportTicket,
  SupportTicketWithAuthor,
} from '../../models/support-ticket.model';

const apiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { error?: { message?: string } })?.error?.message ?? fallback;

// Aba Chamados: o usuário do cliente abre um chamado para o atendimento da CMB (o backend
// grava e envia o e-mail para atendimento@contentmarketingbrasil.com). Vendedor vê só os
// próprios chamados; Tenant Admin/Manager, todos da empresa (regra do backend).
@Component({
  selector: 'app-chamados',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './chamados.component.html',
  styleUrl: './chamados.component.scss',
})
export class ChamadosComponent implements OnInit {
  readonly titleMaxLength = SUPPORT_TICKET_TITLE_MAX_LENGTH;
  readonly messageMaxLength = SUPPORT_TICKET_MESSAGE_MAX_LENGTH;

  readonly tickets = signal<SupportTicketWithAuthor[]>([]);
  readonly loading = signal(true);
  readonly listError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly formSuccess = signal<string | null>(null);
  readonly resendingId = signal<string | null>(null);

  // Vendedor só enxerga os próprios chamados — a coluna "aberto por" não acrescenta nada.
  readonly showAuthor = computed(() => this.session.profile() !== 'USER');

  readonly form;

  // resetForm() (e não só form.reset()) limpa também o estado "enviado" do formulário — sem
  // isso o Material pinta os campos vazios de vermelho logo após o envio.
  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly supportTicketsService: SupportTicketsService,
    readonly session: SessionService,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(SUPPORT_TICKET_TITLE_MAX_LENGTH)]],
      message: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(SUPPORT_TICKET_MESSAGE_MAX_LENGTH)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, message } = this.form.getRawValue();

    this.submitting.set(true);
    this.formError.set(null);
    this.formSuccess.set(null);

    this.supportTicketsService.create({ title: title.trim(), message: message.trim() }).subscribe({
      next: (ticket) => {
        this.submitting.set(false);
        this.formDirective?.resetForm();
        this.formSuccess.set(
          ticket.emailSentAt
            ? 'Chamado enviado ao atendimento da CMB. A resposta chegará no seu e-mail.'
            : 'Chamado registrado, mas o e-mail ao atendimento não foi enviado. Use "Reenviar" na lista abaixo.',
        );
        this.loadTickets();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.formError.set(apiErrorMessage(error, 'Não foi possível abrir o chamado.'));
      },
    });
  }

  resend(ticket: SupportTicket): void {
    this.resendingId.set(ticket.id);
    this.listError.set(null);

    this.supportTicketsService.resend(ticket.id).subscribe({
      next: (updated) => {
        this.resendingId.set(null);
        this.tickets.update((list) => list.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));

        if (!updated.emailSentAt) {
          this.listError.set('O e-mail ainda não pôde ser enviado. Tente novamente mais tarde.');
        }
      },
      error: (error: unknown) => {
        this.resendingId.set(null);
        this.listError.set(apiErrorMessage(error, 'Não foi possível reenviar o chamado.'));
      },
    });
  }

  private loadTickets(): void {
    this.loading.set(true);

    this.supportTicketsService.list().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.listError.set(apiErrorMessage(error, 'Não foi possível carregar os chamados.'));
        this.loading.set(false);
      },
    });
  }
}

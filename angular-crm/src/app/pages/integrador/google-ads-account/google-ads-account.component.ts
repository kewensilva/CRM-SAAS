import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { GoogleAdsService } from '../../../core/google-ads/google-ads.service';
import { GoogleAdsAccount, GoogleAdsConnection } from '../../../models/google-ads.model';
import { apiErrorMessage } from '../api-error';
import { formatCustomerId } from '../google-ads-labels';

const CUSTOMER_ID_PATTERN = /^\d{3}-?\d{3}-?\d{4}$/;

// Cartão "Conta Google Ads": conectar a conta Google do cliente (OAuth, como no RD Station) e
// escolher em qual conta de anúncios as conversões entram.
@Component({
  selector: 'app-google-ads-account',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './google-ads-account.component.html',
  styleUrl: './google-ads-account.component.scss',
})
export class GoogleAdsAccountComponent {
  readonly connection = input<GoogleAdsConnection | null>(null);
  readonly changed = output<GoogleAdsConnection>();

  readonly busy = signal(false);
  readonly message = signal<{ text: string; error: boolean } | null>(null);
  readonly accounts = signal<GoogleAdsAccount[] | null>(null);
  readonly picking = signal(false);
  readonly formatCustomerId = formatCustomerId;

  readonly hasAccount = computed(() => Boolean(this.connection()?.customerId));
  readonly showPicker = computed(() => Boolean(this.connection()?.connected) && (this.picking() || !this.hasAccount()));

  readonly manualForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly googleAdsService: GoogleAdsService,
  ) {
    this.manualForm = this.formBuilder.nonNullable.group({
      customerId: ['', [Validators.required, Validators.pattern(CUSTOMER_ID_PATTERN)]],
      loginCustomerId: ['', Validators.pattern(CUSTOMER_ID_PATTERN)],
      customerName: [''],
    });

    // Com developer token no servidor, as contas vêm em lista assim que o seletor aparece.
    effect(() => {
      if (this.showPicker() && this.connection()?.listingAvailable && this.accounts() === null) {
        this.loadAccounts();
      }
    });
  }

  connect(): void {
    this.busy.set(true);
    this.message.set(null);
    this.googleAdsService.getAuthorizationUrl().subscribe({
      next: (url) => window.location.assign(url),
      error: (error: unknown) => {
        this.busy.set(false);
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível iniciar a conexão com o Google Ads.'), error: true });
      },
    });
  }

  disconnect(): void {
    if (!window.confirm('Desconectar a conta do Google Ads? As integrações param de enviar conversões até reconectar.')) {
      return;
    }

    this.run(this.googleAdsService.disconnect(), 'Conta do Google desconectada.');
  }

  chooseAccount(account: GoogleAdsAccount): void {
    this.run(
      this.googleAdsService.selectAccount(account.customerId, account.loginCustomerId, account.name),
      'Conta de anúncios escolhida.',
    );
  }

  saveManual(): void {
    if (this.manualForm.invalid) {
      this.manualForm.markAllAsTouched();
      return;
    }

    const { customerId, loginCustomerId, customerName } = this.manualForm.getRawValue();

    this.run(
      this.googleAdsService.selectAccount(customerId, loginCustomerId || null, customerName.trim() || null),
      'Conta de anúncios salva.',
    );
  }

  private loadAccounts(): void {
    this.accounts.set([]);
    this.googleAdsService.listAccounts().subscribe({
      next: (accounts) => this.accounts.set(accounts),
      error: (error: unknown) =>
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível listar as contas do Google Ads.'), error: true }),
    });
  }

  private run(request: ReturnType<GoogleAdsService['disconnect']>, successText: string): void {
    this.busy.set(true);
    this.message.set(null);
    request.subscribe({
      next: (connection) => {
        this.busy.set(false);
        this.picking.set(false);
        this.message.set({ text: successText, error: false });
        this.changed.emit(connection);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.message.set({ text: apiErrorMessage(error, 'Não foi possível salvar.'), error: true });
      },
    });
  }
}

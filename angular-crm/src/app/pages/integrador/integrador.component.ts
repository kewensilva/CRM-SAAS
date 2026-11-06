import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ConversionSyncService } from '../../core/conversion-sync/conversion-sync.service';
import { ConversionIntegration, ConversionSource } from '../../models/conversion-sync.model';
import { apiErrorMessage } from './api-error';
import { ConversionConnectionComponent } from './conversion-connection/conversion-connection.component';
import { SOURCE_OPTIONS } from './conversion-sources';

// Integrador de conversões offline (estilo Zapier): RD Station / Bitrix24 → Google Ads.
@Component({
  selector: 'app-integrador',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ConversionConnectionComponent],
  templateUrl: './integrador.component.html',
  styleUrl: './integrador.component.scss',
})
export class IntegradorComponent implements OnInit {
  readonly sourceOptions = SOURCE_OPTIONS;
  readonly integrations = signal<ConversionIntegration[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form;

  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly conversionSyncService: ConversionSyncService,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      source: ['' as ConversionSource | '', Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, source } = this.form.getRawValue();

    this.creating.set(true);
    this.errorMessage.set(null);

    this.conversionSyncService.create({ name: name.trim(), source: source as ConversionSource }).subscribe({
      next: (integration) => {
        this.creating.set(false);
        this.formDirective?.resetForm();
        this.integrations.update((list) => [...list, integration]);
      },
      error: (error: unknown) => {
        this.creating.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível criar a conexão.'));
      },
    });
  }

  // Card avisou mudança: conexão excluída (null) sai da lista; senão recarrega (regras vêm junto).
  onConnectionChanged(id: string, updated: ConversionIntegration | null): void {
    if (!updated) {
      this.integrations.update((list) => list.filter((item) => item.id !== id));
      return;
    }

    this.load();
  }

  private load(): void {
    this.conversionSyncService.list().subscribe({
      next: (integrations) => {
        this.integrations.set(integrations);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error, 'Não foi possível carregar as conexões.'));
        this.loading.set(false);
      },
    });
  }
}

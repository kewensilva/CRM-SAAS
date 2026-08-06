import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { LeadsService } from '../../../core/leads/leads.service';
import { ImportLeadsResult } from '../../../models/lead.model';

@Component({
  selector: 'app-import-leads-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './import-leads-dialog.component.html',
  styleUrl: './import-leads-dialog.component.scss',
})
export class ImportLeadsDialogComponent {
  readonly selectedFile = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<ImportLeadsResult | null>(null);

  constructor(
    private readonly dialogRef: MatDialogRef<ImportLeadsDialogComponent, boolean>,
    private readonly leadsService: LeadsService,
  ) {}

  downloadTemplate(): void {
    this.leadsService.downloadTemplate().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modelo-importacao-leads.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.errorMessage.set(null);
    this.result.set(null);
  }

  upload(): void {
    const file = this.selectedFile();

    if (!file) {
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set(null);

    this.leadsService.importFile(file).subscribe({
      next: (result) => {
        this.result.set(result);
        this.uploading.set(false);
      },
      error: (error) => {
        this.uploading.set(false);
        const httpError = error as { error?: { message?: string } };
        this.errorMessage.set(httpError?.error?.message ?? 'Não foi possível importar o arquivo.');
      },
    });
  }

  close(): void {
    this.dialogRef.close(this.result() !== null && this.result()!.createdCount > 0);
  }
}

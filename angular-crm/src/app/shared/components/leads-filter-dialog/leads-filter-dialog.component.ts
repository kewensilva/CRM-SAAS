import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { UsersService } from '../../../core/users/users.service';
import { LeadSource, LeadStatus } from '../../../models/lead.model';
import { TenantUser } from '../../../models/tenant.model';
import { DatePreset, LeadsFilterValue } from '../../utils/lead-filter.util';

export interface LeadsFilterDialogData {
  filter: LeadsFilterValue;
}

export const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'SEM_CONTATO', label: 'Sem contato' },
  { value: 'NAO_ATENDE', label: 'Não atende' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'PERDIDO', label: 'Perdido' },
];

export const SOURCE_OPTIONS: LeadSource[] = ['Site', 'Meta', 'Manual'];

export const PERIOD_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: null, label: 'Data específica' },
  { value: 'THIS_MONTH', label: 'Este mês' },
  { value: 'LAST_30', label: 'Últimos 30 dias' },
  { value: 'LAST_60', label: 'Últimos 60 dias' },
  { value: 'LAST_90', label: 'Últimos 90 dias' },
];

@Component({
  selector: 'app-leads-filter-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './leads-filter-dialog.component.html',
  styleUrl: './leads-filter-dialog.component.scss',
})
export class LeadsFilterDialogComponent implements OnInit {
  readonly statusOptions = STATUS_OPTIONS;
  readonly sourceOptions = SOURCE_OPTIONS;
  readonly periodOptions = PERIOD_OPTIONS;
  readonly users = signal<TenantUser[]>([]);

  readonly form;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: LeadsFilterDialogData,
    private readonly dialogRef: MatDialogRef<LeadsFilterDialogComponent, LeadsFilterValue>,
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService,
  ) {
    this.form = this.formBuilder.group({
      datePreset: [data.filter.datePreset],
      startDate: [data.filter.startDate],
      endDate: [data.filter.endDate],
      statuses: [data.filter.statuses],
      sources: [data.filter.sources],
      responsibleUserId: [data.filter.responsibleUserId],
    });
  }

  ngOnInit(): void {
    this.usersService.list().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.users.set([]),
    });
  }

  get showDatePickers(): boolean {
    return !this.form.controls.datePreset.value;
  }

  apply(): void {
    const { datePreset, startDate, endDate, statuses, sources, responsibleUserId } =
      this.form.getRawValue();

    this.dialogRef.close({
      datePreset: datePreset ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      statuses: statuses ?? [],
      sources: sources ?? [],
      responsibleUserId: responsibleUserId ?? null,
    });
  }

  clear(): void {
    this.dialogRef.close({
      datePreset: null,
      startDate: null,
      endDate: null,
      statuses: [],
      sources: [],
      responsibleUserId: null,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

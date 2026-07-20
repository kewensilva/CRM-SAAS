import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { SessionService } from '../../core/auth/session.service';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, OwnerDashboardComponent, TenantDashboardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(readonly session: SessionService) {}
}

import { Component } from '@angular/core';

import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [UnderConstructionComponent],
  template: `<app-under-construction title="Leads" />`,
})
export class LeadsComponent {}

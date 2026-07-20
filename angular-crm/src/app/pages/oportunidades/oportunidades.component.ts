import { Component } from '@angular/core';

import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';

@Component({
  selector: 'app-oportunidades',
  standalone: true,
  imports: [UnderConstructionComponent],
  template: `<app-under-construction title="Oportunidades" />`,
})
export class OportunidadesComponent {}

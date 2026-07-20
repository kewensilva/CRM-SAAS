import { Component, input } from '@angular/core';

@Component({
  selector: 'app-under-construction',
  standalone: true,
  templateUrl: './under-construction.component.html',
  styleUrl: './under-construction.component.scss',
})
export class UnderConstructionComponent {
  readonly title = input('Em construção');
}

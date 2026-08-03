import { Component, Input, computed, signal } from '@angular/core';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const SIZE = 160;
const STROKE_WIDTH = 28;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ArcSegment extends DonutSegment {
  percentage: number;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-origin-donut-chart',
  standalone: true,
  templateUrl: './origin-donut-chart.component.html',
  styleUrl: './origin-donut-chart.component.scss',
})
export class OriginDonutChartComponent {
  readonly size = SIZE;
  readonly radius = RADIUS;
  readonly strokeWidth = STROKE_WIDTH;

  private readonly segmentsSignal = signal<DonutSegment[]>([]);

  @Input()
  set segments(value: DonutSegment[]) {
    this.segmentsSignal.set(value ?? []);
  }

  readonly total = computed(() => this.segmentsSignal().reduce((sum, segment) => sum + segment.value, 0));

  readonly arcs = computed<ArcSegment[]>(() => {
    const total = this.total();

    if (total === 0) {
      return [];
    }

    let offset = 0;

    return this.segmentsSignal().map((segment) => {
      const percentage = segment.value / total;
      const arcLength = percentage * CIRCUMFERENCE;
      const arc: ArcSegment = {
        ...segment,
        percentage: Math.round(percentage * 100),
        dashArray: `${arcLength} ${CIRCUMFERENCE - arcLength}`,
        dashOffset: -offset,
      };
      offset += arcLength;
      return arc;
    });
  });
}

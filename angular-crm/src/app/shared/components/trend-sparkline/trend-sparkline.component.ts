import { Component, Input, computed, signal } from '@angular/core';

export interface SparklinePoint {
  date: string;
  value: number;
}

const WIDTH = 300;
const HEIGHT = 80;
const TOP_PADDING = 8;
const BOTTOM_PADDING = 6;

@Component({
  selector: 'app-trend-sparkline',
  standalone: true,
  templateUrl: './trend-sparkline.component.html',
  styleUrl: './trend-sparkline.component.scss',
})
export class TrendSparklineComponent {
  @Input() color = '#616161';

  @Input()
  set points(value: SparklinePoint[]) {
    this.pointsSignal.set(value ?? []);
  }

  private readonly pointsSignal = signal<SparklinePoint[]>([]);
  readonly hoverIndex = signal<number | null>(null);

  readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;

  private readonly coords = computed(() => {
    const points = this.pointsSignal();
    const max = Math.max(...points.map((point) => point.value), 1);
    const usableHeight = HEIGHT - TOP_PADDING - BOTTOM_PADDING;
    const step = points.length > 1 ? WIDTH / (points.length - 1) : 0;

    return points.map((point, index) => ({
      x: points.length > 1 ? index * step : WIDTH / 2,
      y: HEIGHT - BOTTOM_PADDING - (point.value / max) * usableHeight,
      value: point.value,
      date: point.date,
    }));
  });

  readonly linePath = computed(() => {
    const coords = this.coords();

    if (coords.length === 0) {
      return '';
    }

    return coords.map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`).join(' ');
  });

  readonly areaPath = computed(() => {
    const coords = this.coords();

    if (coords.length === 0) {
      return '';
    }

    const first = coords[0];
    const last = coords[coords.length - 1];

    return `${this.linePath()} L ${last.x} ${HEIGHT} L ${first.x} ${HEIGHT} Z`;
  });

  readonly gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`;

  readonly hoverPoint = computed(() => {
    const index = this.hoverIndex();
    const coords = this.coords();

    return index === null ? null : (coords[index] ?? null);
  });

  onMouseMove(event: MouseEvent): void {
    const coords = this.coords();

    if (coords.length === 0) {
      return;
    }

    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;

    let closestIndex = 0;
    let closestDistance = Infinity;

    coords.forEach((coord, index) => {
      const distance = Math.abs(coord.x - relativeX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    this.hoverIndex.set(closestIndex);
  }

  onMouseLeave(): void {
    this.hoverIndex.set(null);
  }

  formatDate(date: string): string {
    const [, month, day] = date.split('-');
    return `${day}/${month}`;
  }
}

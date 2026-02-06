import { Component, computed, input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'kdongs-cp-gauge',
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + svgSizes[size()].viewBoxSize + ' ' + svgSizes[size()].viewBoxSize"
      class="fill-transparent {{ type() }} {{ svgSizes[size()].sizeClass }}"
    >
      <path
        class="stroke-slate-300 {{ svgSizes[size()].dialWidth }}"
        d="M 21.716 78.284 A 40 40 0 1 1 78.284 78.284"
      ></path>
      @if (showValue()) {
        <g>
          <text
            [attr.x]="svgSizes[size()].r"
            [attr.y]="svgSizes[size()].r"
            text-anchor="middle"
            class="h-4 {{ gaugeColor().fill }} font-semibold"
          >
            <ng-content></ng-content>
          </text>
        </g>
      }
      <path
        class="{{ gaugeColor().stroke }} {{ svgSizes[size()].valueWidth }}"
        [attr.d]="valuePathD()"
      ></path>
    </svg>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class Gauge {
  /**
   * Calculation functions copied from [https://github.com/naikus/svg-gauge/blob/master/src/gauge.js, https://codepen.io/naikus/pen/BzZoLL].
   * All credits to him.
   */

  /**
   * VARS
   */
  private typeOptions = {
    half: {
      dialRadius: 40,
      dialStartAngle: 180,
      dialEndAngle: 0,
    },
    full: {
      dialRadius: 40,
      dialStartAngle: 135,
      dialEndAngle: 45,
    },
  }
  // if changing the `sizeClass` values, update `viewBoxSize`, `cXcY` and `r` values for its corresponding pixel values
  protected svgSizes = {
    sm: {
      sizeClass: 'h-20 w-20',
      viewBoxSize: 100,
      dialWidth: 'stroke-[2px]',
      valueWidth: 'stroke-[4px]',
      r: 125 / 2 - 10,
    },
    md: {
      sizeClass: 'h-36 w-36',
      viewBoxSize: 100,
      dialWidth: 'stroke-[2px]',
      valueWidth: 'stroke-[4px]',
      r: 125 / 2 - 10,
    },
  }

  /**
   * SIGNALS
   */
  minValue = input<number>(0)
  maxValue = input<number>(100)
  value = input.required<number>()
  size = input.required<'sm' | 'md'>()
  type = input<'full' | 'half'>('full')
  showValue = input<boolean>(true)
  colorMeter = input<{ threshold: number; stroke: string; fill: string }[]>([])
  private colorMeterSorted = computed<{ threshold: number; stroke: string; fill: string }[]>(() =>
    this.colorMeter().length === 0
      ? []
      : [...this.colorMeter()].sort(
          (
            a: { threshold: number; stroke: string; fill: string },
            b: { threshold: number; stroke: string; fill: string }
          ) => a.threshold - b.threshold
        )
  )
  valuePathD = computed<string>(() => {
    let percValue = (100 * (this.value() - this.minValue())) / (this.maxValue() - this.minValue())
    let angle =
      (percValue *
        (360 -
          Math.abs(
            this.typeOptions[this.type()].dialStartAngle -
              this.typeOptions[this.type()].dialEndAngle
          ))) /
      100
    let flag = angle <= 180 ? 0 : 1
    return this.pathString(
      this.typeOptions[this.type()].dialRadius,
      this.typeOptions[this.type()].dialStartAngle,
      angle + this.typeOptions[this.type()].dialStartAngle,
      flag
    )
  })
  gaugeColor = computed<{ stroke: string; fill: string }>(() => {
    if (this.colorMeterSorted().length === 0)
      return { stroke: 'stroke-lime-500', fill: 'fill-lime-500' }
    for (let t = 0; t < this.colorMeterSorted().length; t++) {
      if (
        this.value() > (this.colorMeterSorted()?.[t - 1]?.threshold ?? -1) &&
        this.value() <= this.colorMeterSorted()[t].threshold
      ) {
        return { stroke: this.colorMeterSorted()[t].stroke, fill: this.colorMeterSorted()[t].fill }
      }
    }
    return { stroke: 'stroke-slate-500', fill: 'fill-slate-500' }
  })

  /**
   * FUNCS
   */
  private getCartesian(radius: number, angle: number): { x: number; y: number } {
    let cx = 50
    let cy = 50
    let rad = (angle * Math.PI) / 180
    return {
      x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
      y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000,
    }
  }

  private getDialCoords(
    radius: number,
    startAngle: number,
    endAngle: number
  ): { start: { x: number; y: number }; end: { x: number; y: number } } {
    return {
      start: this.getCartesian(radius, startAngle),
      end: this.getCartesian(radius, endAngle),
    }
  }

  private pathString(
    radius: number,
    startAngle: number,
    endAngle: number,
    largeArc: number = 1
  ): string {
    let coords = this.getDialCoords(radius, startAngle, endAngle)
    return [
      'M',
      coords.start.x,
      coords.start.y,
      'A',
      radius,
      radius,
      0,
      largeArc,
      1,
      coords.end.x,
      coords.end.y,
    ].join(' ')
  }
}

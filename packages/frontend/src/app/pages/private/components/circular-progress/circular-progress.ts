import { DecimalPipe } from '@angular/common'
import { Component, computed, input } from '@angular/core'

@Component({
  selector: 'kdongs-cp-circular-progress',
  imports: [DecimalPipe],
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + svgSizes[size()].viewBoxSize + ' ' + svgSizes[size()].viewBoxSize"
      class="-rotate-90 {{ svgSizes[size()].sizeClass }}"
    >
      <circle
        [attr.r]="svgSizes[size()].r"
        [attr.cx]="svgSizes[size()].cXcY"
        [attr.cy]="svgSizes[size()].cXcY"
        class="fill-transparent stroke-zinc-200 stroke-1 dark:stroke-zinc-500"
        [attr.stroke-dasharray]="strokeDasharray() + 'px'"
        stroke-dashoffset="0"
      />
      <circle
        [attr.r]="svgSizes[size()].r"
        [attr.cx]="svgSizes[size()].cXcY"
        [attr.cy]="svgSizes[size()].cXcY"
        class="fill-transparent {{ warn() ? 'stroke-red-500' : 'stroke-lime-500' }} {{
          svgSizes[size()].strokeSizeClass
        }}"
        [class.animate-pulse]="warn()"
        stroke-linecap="round"
        [attr.stroke-dasharray]="strokeDasharray() + 'px'"
        [attr.stroke-dashoffset]="strokeDashOffset() + 'px'"
      />
      @if (size() !== 'xs' && size() !== 'sm' && showText()) {
        <text
          [attr.x]="svgSizes[size()].r"
          [attr.y]="-svgSizes[size()].r"
          text-anchor="middle"
          class="rotate-90 fill-lime-500 font-bold {{ svgSizes[size()].textSizeClass }} {{
            svgSizes[size()].textFix
          }}"
        >
          <tspan>{{ percentage() | number: '1.0-0' }}</tspan>
          <tspan class="{{ svgSizes[size()].percentTextClass }}">%</tspan>
        </text>
      }
    </svg>
  `,
})
export class CircularProgress {
  /**
   * SIGNALS
   */
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md')
  percentage = input<number, unknown>(0, {
    // Keep values between 0 and 100
    transform: (value: number | unknown) =>
      typeof value === 'number' ? (value < 0 ? 0 : value > 100 ? 100 : value) : 0,
  })
  warn = input<boolean>(false)
  showText = input(true)
  protected strokeDasharray = computed(() => 2 * 3.14 * this.svgSizes[this.size()].r)
  protected strokeDashOffset = computed(
    () => this.strokeDasharray() * ((100 - this.percentage()) / 100)
  )

  /**
   * VARS
   */
  // if changing the `sizeClass` values, update `viewBoxSize`, `cXcY` and `r` values for its corresponding pixel values
  protected svgSizes = {
    xs: {
      sizeClass: 'h-12 w-12',
      viewBoxSize: 48,
      cXcY: 48 / 2,
      r: 48 / 2 - 10,
      strokeSizeClass: 'stroke-[2.5px]',
      textSizeClass: '',
      percentTextClass: '',
      textFix: '',
    },
    sm: {
      sizeClass: 'h-14 w-14',
      viewBoxSize: 56,
      cXcY: 56 / 2,
      r: 56 / 2 - 10,
      strokeSizeClass: 'stroke-[3px]',
      textSizeClass: '',
      percentTextClass: '',
      textFix: '',
    },
    md: {
      sizeClass: 'h-20 w-20',
      viewBoxSize: 80,
      cXcY: 80 / 2,
      r: 80 / 2 - 10,
      strokeSizeClass: 'stroke-[4px]',
      textSizeClass: 'text-[1.1rem]',
      percentTextClass: 'text-[.7rem]',
      textFix: 'translate-x-[0.225rem] translate-y-[0.725rem]',
    },
    lg: {
      sizeClass: 'h-32 w-32',
      viewBoxSize: 128,
      cXcY: 128 / 2,
      r: 128 / 2 - 10,
      strokeSizeClass: 'stroke-[6px]',
      textSizeClass: 'text-[2.2rem]',
      percentTextClass: 'text-[1rem]',
      textFix: '-translate-x-1 translate-y-[0.85rem]',
    },
  }
}

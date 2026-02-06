import { Component, input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'kdongs-cp-loading-bar',
  template: `
    <div
      class="w-full transition-all rounded relative bg-slate-200 dark:bg-slate-700 {{
        sizes[size()]
      }}"
    >
      <div
        class="h-full transition-all rounded absolute animate-[indeterminate_1.5s_infinite_ease-out] {{
          barColors[color()]
        }}"
        style="animation-delay: {{ randomStartDelay }}s"
      ></div>
    </div>
  `,
  styles: `
    @keyframes indeterminate {
      0% {
        left: -0%;
        width: 5%;
      }
      50% {
        left: 50%;
        width: 30%;
      }
      100% {
        left: 100%;
        width: 0;
      }
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'w-full',
  },
})
export class LoadingBar {
  /**
   * SIGNALS
   */
  size = input<'sm' | 'md'>('md')
  color = input<'slate' | 'lime'>('lime')
  randomStartDelay = Math.random() * 1.5

  /**
   * VARS
   */
  protected sizes = {
    sm: 'h-1',
    md: 'h-2',
  }
  protected barColors = {
    slate: 'bg-slate-400 dark:bg-slate-500',
    lime: 'bg-lime-500 dark:bg-lime-500',
  }
}

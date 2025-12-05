import { Component, input } from '@angular/core'

@Component({
  selector: 'kdongs-cp-loading-spinner',
  template: `
    <span class="animate-loading-circular-outer {{ sizes[size()] }}">
      <svg class="block" viewBox="22 22 44 44">
        <circle
          class="animate-loading-circular-inner {{ colors[color()] }}"
          cx="44"
          cy="44"
          r="20.2"
          fill="none"
          stroke-width="3.6"
        ></circle>
      </svg>
    </span>
  `,
  host: {
    class: 'flex transition-opacity duration-150 ease-in-out',
  },
})
export class LoadingSpinner {
  /**
   * SIGNALS
   */
  size = input<'sm' | 'md' | 'lg' | 'xl'>('sm')
  color = input<'white' | 'slate' | 'lime'>('lime')

  /**
   * VARS
   */
  protected sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
    xl: 'h-16 w-16',
  }
  protected colors = {
    white: 'stroke-white',
    slate: 'stroke-slate-300 dark:stroke-slate-600',
    lime: 'stroke-lime-500 dark:stroke-lime-500',
  }
}

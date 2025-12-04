import { Component, input } from '@angular/core'

@Component({
  selector: 'kdongs-cp-loading-spinner',
  imports: [],
  styles: `
    :host {
      display: flex;
      transition-property: opacity;
      transition-duration: 150ms;
      transition-timing-function: ease-in-out;
    }
  `,
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
})
export class LoadingSpinner {
  /**
   * SIGNALS
   */
  size = input<'sm' | 'md' | 'lg' | 'xl'>('sm')
  color = input<'white' | 'neutral' | 'lime'>('lime')

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
    neutral: 'stroke-neutral-300 dark:stroke-neutral-600',
    lime: 'stroke-lime-400 dark:stroke-lime-400',
  }
}

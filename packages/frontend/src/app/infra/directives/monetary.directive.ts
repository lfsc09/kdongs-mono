import { Directive, input } from '@angular/core'

@Directive({
  selector: '[kdongsMonetary]',
  host: {
    '[class.text-red-500]': `(kdongsMonetary() ?? 0) < kmNegativeLowerThan()`,
    '[class.dark:text-red-400]': `(kdongsMonetary() ?? 0) < kmNegativeLowerThan()`,
    '[class.text-green-600]': `(kdongsMonetary() ?? 0) > kmPositiveGreaterThan()`,
    '[class.dark:text-green-600]': `(kdongsMonetary() ?? 0) > kmPositiveGreaterThan()`,
  },
})
export class MonetaryDirective {
  /**
   * SIGNALS
   */
  kdongsMonetary = input.required<number | undefined>()
  kmNegativeLowerThan = input<number>(0)
  kmPositiveGreaterThan = input<number>(0)
}

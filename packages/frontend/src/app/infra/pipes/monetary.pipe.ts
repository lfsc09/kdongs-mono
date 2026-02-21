import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'monetary',
})
export class MonetaryPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    currency?: string | undefined,
    currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name' | undefined,
    digitsInfo?: string | undefined,
    locale?: string | undefined
  ): string {
    return formatMonetary(value, currency, currencyDisplay, digitsInfo, locale)
  }
}

export function formatMonetary(
  value: string | number | null | undefined,
  currency?: string | undefined,
  currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name' | undefined,
  digitsInfo?: string | undefined,
  locale?: string | undefined
): string {
  if (value === null || value === undefined) {
    return 'N.A'
  }

  const val = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(val)) {
    return 'NaN'
  }

  // digitsInfo format: {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
  const [minInt, minFrac, maxFrac] = (digitsInfo ?? '1.2-2')
    .split(/[:\-]/)
    .map(part => parseInt(part, 10))

  if (minInt < 1 || minInt > 21) {
    throw new Error('minIntegerDigits must be between 1 and 21')
  }
  if (minFrac < 0 || minFrac > 100) {
    throw new Error('minFractionDigits must be between 0 and 100')
  }
  if (maxFrac < 0 || maxFrac > 100) {
    throw new Error('maxFractionDigits must be between 0 and 100')
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
   */
  const formatted = new Intl.NumberFormat(locale ?? 'pt-BR', {
    style: 'currency',
    currency: currency ?? '***',
    currencyDisplay: currencyDisplay ?? 'code',
    signDisplay: 'never',
    minimumIntegerDigits: isNaN(minInt) ? undefined : minInt,
    minimumFractionDigits: isNaN(minFrac) ? undefined : minFrac,
    maximumFractionDigits: isNaN(maxFrac) ? undefined : maxFrac,
  }).format(val)

  return val < 0 ? `(${formatted})` : formatted
}

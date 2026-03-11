/**
 * Applies a Brazilian monetary mask to a form control.
 * - Thousands separator: `.`  (inserted automatically)
 * - Decimal separator:   `,`  (typed by the user — not auto-filled)
 * - Only digits, `.` and `,` are accepted; everything else is discarded.
 * - Typing either `.` or `,` is treated as the decimal separator.
 *
 * @param value The value to be transformed into a Brazilian monetary format.
 * @returns The formatted monetary value as a string.
 */
export function transformToMonetaryValue(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    return ''
  }

  // Convert the value to a string and remove all non-digit characters except for '.' and ','
  const stringValue = String(value)
  const cleanedValue = stringValue.replace(/[^0-9.,]/g, '')

  // Replace all occurrences of '.' and ',' with a single ',' to standardize the decimal separator
  const standardizedValue = cleanedValue.replace(/[.,]+/g, ',')

  // Split the standardized value into integer and decimal parts
  const [integerPart, decimalPart] = standardizedValue.split(',')

  // Add thousands separators to the integer part
  const withThousandsSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  // Combine the integer part with the decimal part (if it exists)
  return decimalPart !== undefined
    ? `${withThousandsSeparator},${decimalPart}`
    : withThousandsSeparator
}

export const MONETARY_VALUE_REGEX = /^\d+(\.\d{1,6})?$/
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const validateDate = (value: Date | null) => {
  if (value === null) {
    return { kind: 'date', message: 'Date is invalid.' }
  }

  const isoString = value.toISOString()
  if (!DATE_REGEX.test(isoString)) {
    return { kind: 'date', message: 'Date must be in the format YYYY-MM-DD.' }
  }

  return null
}

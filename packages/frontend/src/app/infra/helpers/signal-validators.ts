export const MONETARY_VALUE_REGEX = /^\d+(\.\d{1,6})?$/
export const PERCENTAGE_VALUE_REGEX = /^\d+(\.\d{1,2})?$/
export const DATE_ISO_STRING_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/

export const validateDate = (value: Date | null) => {
  if (value === null) {
    return null
  }

  const isoString = value?.toISOString() ?? ''
  if (!DATE_ISO_STRING_REGEX.test(isoString)) {
    return { kind: 'date', message: 'Date is invalid' }
  }

  return null
}

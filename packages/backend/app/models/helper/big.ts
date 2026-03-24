import Big from 'big.js'

export const consumeBig = (value: string) => new Big(value)
export const consumeNullableBig = (value: string | null) => (value ? new Big(value) : null)
export const prepareBig = (value: Big) => value.toString()
export const prepareNegativeBig = (value: Big) => {
  if (value.eq(0)) {
    return null
  }
  return value.toString()
}
export const preparePositiveBig = (value: Big) => {
  if (value.eq(0)) {
    return null
  }
  return value.toString()
}
export const prepareNullableBig = (value: Big | null) => (value ? value.toString() : null)
export const prepareNullableNegativeBig = (value: Big | null) => {
  if (!value || value.eq(0)) {
    return null
  }
  return value.toString()
}
export const prepareNullablePositiveBig = (value: Big | null) => {
  if (!value || value.eq(0)) {
    return null
  }
  return value.toString()
}

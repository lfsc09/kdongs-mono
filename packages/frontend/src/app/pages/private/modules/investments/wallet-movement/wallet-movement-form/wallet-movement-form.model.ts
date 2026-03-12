import { hidden, pattern, required, schema, validate } from '@angular/forms/signals'
import {
  MONETARY_VALUE_REGEX,
  validateDate,
} from '../../../../../../infra/helpers/signal-validators'

export interface WalletMovementFormData {
  movementType: string
  institution: string
  dateUtc: Date | null
  details: string
  originCurrencyCode: string
  originAmount: string
  originExchGrossRate: string
  originExchOpFee: string
  originExchOpFeePerc: string
  resultCurrencyCode: string
}

export const walletMovementFormSchema = schema<WalletMovementFormData>(schemaPath => {
  required(schemaPath.movementType, { message: 'This is required' })
  required(schemaPath.dateUtc, { message: 'This is required' })
  validate(schemaPath.dateUtc, ({ value }) => {
    return validateDate(value())
  })
  required(schemaPath.originCurrencyCode, { message: 'This is required' })
  required(schemaPath.originAmount, { message: 'This is required' })
  pattern(schemaPath.originAmount, MONETARY_VALUE_REGEX, { message: 'This number is invalid' })
  hidden(
    schemaPath.originExchGrossRate,
    ({ valueOf }) =>
      valueOf(schemaPath.originCurrencyCode) === valueOf(schemaPath.resultCurrencyCode)
  )
  required(schemaPath.originExchGrossRate, { message: 'This is required' })
  pattern(schemaPath.originExchGrossRate, MONETARY_VALUE_REGEX, {
    message: 'This number is invalid',
  })
  hidden(
    schemaPath.originExchOpFee,
    ({ valueOf }) =>
      valueOf(schemaPath.originCurrencyCode) === valueOf(schemaPath.resultCurrencyCode)
  )
  required(schemaPath.originExchOpFee, { message: 'This is required' })
  pattern(schemaPath.originExchOpFee, MONETARY_VALUE_REGEX, { message: 'This number is invalid' })
  required(schemaPath.resultCurrencyCode, { message: 'This is required' })
})

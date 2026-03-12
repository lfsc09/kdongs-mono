import { required, schema } from '@angular/forms/signals'

export interface WalletFormData {
  name: string
  currencyCode: string
}

export const walletFormSchema = schema<WalletFormData>(schemaPath => {
  required(schemaPath.name, { message: 'This is required' })
  required(schemaPath.currencyCode, { message: 'This is required' })
})

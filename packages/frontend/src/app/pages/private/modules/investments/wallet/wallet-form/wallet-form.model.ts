import { required, schema } from '@angular/forms/signals'

export interface WalletFormData {
  name: string
  currencyCode: string
}

export const createWalletFormSchema = schema<WalletFormData>(schemaPath => {
  required(schemaPath.name)
  required(schemaPath.currencyCode)
})

export const editWalletFormSchema = schema<WalletFormData>(_schemaPath => {})

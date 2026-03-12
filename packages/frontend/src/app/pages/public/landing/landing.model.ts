import { required, schema } from '@angular/forms/signals'

export interface LandingFormData {
  email: string
  password: string
}

export const landingFormSchema = schema<LandingFormData>(schemaPath => {
  required(schemaPath.email, { message: 'Email is required' })
  required(schemaPath.password, { message: 'Password is required' })
})

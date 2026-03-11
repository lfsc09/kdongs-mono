import { required, schema } from '@angular/forms/signals'

export interface LandingFormData {
  email: string
  password: string
}

export const landingFormSchema = schema<LandingFormData>(schemaPath => {
  required(schemaPath.email)
  required(schemaPath.password)
})

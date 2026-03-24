import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const signupValidator = vine.create({
  email: email().unique({ column: 'email', table: 'users' }),
  name: vine.string().nullable(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

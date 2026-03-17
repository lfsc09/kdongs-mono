export class GatewayError extends Error {
  constructor(
    readonly status: number | undefined,
    readonly description: string,
    message: string,
    options: { cause?: Error } = {}
  ) {
    super(message, options)
    this.name = 'GatewayError'
    this.cause = options.cause
  }
}

import { z } from 'zod';

export const AdonisJSErrorSchema = z.array(z.object({ message: z.string() }));
export type AdonisJSError = z.infer<typeof AdonisJSErrorSchema>;

export class GatewayError extends Error {
  constructor(
    readonly status: number | undefined,
    readonly description: string,
    message: string,
    options: { cause?: Error } = {},
  ) {
    super(message, options);
    this.name = 'GatewayError';
    this.cause = options.cause;
  }
}

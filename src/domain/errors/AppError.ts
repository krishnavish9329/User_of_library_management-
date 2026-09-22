/**
 * An error that is safe to show to the client.
 * The error handler returns `message` and `statusCode` as-is;
 * anything else is treated as a 500 and hidden.
 */
export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = "AppError";
  }
}

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Pehle pura error console me dump karo (message + stack), phir client ko bhejo.
  console.error(`[error] ${_req.method} ${_req.originalUrl} -> validation failed:`, JSON.stringify(err.errors, null, 2));

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors,
    });
    return;
  }

  const statusCode = err.message.includes("credentials") || err.message.includes("exists") ? 400 : 500;

  console.error(
    `[error] ${_req.method} ${_req.originalUrl} -> ${statusCode}`,
    err instanceof Error ? (err.stack || err.message) : err
  );

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
  });
};

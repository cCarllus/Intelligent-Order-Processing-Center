import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

type ErrorWithStatus = Error & {
  status?: number;
};

export function notFoundHandler(_request: Request, response: Response): void {
  response.status(404).json({ message: 'Rota não encontrada.' });
}

export function errorHandler(
  error: ErrorWithStatus,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Dados inválidos.',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  console.error(error);

  response.status(error.status ?? 500).json({
    message: error.message || 'Erro interno do servidor.',
  });
}

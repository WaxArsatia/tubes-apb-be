import type { ErrorFields } from "@/common/http/envelope";

export class AppError extends Error {
  public readonly status: number;
  public readonly errors?: ErrorFields;

  constructor(status: number, message: string, errors?: ErrorFields) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const badRequest = (message: string, errors?: ErrorFields) => {
  return new AppError(400, message, errors);
};

export const unauthorized = (message = "Unauthorized") => {
  return new AppError(401, message);
};

export const notFound = (message: string) => {
  return new AppError(404, message);
};

export const conflict = (message: string, errors?: ErrorFields) => {
  return new AppError(409, message, errors);
};

export const unprocessableEntity = (message: string, errors?: ErrorFields) => {
  return new AppError(422, message, errors);
};

export const payloadTooLarge = (message: string) => {
  return new AppError(413, message);
};

export const unsupportedMediaType = (message: string) => {
  return new AppError(415, message);
};

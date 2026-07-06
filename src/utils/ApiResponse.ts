import { Response } from 'express';

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export class ApiResponse {
  static send(
    res: Response,
    statusCode: number,
    message: string,
    data: unknown = null,
    meta: Meta | null = null
  ) {
    return res.status(statusCode).json({
      success: statusCode < 400,
      statusCode,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  static ok(res: Response, message: string, data: unknown = null, meta: Meta | null = null) {
    return this.send(res, 200, message, data, meta);
  }

  static created(res: Response, message: string, data: unknown = null) {
    return this.send(res, 201, message, data);
  }
}

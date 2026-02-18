import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponseDto, ResponseCode } from "../dto/response.dto";

const isDevelopment = process.env.NODE_ENV !== "production";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ResponseCode.INTERNAL_ERROR;
    let message = "Internal server error";
    let errors: Array<{ field?: string; message: string; code?: string }> = [];

    // Handle validation errors (BadRequestException)
    if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      code = ResponseCode.VALIDATION_ERROR;
      message = "Validation error";

      const exceptionResponse = exception.getResponse() as any;
      if (exceptionResponse.message) {
        if (Array.isArray(exceptionResponse.message)) {
          errors = exceptionResponse.message.map((err: any) => ({
            field: err.property,
            message: Object.values(err.constraints || {}).join(", "),
            code: "VALIDATION_ERROR",
          }));
        } else if (typeof exceptionResponse.message === "string") {
          message = exceptionResponse.message;
        }
      }
    }
    // Handle not found errors
    else if (exception instanceof NotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      code = ResponseCode.NOT_FOUND;
      message = exception.message || "Resource not found";
    }
    // Handle forbidden errors
    else if (exception instanceof ForbiddenException) {
      statusCode = HttpStatus.FORBIDDEN;
      code = ResponseCode.FORBIDDEN;
      message = exception.message || "Access forbidden";
    }
    // Handle unauthorized errors
    else if (exception instanceof UnauthorizedException) {
      statusCode = HttpStatus.UNAUTHORIZED;
      code = ResponseCode.UNAUTHORIZED;
      message = exception.message || "Unauthorized access";
    }
    // Handle conflict errors
    else if (exception instanceof ConflictException) {
      statusCode = HttpStatus.CONFLICT;
      code = ResponseCode.CONFLICT;
      message = exception.message || "Resource conflict";
    }
    // Handle generic HTTP exceptions
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message || "HTTP exception";

      const exceptionResponse = exception.getResponse() as any;
      if (exceptionResponse.message) {
        message = exceptionResponse.message;
      }

      // Map status code to response code
      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          code = ResponseCode.VALIDATION_ERROR;
          break;
        case HttpStatus.UNAUTHORIZED:
          code = ResponseCode.UNAUTHORIZED;
          break;
        case HttpStatus.FORBIDDEN:
          code = ResponseCode.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          code = ResponseCode.NOT_FOUND;
          break;
        case HttpStatus.CONFLICT:
          code = ResponseCode.CONFLICT;
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          code = ResponseCode.RATE_LIMIT_EXCEEDED;
          break;
        case HttpStatus.SERVICE_UNAVAILABLE:
          code = ResponseCode.SERVICE_UNAVAILABLE;
          break;
        default:
          code = ResponseCode.INTERNAL_ERROR;
      }
    }
    // Log the actual error for debugging (development only)
    else {
      if (isDevelopment) {
        console.error("Unhandled exception:", exception);
        if (exception.stack) {
          console.error("Stack trace:", exception.stack);
        }
      } else {
        console.error(`Unhandled exception: ${exception.message || exception}`);
      }
    }

    const errorResponse = new ErrorResponseDto(
      code,
      message,
      statusCode,
      path,
      errors,
    );

    response.status(statusCode).json(errorResponse);
  }
}

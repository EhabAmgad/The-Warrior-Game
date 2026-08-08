import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. تحديد كود الحالة الإرجاعي بحسب نوع الخطأ
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  // 2. معالجة خطأ تكرار البريد في MongoDB (Duplicate Key Error)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Email already exists";
  }

  // 3. معالجة أخطاء التحقق Mongoose Validation Error
  if (err.name === "ValidationError" || err.errors) {
    const formattedErrors: { [key: string]: string } = {};
    if (err.errors && typeof err.errors === "object") {
      for (const key in err.errors) {
        formattedErrors[key] = err.errors[key].message;
      }
      errors = formattedErrors;
    }
    statusCode = 400;
    if (!err.message || err.name === "ValidationError") {
      message = "Invalid received data !";
    }
  }

  // 4. إرجاع الرد دائماً لمنع تعليق الفرونت إند
  res.status(statusCode).json({
    status: "error",
    success: false,
    message: message,
    errors: errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
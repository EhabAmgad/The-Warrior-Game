import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const validator = (viewPage?: any) => (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let formattedErrors: any = {};
    errors.array().forEach((err: any) => {
      formattedErrors[err.path] = err.msg;
    });

    const error: any = new Error("Validation Failed!!");
    error.statusCode = 400;
    error.errors = formattedErrors;

    console.log('error found');
    console.log(formattedErrors);

    // 🔴 التعديل هنا: استخدام return next(error) بدلاً من throw error
    return next(error);
  }

  next();
};

export default validator;
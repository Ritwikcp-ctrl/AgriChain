import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

const requestValidation =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, errors: error.issues });
      }
      next(error);
    }
  };

export default requestValidation;

import { NextFunction, Request, Response } from 'express';

// Verify Tenant in Cookies
export const verifyTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Get Tenant Code from Cookies
  const xsrfCookie = (req.headers.xsrfcookie as string)?.split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];

  // Verify Tenant Code
  if ((xsrfCookie === undefined || xsrfCookie === null)) {
    res.status(401).json({
      message: 'Tenant Code is required'
    });
  } else {
    next();
  }
};

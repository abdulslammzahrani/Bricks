import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userName?: string;
    userRole?: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      error: "غير مصرح", 
      message: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة" 
    });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      error: "غير مصرح", 
      message: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة" 
    });
  }
  
  if (req.session.userRole !== "admin") {
    return res.status(403).json({ 
      error: "ممنوع", 
      message: "ليس لديك صلاحية الوصول إلى لوحة الإدارة" 
    });
  }
  
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  next();
}

import { Request, Response, NextFunction } from 'express';

export type RoleType = 'super_admin' | 'president' | 'secretary' | 'treasurer' | 'committee' | 'member';

export function requireRoles(allowedRoles: RoleType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please login with mobile OTP.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
}

// All users can access community directory and features instantly via OTP
export function requireApproved(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Please login with your mobile OTP.' });
    return;
  }
  next();
}
